const crypto = require('crypto');

const createRequestIdMiddleware = () => (req, res, next) => {
  const incoming = req.headers['x-request-id'];
  const requestId = incoming || (typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : crypto.randomBytes(16).toString('hex'));

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
};

module.exports = {
  createRequestIdMiddleware
};

