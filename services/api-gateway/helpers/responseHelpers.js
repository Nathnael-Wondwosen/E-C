const crypto = require('crypto');
const zlib = require('zlib');

const createEtag = (jsonPayload) => {
  const hash = crypto.createHash('sha1').update(jsonPayload).digest('base64');
  return `"sha1-${hash}"`;
};

const sendOptimizedJson = (
  req,
  res,
  payload,
  { maxAgeSeconds = 30, compressionThreshold = 1024 } = {}
) => {
  const jsonPayload = JSON.stringify(payload);
  const etag = createEtag(jsonPayload);
  const ifNoneMatch = req.headers['if-none-match'];

  res.setHeader('ETag', etag);
  res.setHeader('Cache-Control', `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${Math.max(30, maxAgeSeconds)}`);

  if (ifNoneMatch && ifNoneMatch === etag) {
    return res.status(304).end();
  }

  const acceptsGzip = `${req.headers['accept-encoding'] || ''}`.includes('gzip');
  const payloadSize = Buffer.byteLength(jsonPayload);
  if (!acceptsGzip || payloadSize < compressionThreshold) {
    return res.type('application/json').send(jsonPayload);
  }

  zlib.gzip(jsonPayload, (error, compressedPayload) => {
    if (error) {
      return res.type('application/json').send(jsonPayload);
    }
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
    return res.type('application/json').send(compressedPayload);
  });

  return undefined;
};

module.exports = {
  sendOptimizedJson
};

