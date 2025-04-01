const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const logger = require('../utils/logger');
const { requireAuth } = require('../middleware/clerk.middleware');
const validate = require('../middleware/validate.middleware');
const { body } = require('express-validator');

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user info
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
router.get('/me', requireAuth, authController.getCurrentUser);

/**
 * @swagger
 * /auth/sync:
 *   post:
 *     summary: Sync user data from Clerk
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User data synchronized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User data synchronized successfully
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/sync', requireAuth, authController.syncUser);

/**
 * @swagger
 * /auth/user-type:
 *   put:
 *     summary: Update user type (seeker or provider)
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userType
 *             properties:
 *               userType:
 *                 type: string
 *                 enum: [seeker, provider]
 *                 description: User type
 *     responses:
 *       200:
 *         description: User type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User type updated successfully
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid user type
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put(
  '/user-type',
  requireAuth,
  validate([
    body('userType')
      .isIn(['seeker', 'provider'])
      .withMessage('User type must be either seeker or provider')
  ]),
  authController.updateUserType
);

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Public
 */
router.post('/logout', authController.logout);

/**
 * @route GET /api/auth/verify
 * @desc Verify email with token
 * @access Public
 */
router.get('/verify', authController.verifyEmail);

/**
 * @route POST /api/auth/password/reset
 * @desc Request password reset
 * @access Public
 */
router.post('/password/reset', authController.requestPasswordReset);

/**
 * @route POST /api/auth/password/reset/:token
 * @desc Reset password with token
 * @access Public
 */
router.post('/password/reset/:token', authController.resetPassword);

module.exports = router; 