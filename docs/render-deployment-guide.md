# Render Deployment Guide

This guide explains how to deploy the complete B2B E-Commerce platform to Render using the provided configuration files.

## Prerequisites

1. A GitHub account
2. A Render account (free tier available at [render.com](https://render.com))
3. A MongoDB database (MongoDB Atlas recommended)
4. A Cloudinary account for image storage

## Step-by-Step Deployment

### 1. Prepare Your Repository

1. Fork this repository to your GitHub account
2. Clone your forked repository locally
3. Ensure all Dockerfiles are present (they've been added for all services)
4. Push any changes to your GitHub repository

### 2. Set Up MongoDB

1. Create a MongoDB Atlas account if you don't have one
2. Create a new cluster
3. Create a database user with read/write permissions
4. Add your IP address to the IP whitelist (or allow access from anywhere for development)
5. Get your MongoDB connection string

### 3. Set Up Cloudinary (Optional but Recommended)

1. Create a Cloudinary account if you don't have one
2. Note your Cloud Name, API Key, and API Secret from the dashboard

### 4. Deploy to Render Using Blueprint

1. Sign in to your Render account
2. Click "New Web Service"
3. Connect your GitHub repository
4. Select the branch you want to deploy (usually `main` or `master`)
5. Render will automatically detect the `render.yaml` file
6. Review the services that will be created:
   - API Gateway
   - User Service
   - Product Service
   - Order Service
   - Payment Service
   - Search Service
   - Notification Service
   - Admin Dashboard
   - Customer Portal

### 5. Configure Environment Variables

For each service, you'll need to add the appropriate environment variables:

#### API Gateway
- `MONGODB_URI` - Your MongoDB connection string
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret
- `NODE_ENV` - production

#### User Service
- `MONGODB_URI` - Your MongoDB connection string for user database
- `NODE_ENV` - production

#### Product Service
- `MONGODB_URI` - Your MongoDB connection string for product database
- `NODE_ENV` - production

#### Other Services
Configure as needed based on your specific requirements.

### 6. Update Service Interconnections

After deploying, you'll need to update the API Gateway to point to the correct URLs for each microservice. Edit the service URLs in the API Gateway configuration to use the Render-generated URLs for each service.

### 7. Deploy Frontend Applications

The frontend applications (Admin Dashboard and Customer Portal) will be deployed as part of the blueprint. However, you may need to:

1. Update the API base URL in the frontend to point to your deployed API Gateway
2. Configure any additional environment variables needed for the frontend

### 8. Custom Domain (Optional)

1. Purchase a domain or use an existing one
2. In the Render dashboard, go to each service
3. Click "Settings" and then "Custom Domains"
4. Add your domain and follow the DNS configuration instructions

## Troubleshooting

### Common Issues

1. **Services failing to start**: Check environment variables and logs
2. **Database connection issues**: Verify MongoDB URI and IP whitelist
3. **Inter-service communication problems**: Ensure service URLs are correctly configured
4. **Frontend not connecting to backend**: Check API base URLs in frontend configuration

### Checking Logs

1. In the Render dashboard, select any service
2. Click "Logs" to view real-time logs
3. Look for error messages or warnings

## Scaling and Monitoring

Render automatically scales your services based on traffic. You can:

1. Upgrade to a paid plan for more resources
2. Set custom scaling rules in the Render dashboard
3. Monitor performance using Render's built-in metrics

## Updating Your Application

1. Push changes to your GitHub repository
2. Render will automatically redeploy if auto-deploy is enabled
3. You can also manually trigger deployments from the Render dashboard

## Cost Considerations

- Free tier includes:
  - 500 MB RAM
  - 1 GB disk space
  - Sleeping services after 15 minutes of inactivity
- Paid plans offer:
  - More resources
  - Always-on services
  - Custom domains
  - Increased build minutes

## Support

For issues with this deployment process, please:
1. Check the Render documentation
2. Review the application logs
3. Open an issue in the repository