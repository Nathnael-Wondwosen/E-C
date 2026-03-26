const createRequestLogCollector = ({ maxEntries = 2000 } = {}) => {
  const logs = [];

  const middleware = (req, res, next) => {
    const startedAt = process.hrtime.bigint();

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      const statusCode = res.statusCode;
      const errorClass = statusCode >= 500 ? 'server_error' : statusCode >= 400 ? 'client_error' : 'ok';

      const payload = {
        ts: new Date().toISOString(),
        requestId: req.requestId || '',
        method: req.method,
        path: req.originalUrl || req.path,
        route: req.route?.path || req.path || 'unknown',
        statusCode,
        errorClass,
        durationMs: Number(durationMs.toFixed(2)),
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || ''
      };

      logs.push(payload);
      if (logs.length > maxEntries) {
        logs.shift();
      }

      console.log(JSON.stringify(payload));
    });

    next();
  };

  const getSnapshot = ({ requestId = '', limit = 200 } = {}) => {
    const safeLimit = Math.min(1000, Math.max(1, Number.parseInt(limit, 10) || 200));
    const normalizedRequestId = `${requestId || ''}`.trim();

    const filtered = normalizedRequestId
      ? logs.filter((item) => item.requestId === normalizedRequestId)
      : logs;

    return filtered.slice(-safeLimit).reverse();
  };

  return {
    middleware,
    getSnapshot
  };
};

module.exports = {
  createRequestLogCollector
};
