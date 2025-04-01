const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: API health and status
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API health
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Server is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Server error
 */
router.get('/', (req, res) => {
  logger.info('Health check endpoint accessed');
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 