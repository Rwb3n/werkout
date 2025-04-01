const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/clerk.middleware');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: User management
 */

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    // Placeholder for actual implementation
    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name
      }
    });
  } catch (error) {
    logger.logError('Error fetching user profile', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router; 