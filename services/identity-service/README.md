# identity-service

Canonical identity and auth service for merging `E-C` and `tradethiopia`.

## Endpoints

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google/exchange` (trusted exchange from gateway after Google token verification)
- `POST /api/auth/admin/login` (compatibility)
- `POST /api/users/login` (trad compatibility)
- `GET /api/auth/me`
- `GET /api/users/:id`
- `PUT /api/users/:id`

## Environment

Copy `.env.example` to `.env` and fill:

- `MONGODB_URI` (or `MONGO_URI` fallback)
- `MONGODB_DB_NAME`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `IDENTITY_SERVICE_PORT`

## Local Run

```bash
npm run dev --workspace=services/identity-service
```

or from this directory:

```bash
npm install
npm run dev
```

## Notes

- This is the first extraction slice, focused on login/register/profile identity endpoints.
- Keep legacy auth endpoints in old services during transition, then switch them to token validation only.
