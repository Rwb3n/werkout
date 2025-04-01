const logger = require('../utils/logger');

/**
 * Error response structure builder
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object} errors - Validation errors object
 * @returns {object} Formatted error response
 */
const errorResponse = (statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
    statusCode
  };

  if (errors) {
    response.errors = errors;
  }

  return response;
};

/**
 * Not Found middleware - handle 404 errors
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Main error handler - processes all errors and returns standardized responses
 */
const errorHandler = (err, req, res, next) => {
  // Log detailed error information
  logger.logError(`API Error: ${err.message}`, err, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    body: req.body
  });

  // Default status code to 500 if not set
  const statusCode = err.statusCode || 500;
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    return res.status(400).json(
      errorResponse(400, 'Validation Error', formatValidationErrors(err))
    );
  }
  
  if (err.name === 'JsonWebTokenError') {
    // JWT validation error
    return res.status(401).json(
      errorResponse(401, 'Invalid token. Authentication failed.')
    );
  }
  
  if (err.name === 'TokenExpiredError') {
    // JWT expiration error
    return res.status(401).json(
      errorResponse(401, 'Token expired. Please login again.')
    );
  }
  
  if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json(
      errorResponse(409, `Duplicate field value: ${field} already exists.`)
    );
  }

  // Generic error response
  res.status(statusCode).json(
    errorResponse(
      statusCode,
      statusCode === 500 ? 'Server error' : err.message,
      process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
    )
  );
};

/**
 * Format validation errors from Mongoose
 * @param {object} err - Mongoose validation error
 * @returns {object} Formatted error object
 */
const formatValidationErrors = (err) => {
  const formattedErrors = {};
  
  // Handle Mongoose validation errors
  if (err.errors) {
    Object.keys(err.errors).forEach(key => {
      formattedErrors[key] = err.errors[key].message;
    });
  }
  
  return formattedErrors;
};

module.exports = {
  notFound,
  errorHandler
}; 