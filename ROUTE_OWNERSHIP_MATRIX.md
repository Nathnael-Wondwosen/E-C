# Route Ownership Matrix (E-C + tradethiopia)

Last updated: 2026-03-09

Purpose: define clear ownership while splitting `tradethiopia` into microservices and merging with `E-C`.

## Ownership Legend

- `E-C Gateway`: `E-C/services/api-gateway`
- `Trad Backend`: `tradethiopia/backend/server.js`
- `Target Service`: proposed microservice owner after extraction

## Domain Matrix

| Domain | Current Route Prefixes | Current Owner | Target Service | Notes |
|---|---|---|---|---|
| Platform Health | `/`, `/health`, `/api/health` | Both | `edge-gateway` + service-local health | Keep service-local `/health`; edge exposes aggregate health. |
| Identity/Auth | `E-C: /api/auth/*, /api/users/*` ; `Trad: /api/users/*` | Both | `identity-service` | First extraction target. Unify JWT claims + role mapping. |
| User Commerce State | `E-C: /api/users/:id/cart`, `/wishlist`, `/orders` | E-C Gateway | `commerce-user-service` (later) | Keep in E-C for now. Decouple after identity cutover stabilizes. |
| Catalog | `E-C: /api/products`, `/api/categories` | E-C Gateway | `catalog-service` | Trad category routes are internal/non-commerce; keep isolated for now. |
| Merchandising Content | `E-C: /api/hero-slides`, `/api/banners`, `/api/special-offers`, `/api/news-blog-posts`, `/api/services`, `/api/partners`, `/api/global-background-image` | E-C Gateway | `content-service` | Can stay in gateway until split phase. |
| Uploads/Media | `E-C: /api/upload*` ; `Trad: /api/*` file upload endpoints via info/document routes | Both | `media-service` | Needs strategy decision: Cloudinary vs Appwrite. |
| B2B Matchmaking | `Trad: /api/buyers`, `/api/sellers`, `/api/b2b`, `/api/saved-matches` | Trad Backend | `b2b-service` | Core trad domain; add API contract before extraction. |
| Sales Operations | `Trad: /api/salescustomers`, `/api/sales-customers`, `/api/sales-manager`, `/api/sales-targets`, `/api/packages/sales`, `/api/package-sales`, `/api/packages`, `/api/commissions` | Trad Backend | `sales-service` | Keep aliases during migration (`salescustomers` vs `sales-customers`). |
| Finance Operations | `Trad: /api/finance`, `/api/purchases`, `/api/costs`, `/api/demands`, `/api/payroll` | Trad Backend | `finance-service` | High coupling with reports; extract after auth and sales. |
| Work Management | `Trad: /api/tasks`, `/api/calendar`, `/api/requests`, `/api/social-requests`, `/api/action-items`, `/api/content-tracker` | Trad Backend | `ops-service` | Shared role controls needed from identity-service. |
| Messaging/Notification | `Trad: /api/messages`, `/api/notifications`, Socket.IO | Trad Backend | `engagement-service` | Keep websocket on trad backend until dedicated real-time service is introduced. |
| Training/Courses | `Trad: /api/courses`, `/api/training-followups`, `/api/ensra-followups`, `/api/tradex-followups`, `/api/product-followups` | Trad Backend | `learning-service` (or `ops-service`) | Decide if standalone service is worth operational overhead. |
| Asset/Document Management | `Trad: /api/assets`, `/api/assetcategories`, `/api/documents`, `/api/resources` | Trad Backend | `asset-service` | Can remain grouped with Appwrite-driven media domain. |
| IT/Internal | `Trad: /api/it` | Trad Backend | `it-service` (optional) | Keep under `ops-service` unless scale/ownership justifies separation. |

## Immediate Routing Decision

During initial merge, route requests by prefix:

1. Send all e-commerce public/admin endpoints to `E-C` backend.
2. Send internal employee/ops endpoints to `tradethiopia` backend.
3. Move only identity/auth first into the new `identity-service`.

## Identity Cutover Slice (First)

Initial endpoints to move behind `identity-service`:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/admin/login` (temporary compatibility adapter)
- `GET /api/users/:id`
- `PUT /api/users/:id`

Endpoints temporarily remaining in domain services but validating identity token:

- all protected `Trad` and `E-C` routes

## Collision Notes

- `/api/users/*` exists in both projects with different payload shapes.
- `/api/orders*` exists in both ecosystems but different business semantics.
- dual naming in trad (`/api/salescustomers` and `/api/sales-customers`) must be preserved during migration.
