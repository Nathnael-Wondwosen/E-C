# Vercel Deployment Guide

This guide provides instructions for deploying the customer-portal frontend on Vercel.

## Prerequisites

- A Vercel account
- The customer-portal code connected to a GitHub repository
- A deployed backend API gateway (either self-hosted or deployed on Vercel/Render/AWS)

## Deployment Steps

### 1. Prepare Your Backend API

Before deploying the frontend, ensure your API gateway is deployed and accessible. The customer-portal requires a backend API to function properly.

### 2. Configure Environment Variables

In your Vercel project settings, add the following environment variables:

#### Required Variables:
- `NEXT_PUBLIC_API_BASE_URL`: The URL of your deployed API gateway (e.g., `https://your-api-gateway.onrender.com` or `https://your-api.vercel.app`)

#### Optional Variables:
- `ALGOLIA_APP_ID`: Algolia App ID for search functionality
- `ALGOLIA_SEARCH_KEY`: Algolia Search API Key
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `CLOUDINARY_URL`: Cloudinary URL

### 3. Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "New Project"
3. Connect your GitHub repository containing the customer-portal code
4. Vercel will automatically detect this is a Next.js project
5. Configure the following settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next` (Vercel will auto-detect this)
   - Root Directory: `frontend/customer-portal`
6. Add the environment variables as specified above
7. Click "Deploy"

### 4. Configure Custom Domain (Optional)

1. In your Vercel project dashboard
2. Go to Settings > Domains
3. Add your custom domain
4. Follow Vercel's instructions to configure DNS settings

## Post-Deployment Verification

After deployment, verify that:

1. The site loads without errors
2. User authentication works
3. Product browsing functions properly
4. Shopping cart functionality works
5. API calls to your backend are successful
6. All internationalized routes work (en, es, fr, de)

## Troubleshooting

### Common Issues:

- **API calls failing**: Verify that `NEXT_PUBLIC_API_BASE_URL` is correctly set and accessible
- **Images not loading**: Check that the image domains are properly configured in `next.config.js`
- **Environment variables not working**: Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access

### Debugging:

1. Check browser console for errors
2. Verify API endpoints are accessible from the deployed frontend
3. Confirm CORS settings allow requests from your Vercel deployment URL

## Performance Optimization

The application is already optimized for Vercel with:
- Next.js automatic code splitting
- Image optimization via Next.js Image component
- Static generation where possible
- Server-side rendering for dynamic content

## Updates

To deploy updates:
1. Push changes to the connected GitHub repository
2. Vercel will automatically build and deploy the new version
3. Monitor the deployment logs for any issues