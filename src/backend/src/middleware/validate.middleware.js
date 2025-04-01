const { validationResult } = require('express-validator');

/**
 * Middleware to validate request based on specified validation rules
 * @param {Array} validations - Array of express-validator validation rules
 * @returns {Function} Express middleware function
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    // Get validation errors
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors for consistent response
    const formattedErrors = {};
    errors.array().forEach(error => {
      formattedErrors[error.path] = error.msg;
    });

    // Return validation error response
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      statusCode: 400,
      errors: formattedErrors
    });
  };
};

module.exports = validate; 