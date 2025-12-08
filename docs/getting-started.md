# Getting Started with B2B E-Commerce Platform

## Project Structure

```
ecommerce-platform/
├── api-gateway/           # Entry point for all API requests
├── services/              # Microservices
│   ├── user-service/      # User management
│   ├── product-service/   # Product catalog
│   ├── order-service/     # Order processing
│   ├── payment-service/   # Payment processing
│   ├── search-service/    # Search functionality (Algolia integration)
│   └── notification-service/ # Email/SMS notifications
├── frontend/              # Next.js frontend applications
│   ├── admin-dashboard/   # Admin interface
│   └── customer-portal/   # Customer-facing site
├── shared/                # Shared utilities and types
└── docs/                  # Documentation
```

## Prerequisites

- Node.js 16+
- MongoDB
- Docker (optional, for containerization)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ecommerce-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

1. Start all services:
   ```bash
   npm run dev
   ```

2. Access the applications:
   - Customer Portal: http://localhost:3000
   - Admin Dashboard: http://localhost:3001

### Using Docker

1. Build and start all services:
   ```bash
   docker-compose up --build
   ```

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Backend Services

Backend services can be deployed to platforms like:
- Render
- Railway
- Heroku
- AWS ECS
- Google Cloud Run

## Environment Variables

Each service requires specific environment variables. Check the `.env.example` file in each service directory for details.

## API Gateway

The API Gateway runs on port 3000 and routes requests to appropriate microservices:

- `/api/users/*` → User Service (port 3001)
- `/api/products/*` → Product Service (port 3002)
- `/api/orders/*` → Order Service (port 3003)
- `/api/payments/*` → Payment Service (port 3004)
- `/api/search/*` → Search Service (port 3005)
- `/api/notifications/*` → Notification Service (port 3006)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request