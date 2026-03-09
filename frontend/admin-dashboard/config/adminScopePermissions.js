const { DEFAULT_ADMIN_SCOPE } = require('./adminScopes');

const SCOPE_ALLOWED_PREFIXES = Object.freeze({
  local: [
    '/dashboard',
    '/products',
    '/categories',
    '/banners',
    '/sections',
    '/services',
    '/partners',
    '/analytics'
  ],
  global: [
    '/dashboard',
    '/products',
    '/categories',
    '/banners',
    '/sections',
    '/services',
    '/partners',
    '/analytics'
  ],
  africa: [
    '/dashboard',
    '/products',
    '/categories',
    '/banners',
    '/sections',
    '/services',
    '/partners',
    '/analytics'
  ],
  china: [
    '/dashboard',
    '/products',
    '/categories',
    '/banners',
    '/sections',
    '/services',
    '/partners',
    '/analytics'
  ],
  b2b: [
    '/dashboard',
    '/products',
    '/categories',
    '/b2b',
    '/services',
    '/partners',
    '/analytics'
  ],
  system: [
    '/dashboard',
    '/products',
    '/categories',
    '/banners',
    '/sections',
    '/services',
    '/partners',
    '/analytics',
    '/auto-categorize',
    '/product-variants',
    '/b2b'
  ]
});

const isPathAllowedForScope = (scope, path) => {
  const allowed = SCOPE_ALLOWED_PREFIXES[scope] || SCOPE_ALLOWED_PREFIXES[DEFAULT_ADMIN_SCOPE];
  return allowed.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
};

module.exports = {
  SCOPE_ALLOWED_PREFIXES,
  isPathAllowedForScope
};
