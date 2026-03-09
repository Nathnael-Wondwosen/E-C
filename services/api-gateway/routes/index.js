const registerAuthRoutes = require('./authRoutes');
const registerUserCommerceRoutes = require('./userCommerceRoutes');
const registerContentRoutes = require('./contentRoutes');
const registerCatalogRoutes = require('./catalogRoutes');
const registerServicesPartnersRoutes = require('./servicesPartnersRoutes');
const registerUploadRoutes = require('./uploadRoutes');

const registerGatewayRoutes = ({
  app,
  getDb,
  middleware,
  helpers,
  authDeps,
  userCommerceDeps,
  upload,
  objectId,
  serviceUrls
}) => {
  const {
    authenticateToken,
    requireSelfOrAdmin,
    requireAdmin
  } = middleware;

  registerUploadRoutes({
    app,
    middleware: {
      authenticateToken,
      requireAdmin
    },
    upload
  });

  app.get('/', (req, res) => {
    res.json({
      message: 'API Gateway is running!',
      services: {
        user: serviceUrls.userServiceUrl,
        product: serviceUrls.productServiceUrl
      }
    });
  });

  app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'API Gateway' });
  });

  registerContentRoutes({
    app,
    getDb,
    middleware: {
      authenticateToken,
      requireAdmin
    },
    helpers,
    ObjectId: objectId
  });

  registerCatalogRoutes({
    app,
    getDb,
    middleware: {
      authenticateToken,
      requireAdmin
    },
    helpers,
    ObjectId: objectId
  });

  registerAuthRoutes({
    app,
    getDb,
    deps: authDeps,
    ObjectId: objectId
  });

  registerUserCommerceRoutes({
    app,
    getDb,
    middleware: {
      authenticateToken,
      requireSelfOrAdmin
    },
    deps: userCommerceDeps,
    ObjectId: objectId
  });

  registerServicesPartnersRoutes({
    app,
    getDb,
    middleware: {
      authenticateToken,
      requireAdmin
    },
    helpers,
    ObjectId: objectId
  });
};

module.exports = {
  registerGatewayRoutes
};
