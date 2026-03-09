const createProxyJsonToIdentityService = ({ identityServiceUrl }) =>
  async (req, res, path) => {
    if (!identityServiceUrl) {
      return false;
    }

    if (typeof fetch !== 'function') {
      return res.status(500).json({ error: 'Node runtime does not support fetch for identity-service proxying' });
    }

    try {
      const upstreamResponse = await fetch(`${identityServiceUrl}${path}`, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {})
        },
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body || {})
      });

      const responseText = await upstreamResponse.text();
      const contentType = upstreamResponse.headers.get('content-type') || '';

      res.status(upstreamResponse.status);
      if (contentType.includes('application/json')) {
        return res.type('application/json').send(responseText);
      }
      return res.send(responseText);
    } catch (error) {
      console.error('Failed to proxy request to identity-service:', error);
      return res.status(502).json({ error: 'Identity service is unavailable' });
    }
  };

module.exports = {
  createProxyJsonToIdentityService
};
