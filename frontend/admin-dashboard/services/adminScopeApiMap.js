const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const build = (base, path) => `${base}${path}`;

const ADMIN_SCOPE_API_MAP = Object.freeze({
  local: {
    source: 'project-1',
    endpoints: {
      products: build(API_BASE_URL, '/api/products'),
      categories: build(API_BASE_URL, '/api/categories'),
      sections: build(API_BASE_URL, '/api/hero-slides'),
      banners: build(API_BASE_URL, '/api/banners')
    }
  },
  global: {
    source: 'project-1',
    endpoints: {
      products: build(API_BASE_URL, '/api/products'),
      categories: build(API_BASE_URL, '/api/categories'),
      partners: build(API_BASE_URL, '/api/partners'),
      services: build(API_BASE_URL, '/api/services')
    }
  },
  africa: {
    source: 'project-1',
    endpoints: {
      products: build(API_BASE_URL, '/api/products'),
      categories: build(API_BASE_URL, '/api/categories'),
      partners: build(API_BASE_URL, '/api/partners')
    }
  },
  china: {
    source: 'project-1',
    endpoints: {
      products: build(API_BASE_URL, '/api/products'),
      categories: build(API_BASE_URL, '/api/categories'),
      services: build(API_BASE_URL, '/api/services')
    }
  },
  b2b: {
    source: 'project-2',
    endpoints: {
      products: build(API_BASE_URL, '/api/products'),
      suppliers: build(API_BASE_URL, '/api/partners'),
      matching: build(API_BASE_URL, '/api/b2b')
    }
  },
  system: {
    source: 'project-2',
    endpoints: {
      identity: build(API_BASE_URL, '/api/auth/me'),
      users: build(API_BASE_URL, '/api/users'),
      services: build(API_BASE_URL, '/api/services'),
      partners: build(API_BASE_URL, '/api/partners')
    }
  }
});

export const getScopeApiConfig = (scope) => ADMIN_SCOPE_API_MAP[scope] || ADMIN_SCOPE_API_MAP.system;

export default ADMIN_SCOPE_API_MAP;
