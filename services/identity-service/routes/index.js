const registerHealthRoutes = require('./healthRoutes');
const registerAuthRoutes = require('./authRoutes');
const registerUserRoutes = require('./userRoutes');

const registerRoutes = ({ app, deps }) => {
  const {
    mongoose,
    User,
    bcrypt,
    normalizeRole,
    createToken,
    toResponseUser,
    authenticateToken,
    requireSelfOrAdmin
  } = deps;

  registerHealthRoutes({ app, mongoose });

  registerAuthRoutes({
    app,
    deps: {
      User,
      bcrypt,
      normalizeRole,
      createToken,
      toResponseUser,
      authenticateToken
    }
  });

  registerUserRoutes({
    app,
    deps: {
      User,
      toResponseUser,
      authenticateToken,
      requireSelfOrAdmin
    }
  });
};

module.exports = {
  registerRoutes
};
