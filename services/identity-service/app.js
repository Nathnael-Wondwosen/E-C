const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');

const { loadIdentityEnv } = require('./config/env');
const { connectToMongo, mongoose } = require('./config/database');
const User = require('./models/user');
const { normalizeRole } = require('./helpers/roleHelpers');
const { createTokenFactory, toResponseUser } = require('./helpers/authHelpers');
const { authenticateTokenFactory, requireSelfOrAdmin } = require('./middleware/authMiddleware');
const { registerRoutes } = require('./routes');

const createApp = ({ env }) => {
  const app = express();
  const createToken = createTokenFactory({
    jwtSecret: env.jwtSecret,
    jwtExpiresIn: env.jwtExpiresIn
  });
  const authenticateToken = authenticateTokenFactory({ jwtSecret: env.jwtSecret });

  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json());

  registerRoutes({
    app,
    deps: {
      mongoose,
      User,
      bcrypt,
      normalizeRole,
      createToken,
      toResponseUser,
      authenticateToken,
      requireSelfOrAdmin
    }
  });

  return app;
};

const startServer = async () => {
  const env = loadIdentityEnv();
  await connectToMongo({ mongoUri: env.mongoUri, dbName: env.dbName });

  const app = createApp({ env });
  app.listen(env.port, () => {
    console.log(`identity-service running on port ${env.port}`);
  });

  return app;
};

module.exports = {
  createApp,
  startServer
};
