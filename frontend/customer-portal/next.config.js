/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Internationalized Routing
  i18n: {
    locales: ['en', 'es', 'fr', 'de'],
    defaultLocale: 'en',
  },
  // Allow product/media images from local dev and external hosts like Cloudinary.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
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
  async redirects() {
    return [
      {
        source: '/b2b-marketplace',
        destination: '/markets/b2b',
        permanent: false,
      },
      {
        source: '/b2b-marketplace/:id',
        destination: '/products/:id',
        permanent: false,
      },
      {
        source: '/globalmarket',
        destination: '/marketplace',
        permanent: false,
      },
      {
        source: '/africamarket',
        destination: '/markets/africa',
        permanent: false,
      },
      {
        source: '/chinamarket',
        destination: '/markets/china',
        permanent: false,
      },
      {
        source: '/b2bmarket',
        destination: '/markets/b2b',
        permanent: false,
      },
      {
        source: '/bestsellers',
        destination: '/best-sellers',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/localmarket',
        destination: '/marketplace?view=local',
      },
    ];
  },
}

module.exports = nextConfig
