# API Endpoints Documentation

This document lists all the API endpoints available in the B2B E-Commerce Platform, organized by service.

## API Gateway Endpoints

Base URL: `http://localhost:3000` (local) or Render service URL (deployment)

### Proxy Routes

All requests to these endpoints are forwarded to the respective microservices:

- `/api/users/*` → User Service
- `/api/products/*` → Product Service
- `/api/orders/*` → Order Service
- `/api/payments/*` → Payment Service
- `/api/search/*` → Search Service
- `/api/notifications/*` → Notification Service
- `/api/hero-slides/*` → Hero Slides Service
- `/api/categories/*` → Categories Service
- `/api/special-offers/*` → Special Offers Service
- `/api/banners/*` → Banners Service
- `/api/news-blog-posts/*` → News/Blog Posts Service
- `/api/navbar-links/*` → Navbar Links Service
- `/api/services/*` → Services Service
- `/api/partners/*` → Partners Service

### Direct Endpoints

- `GET /` - API Gateway information
- `GET /health` - Health check endpoint

## User Service

Base URL: `http://localhost:3001` (local) or Render service URL (deployment)

- `GET /` - Service information
- `GET /health` - Health check endpoint

## Product Service

Base URL: `http://localhost:3002` (local) or Render service URL (deployment)

- `GET /` - Service information
- `GET /health` - Health check endpoint

## Order Service

Base URL: `http://localhost:3003` (local) or Render service URL (deployment)

- `GET /` - Service information
- `GET /health` - Health check endpoint

## Payment Service

Base URL: `http://localhost:3004` (local) or Render service URL (deployment)

- `GET /` - Service information
- `GET /health` - Health check endpoint

## Search Service

Base URL: `http://localhost:3005` (local) or Render service URL (deployment)

- `GET /` - Service information
- `GET /health` - Health check endpoint

## Notification Service

Base URL: `http://localhost:3006` (local) or Render service URL (deployment)

- `GET /` - Service information
- `GET /health` - Health check endpoint

## Hero Slides Service

Base URL: `http://localhost:3007` (local) or Render service URL (deployment)

- `GET /` - Service information
- `GET /health` - Health check endpoint
- `GET /api/hero-slides` - Get all active hero slides
- `GET /api/hero-slides/all` - Get all hero slides (admin)
- `POST /api/hero-slides` - Create a new hero slide
- `PUT /api/hero-slides/:id` - Update a hero slide
- `DELETE /api/hero-slides/:id` - Delete a hero slide
- `PATCH /api/hero-slides/:id/toggle` - Toggle hero slide active status

## Categories Service

Base URL: `http://localhost:3008` (local) or Render service URL (deployment)

- `GET /` - Service information
- `GET /health` - Health check endpoint
- `GET /api/categories` - Get all active categories
- `GET /api/categories/all` - Get all categories (admin)
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category
- `PATCH /api/categories/:id/toggle` - Toggle category active status

## Special Offers Service

Base URL: `http://localhost:3009` (local) or Render service URL (deployment)

- `GET /` - Service information
- `GET /health` - Health check endpoint
- `GET /api/special-offers` - Get all active special offers
- `GET /api/special-offers/all` - Get all special offers (admin)
- `POST /api/special-offers` - Create a new special offer
- `PUT /api/special-offers/:id` - Update a special offer
- `DELETE /api/special-offers/:id` - Delete a special offer
- `PATCH /api/special-offers/:id/toggle` - Toggle special offer active status

## Banners Service

Base URL: `http://localhost:3010` (local) or Render service URL (deployment)

- `GET /` - Service information
- `GET /health` - Health check endpoint
- `GET /api/banners` - Get all active banners
- `GET /api/banners/all` - Get all banners (admin)
- `POST /api/banners` - Create a new banner
- `PUT /api/banners/:id` - Update a banner
- `DELETE /api/banners/:id` - Delete a banner
- `PATCH /api/banners/:id/toggle` - Toggle banner active status

## News/Blog Posts Service

Base URL: `http://localhost:3011` (local) or Render service URL (deployment)

- `GET /` - Service information
- `GET /health` - Health check endpoint
- `GET /api/news-blog-posts` - Get all active posts
- `GET /api/news-blog-posts/all` - Get all posts (admin)
- `GET /api/news-blog-posts/:id` - Get post by ID
- `POST /api/news-blog-posts` - Create a new post
- `PUT /api/news-blog-posts/:id` - Update a post
- `DELETE /api/news-blog-posts/:id` - Delete a post
- `PATCH /api/news-blog-posts/:id/toggle` - Toggle post active status

## Navbar Links Service

Base URL: `http://localhost:3012` (local) or Render service URL (deployment)

- `GET /` - Service information
- `GET /health` - Health check endpoint
- `GET /api/navbar-links` - Get all enabled navbar links
- `GET /api/navbar-links/all` - Get all navbar links (admin)
- `POST /api/navbar-links` - Create a new navbar link
- `PUT /api/navbar-links/:id` - Update a navbar link
- `DELETE /api/navbar-links/:id` - Delete a navbar link
- `PATCH /api/navbar-links/:id/toggle` - Toggle navbar link enabled status

## Services Service

Base URL: `http://localhost:3013` (local) or Render service URL (deployment)

- `GET /` - Service information
- `GET /health` - Health check endpoint
- `GET /api/services` - Get all active services
- `GET /api/services/all` - Get all services (admin)
- `POST /api/services` - Create a new service
- `PUT /api/services/:id` - Update a service
- `DELETE /api/services/:id` - Delete a service
- `PATCH /api/services/:id/toggle` - Toggle service active status

## Partners Service

Base URL: `http://localhost:3014` (local) or Render service URL (deployment)

- `GET /` - Service information
- `GET /health` - Health check endpoint
- `GET /api/partners` - Get all active partners
- `GET /api/partners/all` - Get all partners (admin)
- `POST /api/partners` - Create a new partner
- `PUT /api/partners/:id` - Update a partner
- `DELETE /api/partners/:id` - Delete a partner
- `PATCH /api/partners/:id/toggle` - Toggle partner active status

## Frontend Applications

### Admin Dashboard

Base URL: `http://localhost:3006` (local)

### Customer Portal

Base URL: `http://localhost:3001` (local)

Both frontend applications communicate with the API Gateway through the `NEXT_PUBLIC_API_BASE_URL` environment variable.