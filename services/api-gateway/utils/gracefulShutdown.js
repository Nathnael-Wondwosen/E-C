// services/api-gateway/utils/gracefulShutdown.js
// Handle graceful shutdown on SIGTERM/SIGINT

const logger = require('../helpers/logger');

const setupGracefulShutdown = (server, handlers = {}) => {
  const shutdown = async (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    // Stop accepting new requests
    if (server) {
      server.close(() => {
        logger.info('HTTP server closed');
      });
    }

    // Run custom handlers (close DB connections, etc.)
    try {
      if (handlers.closeDB) {
        await handlers.closeDB();
        logger.info('Database connection closed');
      }
      if (handlers.closeRedis) {
        await handlers.closeRedis();
        logger.info('Redis connection closed');
      }
      if (handlers.onShutdown) {
        await handlers.onShutdown();
      }
    } catch (error) {
      logger.error('Error during shutdown', { error: error.message });
    }

    // Exit process
    logger.info('Graceful shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason: String(reason), promise: String(promise) });
  });
};

module.exports = {
  setupGracefulShutdown
};
