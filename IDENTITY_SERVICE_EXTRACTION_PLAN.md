# Identity Service Extraction Plan

Last updated: 2026-03-09

## Goal

Move authentication and user identity from:

- `tradethiopia/backend/routes/user.route.js` and `controllers/user.controller.js`
- `E-C/services/api-gateway/server.js` auth/user identity portions

into:

- `E-C/services/identity-service`

without breaking existing frontends.

## Scope for Slice 1

In scope:

1. login/register token issuance
2. profile read/update
3. canonical JWT claims and role normalization
4. compatibility admin login endpoint for E-C admin frontend

Out of scope for slice 1:

1. cart/wishlist/orders
2. payroll/hr-specific user profile fields full migration
3. websocket session state

## Step-by-Step Execution

1. Stand up identity-service locally on `3015`.
2. Seed at least one admin user and one non-admin user.
3. Point a staging frontend (or local app) auth calls to identity-service:
   - E-C admin login route
   - Trad login route
4. Update both legacy backends to validate identity-service JWTs (shared `JWT_SECRET` initially).
5. Keep legacy auth endpoints active but mark as deprecated.
6. Switch clients one by one to identity-service.
7. Remove login/register implementations from legacy backends after stable cutover.

## Required Compatibility Adapters

### For E-C Admin Dashboard

- Expectation: `POST /api/auth/admin/login` returns token + user.
- Adapter provided in identity-service.

### For Trad Frontend

- Expectation: `/api/users/login` style flow and `userToken`.
- Add temporary route alias in identity-service or API gateway mapping.

## Data Migration Strategy

1. Export users from both stores (E-C and trad) with source IDs.
2. Normalize roles into canonical format.
3. Merge by email (with conflict report when duplicates mismatch).
4. Import into `identity-service` collection with:
   - `sourceRefs.ecUserId`
   - `sourceRefs.tradUserId`
5. Generate password reset flow for accounts where hash format cannot be reused.

## Risks and Mitigations

1. Duplicate emails with different owners:
   - Mitigation: pre-merge conflict table + manual resolution.
2. Role naming inconsistencies:
   - Mitigation: strict mapping table in service.
3. Session breakage during cutover:
   - Mitigation: accept legacy + new token formats during transition window.

## Done Criteria for Slice 1

1. Both frontends log in via identity-service.
2. Legacy services no longer issue JWTs.
3. Protected endpoints in both stacks accept identity-service JWTs.
4. Auth regression test checklist passes (admin and non-admin flows).
