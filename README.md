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
- **Deployment**: Vercel (Frontend), Render/Railway (Backend Services), AWS (Complete Stack)

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

## Render Deployment (Recommended)

This project includes a `render.yaml` file for easy deployment to Render:

1. Fork this repository to your GitHub account
2. Sign up at [render.com](https://render.com)
3. Click "New Web Service"
4. Connect your GitHub repository
5. Select the branch you want to deploy
6. Render will automatically detect the `render.yaml` configuration
7. Add environment variables in the Render dashboard:
   - `MONGODB_URI` - Your MongoDB connection string
   - `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Your Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
8. Click "Create Web Service"

All services will be deployed automatically with proper interconnections.

## AWS Deployment (Enterprise Ready)

This project includes comprehensive AWS deployment configurations for enterprise-grade hosting:

1. Docker containerization for all services
2. ECS task definitions for Fargate deployment
3. IAM role configurations
4. Environment variable templates
5. Automated deployment scripts (Bash & PowerShell)
6. Health check configurations

See [AWS Deployment Guide](AWS_DEPLOYMENT.md) for detailed instructions.

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

### Option 1: Vercel (Frontend only)
1. Connect repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy!

### Option 2: Render (Complete stack - Recommended)
1. Fork this repository to your GitHub account
2. Sign up at [render.com](https://render.com)
3. Import your repository using the `render.yaml` blueprint
4. Configure environment variables for each service
5. Deploy all services with one click

### Option 3: AWS (Enterprise Scale)
1. Review [AWS Deployment Guide](AWS_DEPLOYMENT.md)
2. Set up AWS account and CLI
3. Configure IAM roles using `aws-iam-roles.json`
4. Update environment variables in `.env.aws.template`
5. Run deployment script `deploy-aws.sh` or `deploy-aws.ps1`

For detailed instructions, see [Render Deployment Guide](docs/render-deployment-guide.md) or [AWS Deployment Guide](AWS_DEPLOYMENT.md).

## Microservices Architecture

Each service is independently deployable and scalable.