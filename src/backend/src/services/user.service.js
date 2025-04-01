const { Clerk } = require('@clerk/clerk-sdk-node');
const User = require('../models/user.model');
const SeekerProfile = require('../models/SeekerProfile.model');
const ProviderProfile = require('../models/ProviderProfile.model');
const logger = require('../utils/logger');

// Initialize Clerk
const clerk = Clerk({ apiKey: process.env.CLERK_SECRET_KEY });

/**
 * Synchronizes user data from Clerk to our database
 * @param {string} clerkId - Clerk user ID
 * @returns {Promise<object>} Updated user object
 */
const syncUserFromClerk = async (clerkId) => {
  try {
    // Fetch user data from Clerk
    const clerkUser = await clerk.users.getUser(clerkId);
    
    if (!clerkUser) {
      throw new Error('User not found in Clerk');
    }

    // Find user in our database
    let user = await User.findOne({ clerkId });

    // Update or create user
    if (user) {
      // Update existing user
      user.email = clerkUser.emailAddresses[0]?.emailAddress || user.email;
      user.firstName = clerkUser.firstName || user.firstName;
      user.lastName = clerkUser.lastName || user.lastName;
      user.profilePicture = clerkUser.imageUrl || user.profilePicture;
      user.isVerified = clerkUser.emailAddresses[0]?.verification?.status === 'verified';
      user.lastUpdatedAt = new Date();
    } else {
      // Create new user
      user = new User({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName || 'User',
        lastName: clerkUser.lastName || '',
        profilePicture: clerkUser.imageUrl,
        userType: 'seeker', // Default to seeker
        isVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
        isActive: true,
        createdAt: new Date(clerkUser.createdAt),
        lastLoginAt: new Date()
      });
    }

    // Save user
    await user.save();
    logger.info(`Synchronized user with Clerk ID ${clerkId}`);
    return user;
  } catch (error) {
    logger.logError('Error synchronizing user from Clerk', error);
    throw error;
  }
};

/**
 * Updates user type and creates corresponding profile if it doesn't exist
 * @param {string} userId - Database user ID
 * @param {string} userType - User type (seeker or provider)
 * @returns {Promise<object>} Updated user object
 */
const updateUserRole = async (userId, userType) => {
  try {
    if (!['seeker', 'provider'].includes(userType)) {
      throw new Error('Invalid user type');
    }

    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Update user type
    user.userType = userType;
    await user.save();

    // Create corresponding profile if it doesn't exist
    if (userType === 'seeker') {
      let seekerProfile = await SeekerProfile.findOne({ userId });
      
      if (!seekerProfile) {
        seekerProfile = new SeekerProfile({
          userId: user._id,
          fitnessLevel: 'beginner'
        });
        await seekerProfile.save();
        logger.info(`Created new seeker profile for user ${userId}`);
      }
    } else if (userType === 'provider') {
      let providerProfile = await ProviderProfile.findOne({ userId });
      
      if (!providerProfile) {
        providerProfile = new ProviderProfile({
          userId: user._id,
          providerType: 'trainer'
        });
        await providerProfile.save();
        logger.info(`Created new provider profile for user ${userId}`);
      }
    }

    return user;
  } catch (error) {
    logger.logError('Error updating user role', error);
    throw error;
  }
};

/**
 * Gets user with corresponding profile based on user type
 * @param {string} userId - Database user ID
 * @returns {Promise<object>} User with profile data
 */
const getUserWithProfile = async (userId) => {
  try {
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    let profileData = null;

    // Get corresponding profile
    if (user.userType === 'seeker') {
      profileData = await SeekerProfile.findOne({ userId });
    } else if (user.userType === 'provider') {
      profileData = await ProviderProfile.findOne({ userId });
    }

    return {
      user,
      profile: profileData
    };
  } catch (error) {
    logger.logError('Error getting user with profile', error);
    throw error;
  }
};

/**
 * Updates user metadata in Clerk
 * @param {string} clerkId - Clerk user ID
 * @param {object} metadata - Metadata to update
 * @returns {Promise<object>} Updated Clerk user
 */
const updateClerkMetadata = async (clerkId, metadata) => {
  try {
    // Update user metadata in Clerk
    const updatedClerkUser = await clerk.users.updateUser(clerkId, {
      publicMetadata: metadata
    });
    
    logger.info(`Updated Clerk metadata for user ${clerkId}`);
    return updatedClerkUser;
  } catch (error) {
    logger.logError('Error updating Clerk metadata', error);
    throw error;
  }
};

module.exports = {
  syncUserFromClerk,
  updateUserRole,
  getUserWithProfile,
  updateClerkMetadata
}; 