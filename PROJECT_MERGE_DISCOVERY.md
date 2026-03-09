# Project Merge Discovery: E-C + tradethiopia

Last updated: 2026-03-09

## Projects Compared

- Project A (current workspace): `C:\Users\Developer\Documents\GitHub\Portal\E-C`
- Project B (target identified from your message): `C:\Users\Developer\Documents\GitHub\Portal\tradethiopia`

## Current State Summary

### E-C

- Type: B2B e-commerce platform
- Frontend:
  - Next.js customer portal (`frontend/customer-portal`)
  - Next.js admin dashboard (`frontend/admin-dashboard`)
- Backend:
  - Express API gateway (`services/api-gateway/server.js`) with most business logic
  - Minimal user-service shell (`services/user-service/server.js`)
- Data store: MongoDB
- Media: Cloudinary
- Auth model: JWT + admin credentials + optional Google auth

### tradethiopia

- Type: employee/operations platform with B2B, sales, finance, HR, IT, requests, content tracking
- Frontend:
  - Vite + React SPA (`frontend/src/App.jsx`)
  - Large route surface across role-specific areas
- Backend:
  - Express monolith (`backend/server.js`)
  - 52 route modules, 52 controllers, 55 models
  - Socket.IO for real-time messaging/notifications
  - Vercel serverless wrapper (`backend/api/index.js`)
- Data store: MongoDB (`MONGO_URI`)
- File/doc storage: Appwrite integration
- Auth model: JWT (`userToken`) with role-based route protections

## Integration Reality

Both projects are substantial, but they are not plug-and-play compatible:

- Frontend framework mismatch:
  - E-C: Next.js (SSR/ISR capable)
  - tradethiopia: Vite SPA
- Backend model mismatch:
  - E-C: gateway-centric e-commerce API
  - tradethiopia: large monolith with many business domains
- Domain overlap:
  - Users/auth
  - B2B buyers/sellers/matching
  - Orders and package tracking
- Infrastructure differences:
  - Cloudinary vs Appwrite for media/file patterns
  - Different env var naming conventions and deployment targets

## Database Policy (Decision)

- Canonical data store for merged platform: **MongoDB only**.
- Relational databases are out of scope for this merge.
- Standard env variable: `MONGODB_URI` (legacy alias `MONGO_URI` allowed temporarily).

## Safe Merge Strategy (Recommended)

### Phase 1: Strangler merge (no big-bang rewrite)

1. Keep both backends running.
2. Introduce a single edge/API entry layer.
3. Route requests by domain:
   - E-commerce routes to E-C gateway
   - Internal operations routes to tradethiopia backend
4. Keep each frontend running independently during transition.

### Phase 2: Identity unification

1. Define one canonical user identity schema.
2. Choose token standard and claims map (`sub`, `role`, `scopes`, tenancy fields if needed).
3. Implement trust bridge so each backend can validate the same JWT format.

### Phase 3: Domain consolidation

1. Merge duplicated domains one at a time:
   - Users/auth
   - Orders/customers
   - B2B buyers/sellers/matching
2. Add data migration scripts per domain.
3. Decommission replaced endpoints only after frontend cutover.

### Phase 4: Frontend convergence

1. Choose host shell:
   - Option A: Next.js as host, embed/migrate SPA modules
   - Option B: Keep dual frontends with shared SSO and shared API contracts
2. Move role dashboards and e-commerce views incrementally.

## High-Risk Areas to Resolve Early

- Auth token incompatibility and role semantics
- User model differences
- Duplicate order/customer concepts
- File/media strategy split (Cloudinary vs Appwrite)
- Route namespace collisions (`/api/users`, `/api/orders`, etc.)
- CORS and cookie/header policy inconsistencies

## Immediate Implementation Plan

1. Build a route ownership matrix (`who owns which endpoint`) across both backends.
2. Define canonical auth payload and role map.
3. Create an API contract doc with collision decisions (`keep`, `rename`, `deprecate`).
4. Add a lightweight API aggregation gateway for local combined development.
5. Start with one pilot integration flow:
   - Login once
   - Access e-commerce + internal dashboard with one identity

## Notes

- E-C has known stale docs/scripts referencing non-existent services; use source files as truth.
- tradethiopia has broad module surface and should be merged incrementally, not rewritten all at once.
