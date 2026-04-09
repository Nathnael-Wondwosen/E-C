# Current Architecture (Source of Truth)

Last updated: 2026-03-30

This document reflects the actual code currently in this repository, not historical plans.

## Runtime Applications

The repo currently has 5 runnable apps:

1. API Gateway (primary backend): `services/api-gateway`
2. Identity Service (canonical auth): `services/identity-service`
3. User Service (minimal shell service): `services/user-service`
4. Admin Dashboard (Next.js): `frontend/admin-dashboard`
5. Customer Portal (Next.js): `frontend/customer-portal`

## Real Backend Topology

Most backend behavior is currently implemented inside the API gateway.

- `services/api-gateway` owns:
  - authentication + JWT issuance/verification
  - admin auth
  - user profile/cart/wishlist/orders routes
  - product/category/hero/banner/special-offer/news/services/partners CRUD
  - Cloudinary upload endpoints
  - direct MongoDB reads/writes
- `services/identity-service` is the canonical auth service when `IDENTITY_SERVICE_URL` is configured.
- `services/user-service` currently exposes only `GET /` and `GET /health` and is not in the main production request path.

## Gateway Environment Variables

Required for startup:

- `MONGODB_URI`
- `JWT_SECRET`

Required for admin login success:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Optional but actively supported:

- `PORT` (default `3000`)
- `MONGODB_DB_NAME` (default `ecommerce_platform`)
- `JWT_EXPIRES_IN` (default `7d`)
- `CORS_ORIGIN` (comma-separated)
- `GOOGLE_CLIENT_ID`
- `IDENTITY_SERVICE_URL`
- `ENFORCE_IDENTITY_BOUNDARY`
- `EXPOSE_PASSWORD_RESET_TOKEN`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `RATE_LIMIT_PER_MINUTE`
- `REDIS_URL`

## Frontend Integration

Both Next.js frontends call the gateway through `NEXT_PUBLIC_API_BASE_URL` with a fallback of `http://localhost:3000`.

- Customer portal runs on `3005`
- Admin dashboard runs on `3006`

For production, both frontends should run with mock fallbacks disabled:

- `NEXT_PUBLIC_ALLOW_MOCK_FALLBACKS=false`

## Run Commands

Recommended local start from repo root:

1. `npm install`
2. `npm run dev`

Equivalent explicit services:

1. `npm run dev --workspace=services/api-gateway`
2. `npm run dev --workspace=services/identity-service`
3. `npm run dev --workspace=frontend/customer-portal`
4. `npm run dev --workspace=frontend/admin-dashboard`

## Known Mismatches vs Legacy Docs

- Some deployment docs still describe a broader microservice topology than the current code.
- `render.yaml` and env templates should be treated as the deploy source of truth over older markdown guides.
- `services/api-gateway/server.js` still has route duplication cleanup remaining in categories registration.
