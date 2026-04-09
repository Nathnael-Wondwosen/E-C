# Render Deployment Guide

This repository currently deploys cleanly as four services on Render:

1. `ecommerce-identity-service`
2. `ecommerce-api-gateway`
3. `ecommerce-admin-dashboard`
4. `ecommerce-customer-portal`

The source of truth for this layout is [render.yaml](/C:/Users/Developer/Documents/GitHub/Portal/E-C/render.yaml).

## Required infrastructure

- MongoDB database
- Cloudinary account if you want image uploads
- Google OAuth client if you want Google sign-in

## Recommended deployment order

1. Deploy `ecommerce-identity-service`
2. Deploy `ecommerce-api-gateway`
3. Deploy `ecommerce-admin-dashboard`
4. Deploy `ecommerce-customer-portal`

## Required environment

### Identity service

- `MONGODB_URI`
- `JWT_SECRET`

### API gateway

- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

### Frontends

- `NEXT_PUBLIC_API_BASE_URL`

## Recommended production flags

- `ENFORCE_IDENTITY_BOUNDARY=true`
- `NEXT_PUBLIC_ALLOW_MOCK_FALLBACKS=false`
- `EXPOSE_PASSWORD_RESET_TOKEN=false`

## Notes

- `services/user-service` is not part of the main production path and is not included in `render.yaml`.
- The gateway should point at the Render URL generated for `ecommerce-identity-service`.
- Keep Cloudinary vars unset only if you do not need upload endpoints.
