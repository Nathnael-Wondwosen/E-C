# Platform Structure Blueprint

Last updated: 2026-03-09

This blueprint defines the cleaned and organized structure for merged Project 1 + Project 2.

## 1) Admin Structure

Path: `frontend/admin-dashboard`

### Admin Scope Model

- `local` (Project 1)
- `global` (Project 1)
- `africa` (Project 1)
- `china` (Project 1)
- `b2b` (Project 2)
- `system` (Project 2)

### Implemented Structure

- `config/adminScopes.js`: source of truth for admin scope definitions
- `config/adminScopePermissions.js`: allowed route boundaries per admin scope
- `utils/adminScopeService.js`: local storage persistence for active admin scope
- `components/AdminScopeSwitcher.js`: isolated admin context selector UI
- `pages/admin/[scope].js`: scoped admin entry route
- `pages/admin/[scope]/[[...slug]].js`: scoped route wrapper for admin modules
- `pages/dashboard.js`: scope-aware dashboard context
- `services/adminScopeApiMap.js`: scope-to-service endpoint ownership map

## 2) Customer Frontend Structure

Path: `frontend/customer-portal`

Single customer frontend with market-isolated data organization:

- `features/markets/local.js`
- `features/markets/global.js`
- `features/markets/africa.js`
- `features/markets/china.js`
- `features/markets/b2b.js`
- `features/markets/registry.js`

Unified market page rendering:

- `components/markets/MarketLandingPage.js`
- `pages/markets/[scope].js`

Legacy compatibility redirects:

- `pages/localmarket.js` -> `/markets/local`
- `pages/b2b-marketplace/index.js` -> `/markets/b2b`
- `pages/globalmarket.js` -> `/markets/global`
- `pages/africamarket.js` -> `/markets/africa`
- `pages/chinamarket.js` -> `/markets/china`
- `pages/b2bmarket.js` -> `/markets/b2b`

## 3) Data Platform Rule

- MongoDB only.
- Canonical env key: `MONGODB_URI`.
- Temporary fallback accepted: `MONGO_URI`.

## 4) Merge Governance Rule

- Scope boundaries are isolated by route and config first.
- Legacy paths remain as redirects during migration.
- Domain behavior can be moved incrementally without breaking user entry paths.
