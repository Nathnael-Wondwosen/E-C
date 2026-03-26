# Codebase Full Map (Code-Accurate)

Last verified: 2026-03-16

This document reflects what is currently implemented in source code, not just planned docs.

## 1) Monorepo Shape

Root workspaces:

- `frontend/admin-dashboard` (Next.js, port 3006)
- `frontend/customer-portal` (Next.js, port 3005)
- `services/api-gateway` (Express, port 3000 default)
- `services/identity-service` (Express + Mongoose, port 3015 default)
- `services/user-service` (minimal Express shell, port 3007 default)
- `shared` (schemas/utils package)

Important reality:

- Root scripts still reference several non-existent services (`product-service`, `banners-service`, etc.).
- The actual working backend is mainly `services/api-gateway` + optional `services/identity-service`.

## 2) Runtime Architecture

### Main request path

1. Browser (customer/admin frontend) -> `API Gateway` (`NEXT_PUBLIC_API_BASE_URL`, fallback `http://localhost:3000`)
2. Gateway -> MongoDB directly for most domain data
3. Gateway -> Identity Service for delegated auth/profile only when `IDENTITY_SERVICE_URL` is configured

### Gateway (`services/api-gateway`)

Entry:

- `server.js` -> `app.startServer()`
- `app.js` wires middleware, env, Mongo connection, and route registration

Modules:

- `routes/authRoutes.js`
- `routes/userCommerceRoutes.js`
- `routes/catalogRoutes.js`
- `routes/contentRoutes.js`
- `routes/servicesPartnersRoutes.js`
- `routes/uploadRoutes.js`

Security middleware:

- JWT verify: `middleware/authMiddleware.js`
- `requireAdmin` checks `req.auth.userType === 'admin'`
- `requireSelfOrAdmin` checks user id match or admin

Scope system:

- `helpers/scopeHelpers.js`
- Supported scopes: `local`, `global`, `africa`, `china`, `b2b`
- Reads scope from query/header/body and applies scoped query guards

ID resolution:

- `helpers/idLookupHelpers.js`
- Handles Mongo ObjectId, string `_id`, `id`, and numeric `id`

Identity proxy:

- `services/identityProxy.js`
- Proxies JSON requests to identity-service when enabled

### Identity Service (`services/identity-service`)

Purpose:

- Canonical auth/user identity service for register/login/me/password flows
- Uses Mongoose model `IdentityUser` (`models/user.js`)

Routes:

- `/health`
- `/api/auth/*` (register/login/google-exchange/password flows/admin login/me)
- `/api/users/:id` GET/PUT

JWT payload includes `role`, `roles`, `source: "identity-service"`.

### User Service (`services/user-service`)

Current state:

- Minimal shell service with `/` and `/health`.
- No real business routes used by frontends.

## 3) Database Usage (Current)

Gateway collections:

- `users`
- `products`
- `categories`
- `hero_slides`
- `special_offers`
- `banners`
- `news_blog_posts`
- `services`
- `partners`
- `orders`
- `carts`
- `wishlists`
- `settings` (global background image)

Identity-service collection:

- `IdentityUser` (Mongoose model, stored in same MongoDB DB by default `ecommerce_platform`)

## 4) API Surface (Gateway)

### Public/system

- `GET /`
- `GET /health`

### Uploads (admin-protected)

- `POST /api/upload`
- `POST /api/upload/product-image`

