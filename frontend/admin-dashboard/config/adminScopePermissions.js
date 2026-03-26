const { DEFAULT_ADMIN_SCOPE } = require('./adminScopes');

const SCOPE_ALLOWED_PREFIXES = Object.freeze({
  local: [
    '/dashboard',
    '/customers',
    '/products',
    '/categories',
    '/banners',
    '/sections',
    '/services',
    '/partners',
    '/analytics',
    '/logs'
  ],
  global: [
    '/dashboard',
    '/customers',
    '/products',
    '/categories',
    '/banners',
    '/sections',
    '/services',
    '/partners',
    '/analytics',
    '/logs'
  ],
  africa: [
    '/dashboard',
    '/customers',
    '/products',
    '/categories',
    '/banners',
    '/sections',
    '/services',
    '/partners',
    '/analytics',
    '/logs'
  ],
  china: [
    '/dashboard',
    '/customers',
    '/products',
    '/categories',
    '/banners',
    '/sections',
    '/services',
    '/partners',
    '/analytics',
    '/logs'
  ],
  b2b: [
    '/dashboard',
    '/customers',
    '/products',
    '/categories',
    '/b2b',
    '/services',
    '/partners',
    '/analytics',
    '/logs'
  ],
  system: [
    '/dashboard',
    '/customers',
    '/products',
    '/categories',
    '/banners',
    '/sections',
    '/services',
    '/partners',
    '/analytics',
    '/logs',
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
