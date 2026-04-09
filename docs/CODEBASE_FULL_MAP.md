# Codebase Full Map (Code-Accurate)

Last verified: 2026-03-30

This document reflects what is currently implemented in source code.

## 1) Monorepo Shape

Root workspaces:

- `frontend/admin-dashboard` (Next.js, port 3006)
- `frontend/customer-portal` (Next.js, port 3005)
- `services/api-gateway` (Express, port 3000 default)
- `services/identity-service` (Express + Mongoose, port 3015 default)
- `services/user-service` (minimal Express shell, port 3007 default)
- `shared` (schemas/utils package)

Important reality:

- The actual working backend is mainly `services/api-gateway` plus optional `services/identity-service`.
- `services/user-service` is not on the main production request path.

## 2) Runtime Architecture

### Main request path

1. Browser -> API Gateway via `NEXT_PUBLIC_API_BASE_URL`
2. Gateway -> MongoDB directly for most domain data
3. Gateway -> Identity Service for delegated auth/profile when `IDENTITY_SERVICE_URL` is configured

### Gateway

Entry:

- `server.js` -> `app.startServer()`
- `app.js` wires middleware, env, Mongo connection, and route registration

Main modules:

- `routes/authRoutes.js`
- `routes/userCommerceRoutes.js`
- `routes/catalogRoutes.js`
- `routes/contentRoutes.js`
- `routes/servicesPartnersRoutes.js`
- `routes/uploadRoutes.js`

### Identity Service

Purpose:

- canonical auth/user identity service for register/login/me/password flows

Routes:

- `/health`
- `/api/auth/*`
- `/api/users/:id`

### User Service

Current state:

- Minimal shell service with `/` and `/health`
- Not used by frontends for current production flows

## 3) Frontend: Customer Portal

Location: `frontend/customer-portal`

Current behavior:

- real login, signup, Google signup, password reset, cart, wishlist, orders, and profile integration
- session storage centralized in `utils/session.js`
- canonical browsing routes are `/marketplace`, `/markets/[scope]`, and `/products/[id]`

## 4) Frontend: Admin Dashboard

Location: `frontend/admin-dashboard`

Current production scope:

- dashboard summary
- products
- categories
- banners
- partners
- services
- section managers
- scoped admin routing

## 5) Required Environment

### Gateway

- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

### Identity service

- `MONGODB_URI` or `MONGO_URI`
- `JWT_SECRET`

### Frontends

- `NEXT_PUBLIC_API_BASE_URL`

### Recommended production flags

- `ENFORCE_IDENTITY_BOUNDARY=true`
- `NEXT_PUBLIC_ALLOW_MOCK_FALLBACKS=false`

## 6) Current Gaps / Risks

1. Some legacy deployment docs still describe a larger service topology than the code actually runs.
2. Some frontend utilities still support mock fallback behavior and must stay disabled in production.
3. Mixed data-id patterns (`_id`, `id`, numeric `id`) still add conversion complexity.

## 7) Recommended Real Dev Start

From repo root:

1. `npm install`
2. `npm run dev`

## 8) Key Source-of-Truth Files

- `services/api-gateway/app.js`
- `services/api-gateway/routes/*.js`
- `services/identity-service/app.js`
- `frontend/customer-portal/utils/userService.js`
- `frontend/customer-portal/utils/session.js`
- `frontend/admin-dashboard/utils/mongoService.js`
- `render.yaml`
- `CURRENT_ARCHITECTURE.md`
