// services/api-gateway/middleware/errorHandler.js
// Global error handling middleware for consistent error responses

const logger = require('../helpers/logger');

/**
 * Error response standardization
 * All errors return consistent format:
 * { success: false, error: string, code: string, details?: object }
 */
class ApiError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500, details = null) {
    super(message);
    if (typeof code === 'number') {
      this.code = 'API_ERROR';
      this.statusCode = code;
      this.details = statusCode && typeof statusCode === 'object' ? statusCode : details;
    } else {
      this.code = code;
      this.statusCode = statusCode;
      this.details = details;
    }
    this.name = 'ApiError';
  }
}

const createErrorHandler = () => {
  return (err, req, res, _next) => {
    const requestId = req.id || 'unknown';
    
    // Extract error info
    const statusCode = err.statusCode || err.status || 500;
    const code = err.code || 'INTERNAL_ERROR';
    const message = err.message || 'An unexpected error occurred';
    const details = err.details || null;

    // Log error
    logger.error({
      requestId,
      code,
      message,
      stack: err.stack,
      statusCode,
      method: req.method,
      path: req.path
    });

    // Send standardized error response
    res.status(statusCode).json({
      success: false,
      error: message,
      code,
      ...(details && { details }),
      requestId // Help with debugging
    });
  };
};

/**
 * Wrapper for async route handlers to catch errors
 * Usage: router.get('/', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  ApiError,
  createErrorHandler,
  asyncHandler
};
