const jwt = require('jsonwebtoken');

const createTokenFactory = ({ jwtSecret, jwtExpiresIn }) =>
  (user) =>
    jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
        roles: user.roles,
        source: 'identity-service'
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

const toResponseUser = (user) => ({
  id: user._id.toString(),
  _id: user._id.toString(),
  email: user.email,
  username: user.username,
  displayName: user.displayName,
  status: user.status,
  userType: user.role || (Array.isArray(user.roles) && user.roles.length ? user.roles[0] : 'buyer'),
  role: user.role,
  roles: user.roles,
  profile: user.profile,
  sourceRefs: user.sourceRefs,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

module.exports = {
  createTokenFactory,
  toResponseUser
};
