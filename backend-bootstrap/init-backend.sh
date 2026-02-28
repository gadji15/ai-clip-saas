#!/usr/bin/env bash
set -euo pipefail

cd /var/www/backend

fix_env_perms() {
  if [ -f .env ]; then
    chown "${DOCKER_UID:-1000}":"${DOCKER_GID:-1000}" .env 2>/dev/null || true
    chmod 660 .env 2>/dev/null || true
  fi
}

normalize_app_key() {
  # If APP_KEY appears multiple times, Laravel's Dotenv loader will use the first.
  # Keep exactly one (the last non-empty value).
  if [ -f .env ]; then
    local val
    val="$(grep -E '^APP_KEY=' .env | tail -n 1 | cut -d= -f2- | tr -d '[:space:]')"
    if [ -n "$val" ]; then
      sed -i '/^APP_KEY=/d' .env
      echo "APP_KEY=${val}" >> .env
    fi
    fix_env_perms
  fi
}

# If running as root (backend_init), fix ownership once then drop privileges.
if [ "$(id -u)" = "0" ]; then
  chown -R "${DOCKER_UID:-1000}":"${DOCKER_GID:-1000}" /var/www/backend || true
  chmod -R ug+rwX /var/www/backend || true

  # Re-run the script as the non-root runtime user to avoid creating root-owned files
  # like backend/.env (root:root 0600).
  if [ -z "${BACKEND_INIT_DROPPED_PRIVS:-}" ] && command -v gosu >/dev/null 2>&1; then
    export BACKEND_INIT_DROPPED_PRIVS=1
    exec gosu "${DOCKER_UID:-1000}:${DOCKER_GID:-1000}" /bin/bash /bootstrap/init-backend.sh
  fi
fi

echo "[backend_init] ensuring Laravel project exists in /var/www/backend" >&2

# If the bind-mounted directory is non-empty but doesn't contain a Laravel app,
# composer create-project will fail.
if [ ! -f artisan ]; then
  if [ -e .env ] || [ -e composer.json ] || [ -d vendor ]; then
    echo "[backend_init] artisan missing but project files exist; continuing" >&2
  else
    if [ "$(ls -A 2>/dev/null | wc -l | tr -d ' ')" != "0" ]; then
      echo "[backend_init] ERROR: /var/www/backend is not empty but no Laravel project was found." >&2
      echo "[backend_init] If this is due to permission issues, run on the host:" >&2
      echo "[backend_init]   sudo chown -R \"$USER\":\"$USER\" backend" >&2
      echo "[backend_init] or delete the directory:" >&2
      echo "[backend_init]   sudo rm -rf backend" >&2
      exit 1
    fi

    echo "[backend_init] scaffolding Laravel 11 into /var/www/backend" >&2
    composer create-project laravel/laravel:^11.0 .
  fi
fi

if [ ! -f vendor/autoload.php ]; then
  echo "[backend_init] installing composer dependencies" >&2
  composer install --no-interaction
fi

if [ ! -f .env ]; then
  echo "[backend_init] creating .env from .env.example" >&2
  cp .env.example .env
fi

fix_env_perms

upsert_env_kv() {
  local key="$1"
  local value="$2"
  local file="${3:-.env}"

  local tmp
  tmp="$(mktemp)"

  awk -v k="$key" -v v="$value" '
    BEGIN { done = 0 }
    $0 ~ ("^" k "=") {
      if (!done) {
        print k "=" v
        done = 1
      }
      next
    }
    { print }
    END {
      if (!done) {
        print k "=" v
      }
    }
  ' "$file" > "$tmp"

  mv "$tmp" "$file"
}

# Sync runtime env to .env so artisan + app are consistent.
{
  echo "[backend_init] syncing runtime env to .env" >&2

  DB_CONNECTION_EFFECTIVE="${DB_CONNECTION:-mysql}"
  DB_HOST_EFFECTIVE="${DB_HOST:-db}"
  DB_PORT_EFFECTIVE="${DB_PORT:-3306}"
  DB_DATABASE_EFFECTIVE="${DB_DATABASE:-backend}"
  DB_USERNAME_EFFECTIVE="${DB_USERNAME:-backend}"
  DB_PASSWORD_EFFECTIVE="${DB_PASSWORD:-backend}"

  QUEUE_CONNECTION_EFFECTIVE="${QUEUE_CONNECTION:-database}"
  SESSION_DRIVER_EFFECTIVE="${SESSION_DRIVER:-file}"
  CACHE_STORE_EFFECTIVE="${CACHE_STORE:-file}"

  upsert_env_kv DB_CONNECTION "$DB_CONNECTION_EFFECTIVE"
  upsert_env_kv DB_HOST "$DB_HOST_EFFECTIVE"
  upsert_env_kv DB_PORT "$DB_PORT_EFFECTIVE"
  upsert_env_kv DB_DATABASE "$DB_DATABASE_EFFECTIVE"
  upsert_env_kv DB_USERNAME "$DB_USERNAME_EFFECTIVE"
  upsert_env_kv DB_PASSWORD "$DB_PASSWORD_EFFECTIVE"

  upsert_env_kv QUEUE_CONNECTION "$QUEUE_CONNECTION_EFFECTIVE"
  upsert_env_kv SESSION_DRIVER "$SESSION_DRIVER_EFFECTIVE"
  upsert_env_kv CACHE_STORE "$CACHE_STORE_EFFECTIVE"

  export DB_CONNECTION="$DB_CONNECTION_EFFECTIVE"
  export DB_HOST="$DB_HOST_EFFECTIVE"
  export DB_PORT="$DB_PORT_EFFECTIVE"
  export DB_DATABASE="$DB_DATABASE_EFFECTIVE"
  export DB_USERNAME="$DB_USERNAME_EFFECTIVE"
  export DB_PASSWORD="$DB_PASSWORD_EFFECTIVE"

  export QUEUE_CONNECTION="$QUEUE_CONNECTION_EFFECTIVE"
  export SESSION_DRIVER="$SESSION_DRIVER_EFFECTIVE"
  export CACHE_STORE="$CACHE_STORE_EFFECTIVE"

  fix_env_perms
}

