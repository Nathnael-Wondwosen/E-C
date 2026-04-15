const { loadProjectEnv } = require('../../shared/utils/loadProjectEnv');
loadProjectEnv(__dirname);
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
