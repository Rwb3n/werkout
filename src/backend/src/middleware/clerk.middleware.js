const { Clerk } = require('@clerk/clerk-sdk-node');
const User = require('../models/user.model');
const logger = require('../utils/logger');

// Initialize Clerk
const clerk = Clerk({ apiKey: process.env.CLERK_SECRET_KEY });

/**
 * Middleware to verify Clerk JWT token and attach user to request
 * Used for protected routes
 */
const requireAuth = async (req, res, next) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token not provided'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token with Clerk
    try {
      const { sub: clerkId } = await clerk.verifyToken(token);
      
      if (!clerkId) {
        return res.status(401).json({
          success: false,
          message: 'Invalid authentication token'
        });
      }

      // Get user from database
      const user = await User.findOne({ clerkId });

      // If user doesn't exist in our database yet, we need to create it
      // This allows for seamless user creation when using Clerk
      if (!user) {
        logger.info(`User with Clerk ID ${clerkId} not found in database, fetching from Clerk`);
        
        // Fetch user data from Clerk
        const clerkUser = await clerk.users.getUser(clerkId);
        
        if (!clerkUser) {
          return res.status(401).json({
            success: false,
            message: 'User not found in Clerk'
          });
        }

        // Create a new user in our database
        const newUser = new User({
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          firstName: clerkUser.firstName || 'User',
          lastName: clerkUser.lastName || '',
          profilePicture: clerkUser.imageUrl,
          userType: 'seeker', // Default to seeker, can be updated later
          isVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
          isActive: true,
          createdAt: new Date(clerkUser.createdAt),
          lastLoginAt: new Date()
        });

        await newUser.save();
        logger.info(`Created new user with Clerk ID ${clerkId} in database`);
        
        // Attach new user to request
        req.user = newUser;
      } else {
        // Update last login time
        user.lastLoginAt = new Date();
        user.activityTracking.lastActive = new Date();
        user.activityTracking.sessionCount += 1;
        await user.save();
        
        // Attach existing user to request
        req.user = user;
      }

      next();
    } catch (error) {
      logger.logError('Token verification error', error);
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token'
      });
    }
  } catch (error) {
    logger.logError('Auth middleware error', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

/**
 * Middleware to get current user if authenticated (non-blocking)
 * Used for routes that work for both authenticated and unauthenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;
    
    // If no auth header, continue as unauthenticated
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token with Clerk
    try {
      const { sub: clerkId } = await clerk.verifyToken(token);
      
      if (clerkId) {
        // Get user from database
        const user = await User.findOne({ clerkId });
        
        if (user) {
          // Update last activity time
          user.activityTracking.lastActive = new Date();
          await user.save();
          
          // Attach user to request
          req.user = user;
        } else {
          req.user = null;
        }
      } else {
        req.user = null;
      }
    } catch (error) {
      // Invalid token, continue as unauthenticated
      req.user = null;
    }
    
    next();
  } catch (error) {
    logger.logError('Optional auth middleware error', error);
    // Don't block the request on error
    req.user = null;
    next();
  }
};

/**
 * Middleware to check if user has required role
 * @param {string|string[]} roles - Required role(s) to access the route
 * @returns {function} Express middleware function
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    // This middleware must be used after requireAuth
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Convert single role to array for consistent handling
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    // Check if user has any of the required roles
    if (requiredRoles.includes(req.user.userType)) {
      return next();
    }
    
    // Log unauthorized access attempt
    logger.logError('Unauthorized role access attempt', null, {
      userId: req.user.id,
      userRole: req.user.userType,
      requiredRoles,
      path: req.path,
      method: req.method
    });
    
    // Return forbidden response
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource'
    });
  };
};

module.exports = {
  requireAuth,
  optionalAuth,
  requireRole
}; 