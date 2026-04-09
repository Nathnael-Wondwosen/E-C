const jwt = require('jsonwebtoken');

const isAdminFromClaims = (auth = {}) => {
  if (!auth || typeof auth !== 'object') return false;
  const userType = String(auth.userType || '').toLowerCase();
  const role = String(auth.role || '').toLowerCase();
  const roles = Array.isArray(auth.roles)
    ? auth.roles.map((value) => String(value || '').toLowerCase())
    : [];

  return userType === 'admin' || role === 'admin' || roles.includes('admin');
};

const createAuthTokenFactory = ({ jwtSecret, expiresIn }) =>
  (user) =>
    jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email,
        userType: user.userType || user.role || 'buyer',
        role: user.role || user.userType || 'buyer',
        roles: Array.isArray(user.roles) && user.roles.length
          ? user.roles
          : [user.userType || user.role || 'buyer']
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
  const isAdmin = isAdminFromClaims(req.auth);

  if (isAdmin || (requestedUserId && authUserId && requestedUserId === authUserId)) {
    return next();
  }

  return res.status(403).json({ error: 'Forbidden: you can only access your own resources' });
};

const requireAdmin = (req, res, next) => {
  if (isAdminFromClaims(req.auth)) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden: admin access required' });
};

const requireSellerOrAdmin = (req, res, next) => {
  if (isAdminFromClaims(req.auth)) {
    return next();
  }

  const userType = String(req.auth?.userType || '').toLowerCase();
  const role = String(req.auth?.role || '').toLowerCase();
  const roles = Array.isArray(req.auth?.roles)
    ? req.auth.roles.map((value) => String(value || '').toLowerCase())
    : [];

  if (userType === 'seller' || role === 'seller' || roles.includes('seller')) {
    return next();
  }

  return res.status(403).json({ error: 'Forbidden: seller access required' });
};

module.exports = {
  createAuthTokenFactory,
  authenticateTokenFactory,
  requireSelfOrAdmin,
  requireAdmin,
  requireSellerOrAdmin
};
