// services/api-gateway/docs/swagger.js
// Swagger/OpenAPI specification for API documentation
// Generates interactive API docs at /api/docs

const swaggerTemplate = {
  openapi: '3.0.0',
  info: {
    title: 'B2B E-Commerce Platform API',
    description: 'Professional API documentation for the e-commerce platform',
    version: '2.0.0',
    contact: {
      name: 'API Support',
      url: 'https://yourdomain.com/support'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server'
    },
    {
      url: 'https://api.yourdomain.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT auth token'
      }
    },
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          scope: { type: 'string', enum: ['local', 'global', 'africa', 'china', 'b2b'] },
          stock: { type: 'number' },
          images: { type: 'array', items: { type: 'string' } },
          isFeatured: { type: 'boolean' },
          isActive: { type: 'boolean' }
        }
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          orderNumber: { type: 'string' },
          userId: { type: 'string' },
          items: { type: 'array' },
          subtotal: { type: 'number' },
          tax: { type: 'number' },
          shipping: { type: 'number' },
          total: { type: 'number' },
          status: { type: 'string', enum: ['pending', 'confirmed', 'shipped', 'delivered'] },
          paymentStatus: { type: 'string', enum: ['pending', 'completed', 'failed'] }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          code: { type: 'string' }
        }
      }
    }
  },
  paths: {
    '/api/products': {
      get: {
        summary: 'List products',
        parameters: [
          { name: 'scope', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'number', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'number', default: 20 } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'List of products',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
                    pagination: {
                      type: 'object',
                      properties: {
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        total: { type: 'number' },
                        pages: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create product (admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Product' }
            }
          }
        },
        responses: {
          201: { description: 'Product created' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden - admin required' },
          400: { description: 'Validation error' }
        }
      }
    },
    '/api/products/{id}': {
      get: {
        summary: 'Get product by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Product details' },
          404: { description: 'Product not found' }
        }
      }
    },
    '/api/users/{id}/orders': {
      get: {
        summary: 'List user orders',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'number' } },
          { name: 'limit', in: 'query', schema: { type: 'number' } },
          { name: 'status', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'List of orders' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' }
        }
      },
      post: {
        summary: 'Create order',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: {
          201: { description: 'Order created' },
          400: { description: 'Validation error' }
        }
      }
    }
  }
};

module.exports = swaggerTemplate;
