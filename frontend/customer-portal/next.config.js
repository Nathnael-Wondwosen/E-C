/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Internationalized Routing
  i18n: {
    locales: ['en', 'es', 'fr', 'de'],
    defaultLocale: 'en',
  },
  // Vercel deployment optimizations
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com', 'localhost', '127.0.0.1'], // Add domains for image optimization
  },
  // Environment variables
  env: {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL,
    ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
    ALGOLIA_SEARCH_KEY: process.env.ALGOLIA_SEARCH_KEY,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_URL: process.env.CLOUDINARY_URL,
  },
  // Vercel supports server-side rendering
}

module.exports = nextConfig