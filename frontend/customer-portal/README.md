# Customer Portal

A Next.js application for the customer portal of the B2B E-Commerce Platform.

## Vercel Deployment

This application is optimized for deployment on Vercel.

### Environment Variables

For Vercel deployment, configure the following environment variables in your Vercel project settings:

- `NEXT_PUBLIC_API_BASE_URL`: URL of your deployed API gateway (e.g., `https://your-api-gateway.vercel.app`)
- `ALGOLIA_APP_ID`: (Optional) Algolia App ID for search functionality
- `ALGOLIA_SEARCH_KEY`: (Optional) Algolia Search API Key
- `CLOUDINARY_CLOUD_NAME`: (Optional) Cloudinary cloud name
- `CLOUDINARY_API_KEY`: (Optional) Cloudinary API key
- `CLOUDINARY_API_SECRET`: (Optional) Cloudinary API secret
- `CLOUDINARY_URL`: (Optional) Cloudinary URL

### Deployment

1. Connect your GitHub repository to Vercel
2. Import your project in Vercel
3. Set the environment variables as listed above
4. Vercel will automatically detect this is a Next.js project and build accordingly

### Local Development

```bash
npm install
npm run dev
```

The application will run on `http://localhost:3005`.

### Build

```bash
npm run build
```

This will create an optimized production build.

## Features

- Internationalized routing (en, es, fr, de)
- Responsive design
- Product browsing and search
- Shopping cart functionality
- Order history
- User authentication
- Blog and news sections