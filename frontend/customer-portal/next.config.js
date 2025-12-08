/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Internationalized Routing
  i18n: {
    locales: ['en', 'es', 'fr', 'de'],
    defaultLocale: 'en',
  },
  // Enable static exports for Vercel
  output: 'standalone',
  // Environment variables
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
    ALGOLIA_SEARCH_KEY: process.env.ALGOLIA_SEARCH_KEY,
  },
}

module.exports = nextConfig