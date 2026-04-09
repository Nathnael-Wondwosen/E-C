# Customer Portal

Next.js storefront for the current platform runtime.

## Local run

```bash
npm install
npm run dev --workspace=frontend/customer-portal
```

The app runs on `http://localhost:3005`.

## Required environment

- `NEXT_PUBLIC_API_BASE_URL`

## Optional environment

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_ALLOW_MOCK_FALLBACKS=false`
- `NEXT_PUBLIC_HTTP_TIMEOUT_MS`
- `NEXT_PUBLIC_HTTP_RETRIES`

## Production notes

- The API gateway must be deployed first.
- Canonical browsing routes are `/marketplace`, `/markets/[scope]`, and `/products/[id]`.
- Production should keep mock fallbacks disabled.
