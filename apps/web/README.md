# YouTok Web (Next.js)

This folder contains the standalone Next.js frontend for YouTok.

## Dev

From `apps/web`:

```bash
# Required (server-only) env vars used to talk to Laravel internal API.
# Defaults match docker-compose.yml.
export LARAVEL_BASE_URL="http://localhost:8080"
export INTERNAL_API_SECRET="change-me"

npm install
npm run dev
```

Then open: http://localhost:3000

## i18n

- Supported locales: `fr`, `en`
- Locale is stored in `youtok_locale` cookie.
- URLs are currently locale-prefixed: `/<locale>/...`.

