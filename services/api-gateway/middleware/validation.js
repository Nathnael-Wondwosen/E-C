// services/api-gateway/middleware/validation.js
// Input validation middleware using simple schema validation

const { ApiError } = require('./errorHandler');

/**
 * Simple schema-based validation
 * Supports: required, type, minLength, maxLength, pattern, custom
 */
const createValidator = (schema) => {
  return (req, res, next) => {
    const errors = {};
    const data = req.body || {};

    Object.entries(schema).forEach(([field, rules]) => {
      const value = data[field];

      // Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        return;
      }

      if (value === undefined || value === null) return;

      // Type check
      if (rules.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rules.type) {
          errors[field] = `${field} must be ${rules.type}`;
          return;
        }
      }

      // String validations
      if (typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors[field] = `${field} must be at least ${rules.minLength} characters`;
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors[field] = `${field} must not exceed ${rules.maxLength} characters`;
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors[field] = `${field} format is invalid`;
        }
        if (rules.enum && !rules.enum.includes(value)) {
          errors[field] = `${field} must be one of: ${rules.enum.join(', ')}`;
        }
      }

      // Custom validator
      if (rules.custom) {
        const customError = rules.custom(value);
        if (customError) {
          errors[field] = customError;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      throw new ApiError('Validation failed', 'VALIDATION_ERROR', 400, errors);
    }

    next();
  };
};

/**
 * Validation schemas for common entities
 */
const schemas = {
  userRegister: {
    email: {
      type: 'string',
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    password: {
      type: 'string',
      required: true,
      minLength: 8
    },
    firstName: {
      type: 'string',
      maxLength: 100
    },
    lastName: {
      type: 'string',
      maxLength: 100
    }
  },

  userLogin: {
    email: {
      type: 'string',
      required: true
    },
    password: {
      type: 'string',
      required: true
    }
  },

  productCreate: {
    name: {
      type: 'string',
      required: true,
      minLength: 3,
      maxLength: 200
    },
    description: {
      type: 'string',
      maxLength: 2000
    },
    price: {
      type: 'number',
      required: true,
      custom: (val) => val > 0 ? null : 'Price must be greater than 0'
    },
    scope: {
      type: 'string',
      enum: ['local', 'global', 'africa', 'china', 'b2b']
    }
  },

  cartItem: {
    productId: {
      type: 'string',
      required: true
    },
    quantity: {
      type: 'number',
      required: true,
      custom: (val) => val > 0 ? null : 'Quantity must be at least 1'
    }
  },

  pagination: {
    page: {
      type: 'number',
      custom: (val) => val >= 1 ? null : 'Page must be >= 1'
    },
    limit: {
      type: 'number',
      custom: (val) => val >= 1 && val <= 100 ? null : 'Limit must be 1-100'
    }
  }
};

module.exports = {
  createValidator,
  schemas
};
