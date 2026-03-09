const jwt = require('jsonwebtoken');

const authenticateTokenFactory = ({ jwtSecret }) =>
  (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing authorization token' });
    }

    try {
      req.auth = jwt.verify(token, jwtSecret);
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  };

const requireSelfOrAdmin = (req, res, next) => {
  const requestedId = req.params.id;
  const authId = req.auth?.sub;
  const roles = req.auth?.roles || [];
  const isAdmin = roles.includes('admin') || req.auth?.role === 'admin';

  if (isAdmin || (requestedId && authId && requestedId === authId)) {
    return next();
  }

  return res.status(403).json({ success: false, message: 'Forbidden' });
};

module.exports = {
  authenticateTokenFactory,
  requireSelfOrAdmin
};
