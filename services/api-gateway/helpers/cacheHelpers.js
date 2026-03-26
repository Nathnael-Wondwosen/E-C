const responseCacheStore = new Map();
let redisClient = null;
let redisEnabled = false;

const initCacheStore = async ({ redisUrl = '' } = {}) => {
  if (!redisUrl) return;
  try {
    // Optional dependency: if unavailable, fallback to in-memory cache.
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const { createClient } = require('redis');
    redisClient = createClient({ url: redisUrl });
    redisClient.on('error', () => {});
    await redisClient.connect();
    redisEnabled = true;
    console.log('Connected to Redis cache store');
  } catch (error) {
    redisEnabled = false;
    redisClient = null;
    console.warn('Redis unavailable, falling back to in-memory response cache');
  }
};

const buildRequestCacheKey = (req, prefix = '') => {
  const scopeHeader = req.headers['x-market-scope'] || req.headers['x-admin-scope'] || '';
  const scopeQuery = req.query?.scope || '';
  return `${prefix}|${req.originalUrl}|h:${scopeHeader}|q:${scopeQuery}`;
};

const getCachedResponse = async (key) => {
  if (redisEnabled && redisClient) {
    try {
      const value = await redisClient.get(`resp:${key}`);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      // Fall back to memory.
    }
  }

  const entry = responseCacheStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCacheStore.delete(key);
    return null;
  }
  return entry.payload;
};

const setCachedResponse = async (key, payload, ttlMs = 15_000) => {
  if (redisEnabled && redisClient) {
    try {
      await redisClient.set(`resp:${key}`, JSON.stringify(payload), {
        PX: ttlMs
      });
      return;
    } catch (error) {
      // Fall back to memory.
    }
  }

  responseCacheStore.set(key, {
    payload,
    expiresAt: Date.now() + ttlMs
  });
};

const pruneExpiredCacheEntries = () => {
  const now = Date.now();
  for (const [key, value] of responseCacheStore.entries()) {
    if (now > value.expiresAt) {
      responseCacheStore.delete(key);
    }
  }
};

const invalidateCacheByPrefixes = async (prefixes = []) => {
  const normalizedPrefixes = (Array.isArray(prefixes) ? prefixes : [prefixes]).filter(Boolean);
  if (!normalizedPrefixes.length) return;

  if (redisEnabled && redisClient) {
    try {
      for (const prefix of normalizedPrefixes) {
        // eslint-disable-next-line no-await-in-loop
        const keys = await redisClient.keys(`resp:${prefix}|*`);
        if (keys.length) {
          // eslint-disable-next-line no-await-in-loop
          await redisClient.del(keys);
        }
      }
    } catch (error) {
      // Fall back to in-memory invalidation.
    }
  }

  for (const key of responseCacheStore.keys()) {
    if (normalizedPrefixes.some((prefix) => key.startsWith(`${prefix}|`))) {
      responseCacheStore.delete(key);
    }
  }
};

module.exports = {
  initCacheStore,
  buildRequestCacheKey,
  getCachedResponse,
  setCachedResponse,
  pruneExpiredCacheEntries,
  invalidateCacheByPrefixes
};
