# Microservice Route Ownership

## Service Boundaries

- `api-gateway`: edge routing, catalog/content/admin orchestration, cart/wishlist/order aggregation APIs.
- `identity-service`: authentication and identity profile ownership.
- `user-service`: currently infra placeholder (`/`, `/health`), no owned domain routes yet.

## Ownership Matrix

- `POST /api/auth/register`: `identity-service` (gateway delegates when `IDENTITY_SERVICE_URL` is configured).
- `POST /api/auth/login`: `identity-service` (gateway delegates when `IDENTITY_SERVICE_URL` is configured).
- `POST /api/auth/admin/login`: `identity-service` (gateway delegates when `IDENTITY_SERVICE_URL` is configured).
- `GET /api/auth/me`: `identity-service`.
- `GET /api/users/:id`: `identity-service` (gateway now delegates when `IDENTITY_SERVICE_URL` is configured).
- `PUT /api/users/:id`: `identity-service` (gateway now delegates when `IDENTITY_SERVICE_URL` is configured).
- `GET/POST/DELETE /api/users/:id/cart*`: `api-gateway` commerce aggregate.
- `GET/POST/DELETE /api/users/:id/wishlist*`: `api-gateway` commerce aggregate.
- `GET/POST /api/users/:id/orders*`: `api-gateway` commerce aggregate.
- Catalog/content/services/partners/upload routes: `api-gateway`.

## Enforcement

- `api-gateway` supports `ENFORCE_IDENTITY_BOUNDARY=true`.
- When enabled and `IDENTITY_SERVICE_URL` is missing, gateway auth routes (`/api/auth/login`, `/api/auth/register`, `/api/auth/google`, `/api/auth/admin/login`) return `503` instead of falling back to local auth handling.
- When enabled and `IDENTITY_SERVICE_URL` is missing, gateway profile routes (`GET/PUT /api/users/:id`) return `503` instead of falling back to local DB profile handling.
- This prevents accidental identity domain drift back into gateway storage.
