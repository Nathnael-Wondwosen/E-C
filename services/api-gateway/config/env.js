const loadGatewayEnv = () => {
  const enforceIdentityBoundaryRaw = `${process.env.ENFORCE_IDENTITY_BOUNDARY || 'false'}`.toLowerCase();
  const env = {
    port: Number(process.env.PORT || 3000),
    mongoUri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME || 'ecommerce_platform',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    identityServiceUrl: (process.env.IDENTITY_SERVICE_URL || '').replace(/\/+$/, ''),
    enforceIdentityBoundary: ['1', 'true', 'yes', 'on'].includes(enforceIdentityBoundaryRaw),
    adminUsername: process.env.ADMIN_USERNAME,
    adminPassword: process.env.ADMIN_PASSWORD,
    corsOrigin: process.env.CORS_ORIGIN || '',
    userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    productServiceUrl: process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002'
  };

  if (!env.jwtSecret) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }

  if (!env.mongoUri) {
    throw new Error('Missing required environment variable: MONGODB_URI');
  }

  if (!env.adminUsername || !env.adminPassword) {
    console.warn('ADMIN_USERNAME/ADMIN_PASSWORD not set. Admin login endpoint will reject requests.');
  }

  return env;
};

module.exports = {
  loadGatewayEnv
};
