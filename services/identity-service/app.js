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

const ensureAdminUser = async ({ env }) => {
  const { adminUsername, adminPassword } = env;

  if (!adminUsername || !adminPassword) {
    console.warn('identity-service: ADMIN_USERNAME/ADMIN_PASSWORD not set, admin bootstrap skipped');
    return;
  }

  const normalizedUsername = String(adminUsername).trim();
  const normalizedEmail = `${normalizedUsername}@admin.local`.toLowerCase();
  const existingUser =
    (await User.findOne({ username: normalizedUsername })) ||
    (await User.findOne({ email: normalizedEmail }));

  const passwordHash = await bcrypt.hash(String(adminPassword), 10);

  if (!existingUser) {
    await User.create({
      email: normalizedEmail,
      username: normalizedUsername,
      passwordHash,
      status: 'active',
      role: 'admin',
      roles: ['admin'],
      displayName: 'Administrator',
      authProvider: 'local'
    });
    console.log(`identity-service: bootstrapped admin user "${normalizedUsername}"`);
    return;
  }

  existingUser.email = normalizedEmail;
  existingUser.username = normalizedUsername;
  existingUser.passwordHash = passwordHash;
  existingUser.status = 'active';
  existingUser.role = 'admin';
  existingUser.roles = Array.from(new Set([...(existingUser.roles || []), 'admin']));
  existingUser.displayName = existingUser.displayName || 'Administrator';
  existingUser.authProvider = existingUser.authProvider || 'local';
  await existingUser.save();
  console.log(`identity-service: ensured admin user "${normalizedUsername}"`);
};

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
  await ensureAdminUser({ env });

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
