// services/api-gateway/utils/queryHelpers.js
// Centralized query parameter parsing to reduce code duplication

/**
 * Parse pagination parameters from request
 * Returns { page, limit, skip } or null if no pagination requested
 */
const parsePagination = (req) => {
  const page = req.query.page;
  const limit = req.query.limit;

  // If neither page nor limit provided, no pagination
  if (page === undefined && limit === undefined) {
    return null;
  }

  const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
  const parsedLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    page: parsedPage,
    limit: parsedLimit,
    skip
  };
};

/**
 * Parse cursor-based pagination
 * Returns { limit, cursor } or null if not used
 */
const parseCursorPagination = (req) => {
  const cursor = req.query.cursor;
  const limit = req.query.limit;

  if (cursor === undefined && limit === undefined) {
    return null;
  }

  const parsedLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
  const parsedCursor = typeof cursor === 'string' && cursor.trim() ? cursor.trim() : '';

  return {
    limit: parsedLimit,
    cursor: parsedCursor
  };
};

/**
 * Parse sort parameter: "field:asc" or "field:desc"
 * Returns { field, direction } or null
 */
const parseSort = (req, allowedFields = []) => {
  const sort = req.query.sort;

  if (!sort || typeof sort !== 'string') {
    return null;
  }

  const [field, direction] = sort.split(':');
  const validDirection = direction === 'desc' ? -1 : 1;

  // Security: only allow specified fields
  if (allowedFields.length > 0 && !allowedFields.includes(field)) {
    return null;
  }

  return {
    [field]: validDirection
  };
};

/**
 * Parse search/filter parameters
 * Filters request query to only include safe search fields
 */
const parseSearchFilters = (req, allowedFields = []) => {
  const filters = {};

  Object.entries(req.query).forEach(([key, value]) => {
    if (allowedFields.includes(key) && value) {
      if (key.includes('_min') || key.includes('_max')) {
        // Range query
        filters[key] = Number(value);
      } else if (key.includes('_eq')) {
        // Exact match
        filters[key.replace('_eq', '')] = value;
      } else {
        // Like/contains
        filters[key] = { $regex: value, $options: 'i' };
      }
    }
  });

  return Object.keys(filters).length > 0 ? filters : null;
};

/**
 * Build MongoDB projection from requested fields
 * Safety: only include fields from whitelist
 */
const parseProjection = (req, availableFields = []) => {
  const fields = req.query.fields;

  if (!fields || typeof fields !== 'string') {
    return null;
  }

  const projection = {};
  fields.split(',').forEach((field) => {
    const trimmed = field.trim();
    if (availableFields.includes(trimmed)) {
      projection[trimmed] = 1;
    }
  });

  return Object.keys(projection).length > 0 ? projection : null;
};

module.exports = {
  parsePagination,
  parseCursorPagination,
  parseSort,
  parseSearchFilters,
  parseProjection
};
