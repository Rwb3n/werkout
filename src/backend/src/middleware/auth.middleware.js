const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Middleware to protect routes that require authentication
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'temp_secret');
      
      // In the actual implementation, we would verify the user exists
      // For now, we'll just set a mock user in the request
      req.user = {
        id: decoded.id,
        email: decoded.email
      };
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict routes to specific user types
 */
exports.restrictTo = (...userTypes) => {
  return (req, res, next) => {
    // In the actual implementation, we would check the user's type
    // For now, we'll just allow access
    next();
  };
}; 