rm -f bootstrap/cache/config.php bootstrap/cache/routes*.php bootstrap/cache/events.php || true

mkdir -p storage/framework/{cache,data,sessions,views} storage/logs bootstrap/cache
chown -R "${DOCKER_UID:-1000}":"${DOCKER_GID:-1000}" storage bootstrap/cache || true
chmod -R ug+rwX storage bootstrap/cache || true

# Ensure APP_KEY exists (and only appears once).
normalize_app_key

if ! grep -q "^APP_KEY=" .env || [ "$(grep -E "^APP_KEY=" .env | head -n 1 | cut -d= -f2- | tr -d '[:space:]')" = "" ]; then
  echo "[backend_init] generating APP_KEY" >&2
  php artisan key:generate --force
  normalize_app_key
fi

# Install Breeze (Blade) once
if [ ! -f routes/auth.php ]; then
  echo "[backend_init] installing Laravel Breeze (Blade)" >&2
  composer require laravel/breeze --dev --no-interaction
  php artisan breeze:install blade --no-interaction
fi

# Apply repo-managed overrides (controllers, models, routes, etc.)
# We use tar to avoid requiring rsync in the container.
echo "[backend_init] applying backend overrides" >&2
mkdir -p /var/www/backend

tar -C /bootstrap/overrides -cf - . | tar -C /var/www/backend -xf -

# Guard against accidental "- >" sequences that break PHP parsing in Blade.
if command -v find >/dev/null 2>&1 && command -v sed >/dev/null 2>&1; then
  find resources/views -type f -name "*.blade.php" -print0 2>/dev/null | xargs -0 sed -i -E 's/-[[:space:]]*>/->/g' 2>/dev/null || true
fi

rm -f storage/framework/views/*.php 2>/dev/null || true
php artisan view:clear || true

# Append missing repo-specific vars for convenience.
for kv in \
  "ADMIN_EMAILS=${ADMIN_EMAILS:-admin@example.com}" \
  "ADMIN_PASSWORD=${ADMIN_PASSWORD:-password}" \
  "INTERNAL_API_SECRET=${INTERNAL_API_SECRET:-change-me}" \
  "VIDEO_WORKER_BASE_URL=${VIDEO_WORKER_BASE_URL:-}" \
  "VIDEO_WORKER_API_KEY=${VIDEO_WORKER_API_KEY:-}" \
  "VIDEO_WORKER_CALLBACK_SECRET=${VIDEO_WORKER_CALLBACK_SECRET:-change-me-too}" \
  "WORKER_CALLBACK_URL=${WORKER_CALLBACK_URL:-http://backend:8000/api/worker/callback}" \
  "SHARED_STORAGE_ROOT=${SHARED_STORAGE_ROOT:-/shared}" \
; do
  key="${kv%%=*}"
  if ! grep -q "^${key}=" .env; then
    echo "${kv}" >> .env
  fi
done

fix_env_perms

# Wait for MySQL
if [ "${DB_CONNECTION:-}" = "mysql" ]; then
  echo "[backend_init] waiting for MySQL" >&2
  php -r '
    $host = getenv("DB_HOST");
    $port = getenv("DB_PORT") ?: "3306";
    $db = getenv("DB_DATABASE");
    $user = getenv("DB_USERNAME");
    $pass = getenv("DB_PASSWORD");
    $dsn = "mysql:host={$host};port={$port};dbname={$db}";
    $started = time();
    while (true) {
      try {
        new PDO($dsn, $user, $pass);
        break;
      } catch (Throwable $e) {
        if (time() - $started > 120) {
          fwrite(STDERR, "mysql_timeout: {$e->getMessage()}\n");
          exit(1);
        }
        sleep(2);
      }
    }
  ';
fi

# NPM assets (Tailwind + Vite)
if [ ! -f public/build/manifest.json ]; then
  if command -v npm >/dev/null 2>&1; then
    echo "[backend_init] building frontend assets" >&2
    npm install
    npm run build
  fi
fi

echo "[backend_init] running migrations" >&2
php artisan migrate --force

echo "[backend_init] seeding" >&2
php artisan db:seed --force

echo "[backend_init] done" >&2
