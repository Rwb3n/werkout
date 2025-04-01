const winston = require('winston');
const { createLogger, format, transports } = winston;
require('winston-daily-rotate-file');
const fs = require('fs');
const path = require('path');

// Ensure log directory exists
const logDir = path.join(__dirname, '../../../../logs/backend');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create error log directory
const errorLogDir = path.join(logDir, 'errors');
if (!fs.existsSync(errorLogDir)) {
  fs.mkdirSync(errorLogDir, { recursive: true });
}

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Create file transports
const fileTransport = new transports.DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: process.env.LOG_LEVEL || 'info'
});

// Create error log transport
const errorFileTransport = new transports.DailyRotateFile({
  filename: path.join(errorLogDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error'
});

// Create console transport (for development)
const consoleTransport = new transports.Console({
  format: format.combine(
    format.colorize(),
    format.printf(({ timestamp, level, message, ...rest }) => {
      const restString = Object.keys(rest).length ? JSON.stringify(rest, null, 2) : '';
      return `${timestamp} [${level}]: ${message} ${restString}`;
    })
  )
});

// Create the logger
const logger = createLogger({
  format: logFormat,
  defaultMeta: { service: 'werkout-backend' },
  transports: [
    fileTransport,
    errorFileTransport
  ]
});

// Add console transport in development environment
if (process.env.NODE_ENV !== 'production') {
  logger.add(consoleTransport);
}

/**
 * Enhanced logging function for errors with context
 * @param {string} message - Error message
 * @param {Error|Object} error - Error object or any object with context
 * @param {Object} additionalInfo - Any additional information to include
 */
const logError = (message, error, additionalInfo = {}) => {
  let errorObj = {
    message: message,
    ...additionalInfo
  };

  if (error instanceof Error) {
    errorObj.errorMessage = error.message;
    errorObj.stack = error.stack;
  } else if (error) {
    errorObj.errorDetails = error;
  }

  logger.error(errorObj);
};

/**
 * Log a deprecation warning
 * @param {string} feature - Feature that is deprecated
 * @param {string} alternative - Alternative to use instead
 */
const logDeprecation = (feature, alternative) => {
  logger.warn({
    type: 'DEPRECATION',
    feature,
    alternative,
    message: `The ${feature} is deprecated. Please use ${alternative} instead.`
  });
};

/**
 * Log an API request (can be used as middleware)
 */
const logAPIRequest = (req, res, next) => {
  const start = Date.now();
  
  // Once the request is processed
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      type: 'API_REQUEST',
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });

  next();
};

// Export the logger functions
module.exports = {
  info: logger.info.bind(logger),
  error: logger.error.bind(logger),
  warn: logger.warn.bind(logger),
  debug: logger.debug.bind(logger),
  logError,
  logDeprecation,
  logAPIRequest,
  stream: {
    write: (message) => {
      logger.info(message.trim());
    }
  }
}; 