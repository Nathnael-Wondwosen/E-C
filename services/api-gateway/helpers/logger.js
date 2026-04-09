// services/api-gateway/helpers/logger.js
// Structured logging helper for consistent log format

const fs = require('fs');
const path = require('path');

const LOG_LEVEL = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

const LOG_COLORS = {
  error: '\x1b[31m',   // Red
  warn: '\x1b[33m',    // Yellow
  info: '\x1b[36m',    // Cyan
  debug: '\x1b[35m',   // Magenta
  reset: '\x1b[0m'
};

const createLogger = (serviceName = 'API') => {
  const logs = [];
  const maxLogs = 1000; // Keep last 1000 logs in memory

  const formatLog = (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      service: serviceName,
      message,
      ...meta
    };
  };

  const writeLog = (level, message, meta) => {
    const logEntry = formatLog(level, message, meta);
    
    // Console output
    const color = LOG_COLORS[level] || '';
    const reset = LOG_COLORS.reset;
    console.log(
      `${color}[${logEntry.timestamp}] [${level.toUpperCase()}]${reset}`,
      message,
      JSON.stringify(meta, null, 2)
    );

    // Store in memory
    logs.push(logEntry);
    if (logs.length > maxLogs) {
      logs.shift();
    }

    return logEntry;
  };

  return {
    error: (message, meta = {}) => writeLog(LOG_LEVEL.ERROR, message, meta),
    warn: (message, meta = {}) => writeLog(LOG_LEVEL.WARN, message, meta),
    info: (message, meta = {}) => writeLog(LOG_LEVEL.INFO, message, meta),
    debug: (message, meta = {}) => writeLog(LOG_LEVEL.DEBUG, message, meta),
    
    // Get logs for debugging
    getLogs: ({ limit = 50, level = null } = {}) => {
      let result = logs;
      if (level) {
        result = result.filter((log) => log.level === level);
      }
      return result.slice(-limit);
    },

    // Export logs to file
    exportToFile: (filename) => {
      const filepath = path.join(process.cwd(), filename);
      fs.writeFileSync(filepath, JSON.stringify(logs, null, 2));
      return filepath;
    }
  };
};

const logger = createLogger(process.env.SERVICE_NAME || 'API-Gateway');

module.exports = logger;
