const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerGatewayRoutes } = require('./routes');

const {
  createAuthTokenFactory,
  authenticateTokenFactory,
  requireSelfOrAdmin,
  requireAdmin
} = require('./middleware/authMiddleware');
const { loadGatewayEnv } = require('./config/env');
const { connectToMongo } = require('./config/database');
const { buildCorsOptions } = require('./config/cors');
const {
  resolveRequestedScope,
  buildScopedQuery,
  applyMarketScopeToDocument,
  ensureDocumentScopeAccess
} = require('./helpers/scopeHelpers');
const { findDocumentByFlexibleIdFactory } = require('./helpers/idLookupHelpers');
const { createProxyJsonToIdentityService } = require('./services/identityProxy');

const createApp = ({ env, db }) => {
  const {
    googleClientId,
    jwtSecret,
    jwtExpiresIn,
    identityServiceUrl,
    enforceIdentityBoundary,
    adminUsername,
    adminPassword,
    corsOrigin,
    userServiceUrl,
    productServiceUrl
  } = env;

  const app = express();
  const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024
    }
  });

  const normalizeUserType = (userType) => (userType === 'seller' ? 'seller' : 'buyer');
  const createAuthToken = createAuthTokenFactory({ jwtSecret, expiresIn: jwtExpiresIn });
  const authenticateToken = authenticateTokenFactory({ jwtSecret });
  const findDocumentByFlexibleId = findDocumentByFlexibleIdFactory({ ObjectId });
  const proxyJsonToIdentityService = createProxyJsonToIdentityService({ identityServiceUrl });

  app.use(cors(buildCorsOptions({ corsOrigin })));
  app.use(helmet());
  app.use(morgan('combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const scopedHelpers = {
    resolveRequestedScope,
    buildScopedQuery,
    applyMarketScopeToDocument,
    ensureDocumentScopeAccess,
    findDocumentByFlexibleId
  };

  registerGatewayRoutes({
    app,
    getDb: () => db,
    middleware: {
      authenticateToken,
      requireSelfOrAdmin,
      requireAdmin
    },
    helpers: scopedHelpers,
    authDeps: {
      IDENTITY_SERVICE_URL: identityServiceUrl,
      enforceIdentityBoundary,
      googleClient,
      JWT_SECRET: jwtSecret,
      ADMIN_USERNAME: adminUsername,
      ADMIN_PASSWORD: adminPassword,
      normalizeUserType,
      createAuthToken,
      proxyJsonToIdentityService,
      bcrypt,
      jwt
    },
    userCommerceDeps: {
      identityServiceUrl,
      proxyJsonToIdentityService,
      enforceIdentityBoundary
    },
    upload,
    objectId: ObjectId,
    serviceUrls: {
      userServiceUrl,
      productServiceUrl
    },
  });

  return app;
};

const startServer = async () => {
  const env = loadGatewayEnv();
  const db = await connectToMongo({ mongoUri: env.mongoUri, dbName: env.dbName });
  console.log(`Connected to MongoDB database: ${env.dbName}`);

  const app = createApp({ env, db });
  app.listen(env.port, () => {
    console.log(`API Gateway running on port ${env.port}`);
  });

  return app;
};

module.exports = {
  createApp,
  startServer
};
