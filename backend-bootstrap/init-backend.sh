#!/usr/bin/env bash
set -euo pipefail

cd /var/www/backend

echo "[backend_init] ensuring Laravel project exists in /var/www/backend" >&2

if [ ! -f artisan ]; then
  echo "[backend_init] scaffolding Laravel 11 into /var/www/backend" >&2
  composer create-project laravel/laravel:^11.0 .
fi

if [ ! -f vendor/autoload.php ]; then
  echo "[backend_init] installing composer dependencies" >&2
  composer install --no-interaction
fi

if [ ! -f .env ]; then
  echo "[backend_init] creating .env from .env.example" >&2
  cp .env.example .env
fi

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

# Laravel 11's default .env.example uses sqlite. In Docker we run MySQL and we
# also want to avoid requiring DB tables for sessions on the first boot.
#
# We sync/force the relevant values into .env from container environment
# variables (docker-compose.yml), and export them so the current init process
# (artisan, MySQL wait, etc.) is consistent too.
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
}

# Avoid hard-to-debug mismatches between web and CLI caused by stale cached
# config/routes in the bind-mounted ./backend volume.
rm -f bootstrap/cache/config.php bootstrap/cache/routes*.php bootstrap/cache/events.php || true

# Ensure APP_KEY exists
if ! grep -q "^APP_KEY=base64:" .env; then
  echo "[backend_init] generating APP_KEY" >&2
  php artisan key:generate --force
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

# If .env was created from Laravel's default .env.example earlier, it may be
# missing the repo-specific variables added by our overrides.
# (Laravel's Dotenv loader is immutable, so container env still wins; this is
# just for convenience when inspecting / editing .env.)
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
  else
    echo "[backend_init] npm not found; skipping frontend asset build" >&2
  fi
fi

# Migrate + seed (admin user)
echo "[backend_init] running migrations" >&2
php artisan migrate --force

echo "[backend_init] seeding" >&2
php artisan db:seed --force

echo "[backend_init] done" >&2
