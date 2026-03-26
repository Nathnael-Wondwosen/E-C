const createRateLimiter = ({ maxRequestsPerMinute = 300, db = null } = {}) => {
  const requestsByIp = new Map();
  const windowMs = 60 * 1000;

  return async (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const minuteBucket = Math.floor(now / windowMs);

    if (db) {
      try {
        const collection = db.collection('rate_limits');
        const key = `${ip}|${minuteBucket}`;
        const ttlDate = new Date(now + 2 * windowMs);
        const result = await collection.findOneAndUpdate(
          { key },
          {
            $inc: { count: 1 },
            $setOnInsert: { key, ip, minuteBucket, expireAt: ttlDate }
          },
          { upsert: true, returnDocument: 'after' }
        );
        const count = result?.value?.count || 1;
        if (count > maxRequestsPerMinute) {
          res.setHeader('Retry-After', '60');
          return res.status(429).json({ error: 'Too many requests. Please slow down.' });
        }
        return next();
      } catch (error) {
        // Fallback to in-memory limiter if Mongo check fails.
      }
    }

    const entry = requestsByIp.get(ip) || { count: 0, windowStart: now };

    if (now - entry.windowStart >= windowMs) {
      entry.count = 0;
      entry.windowStart = now;
    }

    entry.count += 1;
    requestsByIp.set(ip, entry);

    if (entry.count > maxRequestsPerMinute) {
      res.setHeader('Retry-After', '60');
      return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    }

    return next();
  };
};

module.exports = {
  createRateLimiter
};
