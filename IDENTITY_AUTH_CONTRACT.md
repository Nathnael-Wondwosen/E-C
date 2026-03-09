# Identity/Auth Contract (Cross-Project)

Last updated: 2026-03-09

This document defines the canonical identity contract to let `E-C` and `tradethiopia` share authentication during merge.

## Data Store Baseline

- Identity persistence uses MongoDB.
- Primary connection env: `MONGODB_URI` (temporary alias `MONGO_URI` supported for migration).

## Canonical JWT

### Signing

- Algorithm: `HS256` (initial phase)
- Secret env var: `JWT_SECRET`
- Access token TTL: `1h` (configurable via `JWT_EXPIRES_IN`)

### Claims

```json
{
  "sub": "user_id_string",
  "email": "user@example.com",
  "role": "admin",
  "roles": ["admin"],
  "source": "identity-service",
  "iat": 1700000000,
  "exp": 1700003600
}
```

### Rules

1. `sub` is required and is the canonical user ID.
2. `role` is primary legacy-compatible role.
3. `roles` is the forward-compatible multi-role array.
4. Consumers must authorize using `roles` if available; fallback to `role`.

## Canonical User Shape

```json
{
  "id": "string",
  "email": "string",
  "username": "string",
  "displayName": "string",
  "status": "active|inactive",
  "roles": ["admin"],
  "profile": {
    "phone": "string",
    "location": "string",
    "jobTitle": "string"
  },
  "sourceRefs": {
    "ecUserId": "string|null",
    "tradUserId": "string|null"
  },
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

## Role Mapping

Map existing trad roles into canonical normalized values:

- `admin` -> `admin`
- `HR` -> `hr`
- `sales` -> `sales`
- `salesmanager` -> `sales_manager`
- `customerservice` -> `customer_service`
- `CustomerSuccessManager` -> `customer_success_manager`
- `SocialmediaManager` -> `social_media_manager`
- `IT` -> `it`
- `Instructor` -> `instructor`
- `supervisor` -> `supervisor`
- `finance` -> `finance`
- `reception` -> `reception`
- `COO` -> `coo`
- `tradextv`, `TradeXTV`, `TETV` -> `tradex_tv`
- `Enisra` -> `enisra`
- `EventManager` -> `event_manager`

## Endpoints (Identity Service)

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `PATCH /api/users/:id/roles`

Compatibility aliases during migration:

- `POST /api/auth/admin/login` (for E-C admin dashboard compatibility)
- `POST /api/users/login` (for trad compatibility, optional temporary alias)

## Migration Compatibility Rules

1. Keep returning legacy fields expected by each frontend (`_id`, `role`, etc.) during transition.
2. Add canonical fields without removing old fields until cutover is complete.
3. Only one service issues new tokens after cutover start: `identity-service`.
4. Existing services must switch from local login logic to token validation middleware.

## Security Baseline

1. Always hash passwords using bcrypt.
2. Never return password hashes.
3. Enforce account `status` checks at login.
4. Add per-IP rate limit on login endpoint.
5. Log auth events (`login_success`, `login_failed`) with user ID/email and timestamp.
