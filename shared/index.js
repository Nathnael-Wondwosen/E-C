// Shared utilities and types for B2B E-Commerce Platform

// Validation schemas
const userSchema = require('./schemas/user');
const productSchema = require('./schemas/product');
const orderSchema = require('./schemas/order');

// Utility functions
const formatDate = require('./utils/formatDate');
const calculateTotal = require('./utils/calculateTotal');

module.exports = {
  schemas: {
    user: userSchema,
    product: productSchema,
    order: orderSchema
  },
  utils: {
    formatDate,
    calculateTotal
  }
};