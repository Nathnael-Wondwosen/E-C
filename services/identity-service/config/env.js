const loadIdentityEnv = () => {
  const env = {
    port: Number(process.env.IDENTITY_SERVICE_PORT || process.env.PORT || 3015),
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI,
    dbName: process.env.MONGODB_DB_NAME || 'ecommerce_platform',
    adminUsername: process.env.ADMIN_USERNAME || '',
    adminPassword: process.env.ADMIN_PASSWORD || ''
  };

  if (!env.jwtSecret) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }

  if (!env.mongoUri) {
    throw new Error('Missing required environment variable: MONGODB_URI or MONGO_URI');
  }

  return env;
};

module.exports = {
  loadIdentityEnv
};
