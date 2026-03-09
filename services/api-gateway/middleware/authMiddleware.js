const jwt = require('jsonwebtoken');

const createAuthTokenFactory = ({ jwtSecret, expiresIn }) =>
  (user) =>
    jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email,
        userType: user.userType || 'buyer'
      },
      jwtSecret,
      { expiresIn: expiresIn || '7d' }
    );

const authenticateTokenFactory = ({ jwtSecret }) =>
  (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.auth = decoded;
      return next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };

const requireSelfOrAdmin = (req, res, next) => {
  const requestedUserId = req.params.id;
  const authUserId = req.auth?.sub;
  const isAdmin = req.auth?.userType === 'admin';

  if (isAdmin || (requestedUserId && authUserId && requestedUserId === authUserId)) {
    return next();
  }

  return res.status(403).json({ error: 'Forbidden: you can only access your own resources' });
};

const requireAdmin = (req, res, next) => {
  if (req.auth?.userType === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: admin access required' });
};

module.exports = {
  createAuthTokenFactory,
  authenticateTokenFactory,
  requireSelfOrAdmin,
  requireAdmin
};
