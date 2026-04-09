# Admin Dashboard

Next.js admin application for the current platform runtime.

## Local run

```bash
npm install
npm run dev --workspace=frontend/admin-dashboard
```

The app runs on `http://localhost:3006`.

## Required environment

- `NEXT_PUBLIC_API_BASE_URL`

## Optional environment

- `NEXT_PUBLIC_ALLOW_MOCK_FALLBACKS=false`
- `NEXT_PUBLIC_HTTP_TIMEOUT_MS`
- `NEXT_PUBLIC_HTTP_RETRIES`

## Production scope

The deployable admin surface is centered on:

- dashboard summary
- products
- categories
- banners
- partners
- services
- section managers
- scoped admin routing

## Production notes

- Admin auth depends on `ADMIN_USERNAME` and `ADMIN_PASSWORD` on the API gateway.
- Production should keep mock fallbacks disabled.
