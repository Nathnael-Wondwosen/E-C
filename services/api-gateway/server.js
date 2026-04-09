const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { startServer } = require('./app');
const logger = require('./helpers/logger');

// Start server with proper error handling
startServer().catch((error) => {
  logger.error('Failed to start API Gateway', {
    message: error.message || error,
    stack: error.stack
  });
  process.exit(1);
});
