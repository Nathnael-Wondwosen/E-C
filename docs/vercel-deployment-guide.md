# Vercel Deployment Guide

Use Vercel only for the frontend apps. The backend should be deployed separately first.

## Customer portal

- Root directory: `frontend/customer-portal`
- Required env: `NEXT_PUBLIC_API_BASE_URL`
- Optional env:
  - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  - `NEXT_PUBLIC_ALLOW_MOCK_FALLBACKS=false`

## Admin dashboard

- Root directory: `frontend/admin-dashboard`
- Required env: `NEXT_PUBLIC_API_BASE_URL`
- Optional env:
  - `NEXT_PUBLIC_ALLOW_MOCK_FALLBACKS=false`

## Verification

After deployment, verify:

1. customer signup/login works
2. admin login works
3. product listing loads
4. protected writes succeed against the gateway
