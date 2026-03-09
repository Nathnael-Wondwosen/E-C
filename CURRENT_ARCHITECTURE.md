# Current Architecture (Source of Truth)

Last updated: 2026-03-07

This document reflects the **actual code currently in this repository** (not historical docs or planned topology).

## Runtime Applications

The repo currently has 5 runnable apps:

1. API Gateway (primary backend): `services/api-gateway`
2. User Service (minimal shell service): `services/user-service`
3. Identity Service (canonical auth): `services/identity-service`
4. Admin Dashboard (Next.js): `frontend/admin-dashboard`
5. Customer Portal (Next.js): `frontend/customer-portal`

## Real Backend Topology

Despite microservice-oriented docs, most backend functionality is currently implemented inside a single process:

- `services/api-gateway/server.js` owns:
  - authentication + JWT issuance/verification
  - admin auth
  - user profile/cart/wishlist/orders routes
  - product/category/hero/banner/special-offer/news/services/partners CRUD
  - Cloudinary upload endpoints
  - direct MongoDB reads/writes

`services/user-service` currently exposes only `GET /` and `GET /health`.

## Gateway Environment Variables

Required for startup:

- `MONGODB_URI`
- `JWT_SECRET`

Required for admin login success:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Optional but used when set:

- `PORT` (default `3000`)
- `MONGODB_DB_NAME` (default `ecommerce_platform`)
- `JWT_EXPIRES_IN` (default `7d`)
- `CORS_ORIGIN` (comma-separated)
- `GOOGLE_CLIENT_ID` (Google auth)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (upload endpoints)
- `USER_SERVICE_URL`, `PRODUCT_SERVICE_URL` (shown in gateway root response metadata)
- `IDENTITY_SERVICE_URL` (when set, gateway delegates `/api/auth/login`, `/api/auth/register`, and `/api/auth/admin/login`)

## MongoDB Collections Used by Gateway

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

## API Endpoints Implemented in Gateway

Public/system:

- `GET /`
- `GET /health`

Uploads (admin-protected):

- `POST /api/upload`
- `POST /api/upload/product-image`

Auth:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/google`
- `POST /api/auth/admin/login`

Users (JWT + self/admin checks):

- `GET /api/users/:id`
- `PUT /api/users/:id`
- `GET /api/users/:id/cart`
- `POST /api/users/:id/cart`
- `DELETE /api/users/:id/cart/:productId`
- `GET /api/users/:id/wishlist`
- `POST /api/users/:id/wishlist`
- `DELETE /api/users/:id/wishlist/:productId`
- `GET /api/users/:id/orders`
- `GET /api/users/:id/orders/:orderId`
- `POST /api/users/:id/orders`

Products:

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)
- `DELETE /api/products/bulk` (admin)

Hero slides:

- `GET /api/hero-slides`
- `GET /api/hero-slides/all`
- `POST /api/hero-slides` (admin)
- `PUT /api/hero-slides/:id` (admin)
- `DELETE /api/hero-slides/:id` (admin)
- `PATCH /api/hero-slides/:id/toggle` (admin)

Categories:

- `GET /api/categories`
- `GET /api/categories/:id`
- `POST /api/categories` (admin)
- `PUT /api/categories/:id` (admin)
- `DELETE /api/categories/:id` (admin)

Global background:

- `GET /api/global-background-image`
- `POST /api/global-background-image` (admin)

Special offers:

- `GET /api/special-offers`
- `GET /api/special-offers/active`
- `POST /api/special-offers` (admin)
- `PUT /api/special-offers/:id` (admin)
- `DELETE /api/special-offers/:id` (admin)
- `PATCH /api/special-offers/:id/toggle` (admin)

Banners:

- `GET /api/banners`
- `GET /api/banners/active`
- `POST /api/banners` (admin)
- `PUT /api/banners/:id` (admin)
- `DELETE /api/banners/:id` (admin)
- `PATCH /api/banners/:id/toggle` (admin)

News/blog:

- `GET /api/news-blog-posts`
- `GET /api/news-blog-posts/active`
- `POST /api/news-blog-posts` (admin)
- `PUT /api/news-blog-posts/:id` (admin)
- `DELETE /api/news-blog-posts/:id` (admin)
- `PATCH /api/news-blog-posts/:id/toggle` (admin)

Services:

- `GET /api/services`
- `GET /api/services/all`
- `POST /api/services` (admin)
- `PUT /api/services/:id` (admin)
- `DELETE /api/services/:id` (admin)
- `PATCH /api/services/:id/toggle` (admin)

Partners:

- `GET /api/partners`
- `GET /api/partners/active`
- `POST /api/partners` (admin)
- `PUT /api/partners/:id` (admin)
- `DELETE /api/partners/:id` (admin)
- `PATCH /api/partners/:id/toggle` (admin)

## Frontend to Backend Integration

Both Next.js frontends call the gateway through `NEXT_PUBLIC_API_BASE_URL` (fallback `http://localhost:3000`).

- Admin app:
  - listens on port `3006`
  - stores `adminToken` and auto-injects `Authorization` header for API calls
- Customer app:
  - listens on port `3005`
  - uses utility services for auth, user/cart/wishlist/orders, and homepage content

## Run Commands (Existing Services Only)

From repo root:

1. `npm install`
2. `npm run dev --workspace=services/api-gateway`
3. `npm run dev --workspace=services/user-service`
4. `npm run dev --workspace=frontend/admin-dashboard`
5. `npm run dev --workspace=frontend/customer-portal`

## Known Mismatches vs Legacy Docs

- Root `package.json` scripts still reference many non-existent services (for example `services/product-service`, `services/banners-service`, etc.).
- Several markdown docs describe a broader microservice topology than what is currently present in code.
- `services/api-gateway/server.js` currently defines categories routes twice; behavior works but the duplication should be cleaned up.
