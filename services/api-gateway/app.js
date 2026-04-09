const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { ObjectId } = require('mongodb');
const multer = require('multer');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerGatewayRoutes } = require('./routes');
const { createErrorHandler, asyncHandler } = require('./middleware/errorHandler');
const { createServices } = require('./services');
const logger = require('./helpers/logger');

const {
  createAuthTokenFactory,
  authenticateTokenFactory,
  requireSelfOrAdmin,
  requireAdmin,
  requireSellerOrAdmin
} = require('./middleware/authMiddleware');
const { createRequestIdMiddleware } = require('./middleware/requestId');
const { createRequestLogCollector } = require('./middleware/requestLogger');
const { createRateLimiter } = require('./middleware/rateLimit');
const { createMetricsCollector } = require('./middleware/metrics');
const { loadGatewayEnv } = require('./config/env');
const { connectToMongo } = require('./config/database');
const { ensureGatewayIndexes } = require('./config/indexes');
const { buildCorsOptions } = require('./config/cors');
const {
  resolveRequestedScope,
  buildScopedQuery,
  applyMarketScopeToDocument,
  ensureDocumentScopeAccess
} = require('./helpers/scopeHelpers');
const { findDocumentByFlexibleIdFactory } = require('./helpers/idLookupHelpers');
const { sendOptimizedJson } = require('./helpers/responseHelpers');
const { initCacheStore, pruneExpiredCacheEntries } = require('./helpers/cacheHelpers');
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
  const metrics = createMetricsCollector();
  const requestLogs = createRequestLogCollector();

  app.use(cors(buildCorsOptions({ corsOrigin })));
  app.use(helmet());
  app.use(compression()); // NEW: Response compression for 30-50% payload reduction
  app.use(createRequestIdMiddleware());
  app.use(requestLogs.middleware);
  app.use(createRateLimiter({ maxRequestsPerMinute: Number(process.env.RATE_LIMIT_PER_MINUTE || 300), db }));
  app.use(metrics.middleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/metrics', (_req, res) => {
    res.json(metrics.getSnapshot());
  });
  app.get('/metrics/prom', (_req, res) => {
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(metrics.renderPrometheus());
  });
  app.get('/logs/requests', (req, res) => {
    const { requestId = '', limit = '200' } = req.query || {};
    res.json({
      generatedAt: new Date().toISOString(),
      items: requestLogs.getSnapshot({ requestId, limit })
    });
  });

  const scopedHelpers = {
    resolveRequestedScope,
    buildScopedQuery,
    applyMarketScopeToDocument,
    ensureDocumentScopeAccess,
    findDocumentByFlexibleId,
    sendOptimizedJson
  };

  // Create service instances with dependency injection
  const services = createServices(db);

  registerGatewayRoutes({
    app,
    getDb: () => db,
    middleware: {
      authenticateToken,
      requireSelfOrAdmin,
      requireAdmin,
      requireSellerOrAdmin
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
    services, // NEW: Pass services to routes
    upload,
    objectId: ObjectId,
    serviceUrls: {
      userServiceUrl,
      productServiceUrl
    },
  });

  // NEW: Global error handler middleware (must be last)
  app.use(createErrorHandler());

  return app;
};

const startServer = async () => {
  const env = loadGatewayEnv();
  const db = await connectToMongo({ mongoUri: env.mongoUri, dbName: env.dbName });
  logger.info('Connected to MongoDB', { database: env.dbName });
  await initCacheStore({ redisUrl: process.env.REDIS_URL || '' });
  await ensureGatewayIndexes(db);
  logger.info('Gateway indexes ensured');

  const app = createApp({ env, db });
  const server = app.listen(env.port, () => {
    logger.info('API Gateway started', { port: env.port, env: env.env });
  });

  // NEW: Graceful shutdown handling
  const { setupGracefulShutdown } = require('./utils/gracefulShutdown');
  setupGracefulShutdown(server, {
    closeDB: async () => {
      if (db && typeof db.client?.close === 'function') {
        await db.client.close();
      }
    },
    onShutdown: () => {
      clearInterval(pruneTimer);
    }
  });

  const pruneTimer = setInterval(() => {
    pruneExpiredCacheEntries();
  }, 30_000);
  if (typeof pruneTimer.unref === 'function') {
    pruneTimer.unref();
  }

  return app;
};

module.exports = {
  createApp,
  startServer
};
