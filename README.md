# B2B E-Commerce Platform

An advanced B2B E-Commerce platform built with microservices architecture.

## Shared Configuration

This project uses a shared configuration approach with a root `.env` file and shared utilities in the `shared/` directory for consistent settings across all services.

## Technology Stack

- **Frontend**: Next.js with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Search**: Algolia
- **CMS**: Strapi (or Contentful)
- **Deployment**: Vercel (Frontend), Render/Railway (Backend Services)

## Project Structure

```
ecommerce-platform/
├── api-gateway/
├── services/
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   ├── payment-service/
│   ├── search-service/
│   └── notification-service/
├── frontend/
│   ├── admin-dashboard/
│   └── customer-portal/
├── shared/
│   ├── schemas/
│   └── utils/
└── docs/
```

## Vercel Deployment

This project is configured for Vercel deployment:

1. Frontend applications (admin-dashboard and customer-portal) are configured in `vercel.json`
2. Backend services should be deployed separately to platforms like Render or Railway
3. Environment variables should be configured in Vercel dashboard

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables by copying `.env.example` to `.env` and filling in the values

3. Run development servers:
   ```bash
   npm run dev
   ```

## Deployment

1. Connect repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy!

## Microservices Architecture

Each service is independently deployable and scalable.