### Auth

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `GET /api/auth/reset-password/validate`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`
- `GET /api/auth/google/config`
- `POST /api/auth/google`
- `POST /api/auth/admin/login`

### User + commerce

- `GET /api/users/:id`
- `PUT /api/users/:id`
- `GET /api/users/:id/cart`
- `POST /api/users/:id/cart`
- `PUT /api/users/:id/cart/:productId`
- `DELETE /api/users/:id/cart/:productId`
- `GET /api/users/:id/wishlist`
- `POST /api/users/:id/wishlist`
- `DELETE /api/users/:id/wishlist/:productId`
- `GET /api/users/:id/orders`
- `GET /api/users/:id/orders/:orderId`
- `POST /api/users/:id/orders`

### Catalog + content + sections

- Products CRUD + bulk delete
- Categories CRUD
- Hero slides CRUD + toggle + active/all listing
- Special offers CRUD + toggle + active listing
- Banners CRUD + toggle + active listing
- News/blog CRUD + toggle + active listing
- Global background image GET/POST
- Services CRUD + toggle + active/all listing
- Partners CRUD + toggle + active listing

## 5) Frontend: Customer Portal

Location: `frontend/customer-portal`

Core behavior:

- Login stores in localStorage: `userLoggedIn`, `userToken`, `userId`, `userType`, `userEmail`
- Route protection implemented client-side in pages/components
- Main API utility: `utils/userService.js`
- Homepage/catalog data utility: `utils/heroDataService.js`
- Scope-based market pages: `pages/markets/[scope].js` + `features/markets/*`

Important implementation note:

- `pages/signup.js` is currently a pure UI demo flow (simulated submit), not wired to `createUser`.

## 6) Frontend: Admin Dashboard

Location: `frontend/admin-dashboard`

Core behavior:

- Admin login via `POST /api/auth/admin/login`
- Stores `adminLoggedIn`, `adminToken`, `adminScope`
- `_app.js` monkey-patches `window.fetch` to auto-attach `Authorization: Bearer <adminToken>` for API calls
- Scope routing model:
  - URLs like `/admin/[scope]/...` normalize to page routes with `?scope=...`
  - `utils/scopeApi.js` appends scope query automatically (`withAdminScopeUrl`)

Admin scope model:

- Scopes: `local`, `global`, `africa`, `china`, `b2b`, `system`
- Config in:
  - `config/adminScopes.js`
  - `config/adminScopePermissions.js`
  - `services/adminScopeApiMap.js`

Data API wrapper:

- `utils/mongoService.js` is the main API utility for products/categories/sections.
- Includes mock fallbacks if API calls fail.

## 7) Environment Variables

### Gateway required

- `MONGODB_URI`
- `JWT_SECRET`

### Gateway strongly needed for full admin auth

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

### Optional/feature vars

- `PORT`
- `MONGODB_DB_NAME`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `GOOGLE_CLIENT_ID`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `IDENTITY_SERVICE_URL`
- `ENFORCE_IDENTITY_BOUNDARY`

### Frontends

- `NEXT_PUBLIC_API_BASE_URL` (both apps rely on this)

### Identity service

- `JWT_SECRET`
- `MONGODB_URI` (or `MONGO_URI`)
- `MONGODB_DB_NAME` (optional)
- `IDENTITY_SERVICE_PORT` (optional)

## 8) Current Gaps / Risks

1. Root scripts include non-existent workspaces, so `npm run dev` is not reliable as-is.
2. Some frontend paths still depend on mock fallback behavior in API utils.
3. Customer signup page is not connected to backend registration.
4. Mixed data-id patterns (`_id`, `id`, numeric `id`) create conversion complexity.
5. A lot of legacy docs describe broader topology than what is currently deployed in code.

## 9) Recommended Real Dev Start

From repo root:

1. `npm install`
2. `npm run dev --workspace=services/api-gateway`
3. `npm run dev --workspace=services/identity-service` (optional but recommended for auth boundary model)
4. `npm run dev --workspace=frontend/customer-portal`
5. `npm run dev --workspace=frontend/admin-dashboard`

## 10) Key Source-of-Truth Files

- `services/api-gateway/app.js`
- `services/api-gateway/routes/*.js`
- `services/api-gateway/middleware/authMiddleware.js`
- `services/identity-service/app.js`
- `services/identity-service/routes/*.js`
- `frontend/customer-portal/utils/userService.js`
- `frontend/admin-dashboard/utils/mongoService.js`
- `frontend/admin-dashboard/utils/scopeApi.js`
- `CURRENT_ARCHITECTURE.md`

