const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/clerk.middleware');
const ProviderProfile = require('../models/ProviderProfile.model');
const logger = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   - name: Providers
 *     description: Provider profile management
 *   - name: Credentials
 *     description: Provider credentials management
 *   - name: Services
 *     description: Provider services management
 *   - name: Gallery
 *     description: Provider gallery management
 *   - name: Documents
 *     description: Provider verification documents management
 */

/**
 * @swagger
 * /providers/profile:
 *   get:
 *     summary: Get current user's provider profile
 *     tags: [Providers]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Provider profile details
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
 *       404:
 *         description: Provider profile not found
 *       500:
 *         description: Server error
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const providerProfile = await ProviderProfile.findOne({ userId: req.user.id });

    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: providerProfile
    });
  } catch (error) {
    logger.logError('Error fetching provider profile', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /providers/profile:
 *   post:
 *     summary: Create or update provider profile
 *     tags: [Providers]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *                 description: Business or provider name
 *               bio:
 *                 type: string
 *                 description: Detailed profile description
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of provider specialties
 *               experience:
 *                 type: number
 *                 description: Years of experience
 *               languages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Languages spoken
 *               responseTime:
 *                 type: string
 *                 enum: [immediate, within-hour, same-day, within-24-hours, within-48-hours]
 *                 description: Typical response time
 *               providerType:
 *                 type: string
 *                 enum: [trainer, coach, gym, club, event_organizer]
 *                 description: Type of provider
 *               businessHours:
 *                 type: object
 *                 description: Business hours by day of week
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/profile', requireAuth, async (req, res) => {
  try {
    // Fields to update
    const {
      businessName,
      bio,
      specialties,
      experience,
      languages,
      responseTime,
      providerType,
      businessHours
    } = req.body;

    // Validate required fields
    if (req.body.providerType && !['trainer', 'coach', 'gym', 'club', 'event_organizer'].includes(req.body.providerType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider type'
      });
    }

    // Build profile object
    const profileFields = {};
    if (businessName) profileFields.businessName = businessName;
    if (bio) profileFields.bio = bio;
    if (specialties) profileFields.specialties = specialties;
    if (experience !== undefined) profileFields.experience = experience;
    if (languages) profileFields.languages = languages;
    if (responseTime) profileFields.responseTime = responseTime;
    if (providerType) profileFields.providerType = providerType;
    if (businessHours) profileFields.businessHours = businessHours;

    // Check if profile exists
    let providerProfile = await ProviderProfile.findOne({ userId: req.user.id });

    if (providerProfile) {
      // Update
      providerProfile = await ProviderProfile.findOneAndUpdate(
        { userId: req.user.id },
        { $set: profileFields },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        data: providerProfile
      });
    }

    // Ensure user is a provider type
    if (req.user.userType !== 'provider') {
      return res.status(400).json({
        success: false,
        message: 'User must be a provider type to create provider profile'
      });
    }

    // Create
    providerProfile = new ProviderProfile({
      userId: req.user.id,
      ...profileFields
    });

    await providerProfile.save();

    res.status(201).json({
      success: true,
      data: providerProfile
    });
  } catch (error) {
    logger.logError('Error creating/updating provider profile', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /providers/profile/credentials:
 *   post:
 *     summary: Add a credential
 *     tags: [Credentials]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - organization
 *               - year
 *             properties:
 *               title:
 *                 type: string
 *                 description: Credential title (e.g., certification name)
 *               organization:
 *                 type: string
 *                 description: Issuing organization
 *               year:
 *                 type: number
 *                 description: Year credential was issued
 *               verificationUrl:
 *                 type: string
 *                 description: URL for verification (optional)
 *     responses:
 *       200:
 *         description: Credential added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Provider profile not found
 *       500:
 *         description: Server error
 */
router.post('/profile/credentials', requireAuth, async (req, res) => {
  try {
    const { title, organization, year, verificationUrl } = req.body;

    // Validate required fields
    if (!title || !organization || !year) {
      return res.status(400).json({
        success: false,
        message: 'Title, organization and year are required'
      });
    }

    const providerProfile = await ProviderProfile.findOne({ userId: req.user.id });

    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    // Create credential
    const credential = {
      title,
      organization,
      year,
      verificationUrl,
      isVerified: false
    };

    // Add to credentials array
    providerProfile.credentials.push(credential);
    await providerProfile.save();

    res.status(200).json({
      success: true,
      data: providerProfile.credentials
    });
  } catch (error) {
    logger.logError('Error adding credential', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /providers/profile/services:
 *   post:
 *     summary: Add a service
 *     tags: [Services]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *                 description: Service title
 *               description:
 *                 type: string
 *                 description: Service description
 *               type:
 *                 type: string
 *                 enum: [one-on-one, group, online, consultation, assessment, other]
 *                 description: Type of service
 *               isActive:
 *                 type: boolean
 *                 description: Whether service is currently offered
 *     responses:
 *       200:
 *         description: Service added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Provider profile not found
 *       500:
 *         description: Server error
 */
router.post('/profile/services', requireAuth, async (req, res) => {
  try {
    const { title, description, type, isActive } = req.body;

    // Validate required fields
    if (!title || !description || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title, description and type are required'
      });
    }

    const providerProfile = await ProviderProfile.findOne({ userId: req.user.id });

    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    // Create service
    const service = {
      title,
      description,
      type,
      isActive: isActive !== undefined ? isActive : true
    };

    // Add to services array
    providerProfile.services.push(service);
    await providerProfile.save();

    res.status(200).json({
      success: true,
      data: providerProfile.services
    });
  } catch (error) {
    logger.logError('Error adding service', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /providers/profile/services:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Provider profile not found
 *       500:
 *         description: Server error
 */
router.get('/profile/services', requireAuth, async (req, res) => {
  try {
    const providerProfile = await ProviderProfile.findOne({ userId: req.user.id });

    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: providerProfile.services
    });
  } catch (error) {
    logger.logError('Error fetching services', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /providers/profile/gallery:
 *   post:
 *     summary: Add a gallery item
 *     tags: [Gallery]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - url
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [image, video]
 *                 description: Media type
 *               url:
 *                 type: string
 *                 description: URL of the media
 *               caption:
 *                 type: string
 *                 description: Caption for the media
 *               isPublic:
 *                 type: boolean
 *                 description: Whether the item is publicly visible
 *     responses:
 *       200:
 *         description: Gallery item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Provider profile not found
 *       500:
 *         description: Server error
 */
router.post('/profile/gallery', requireAuth, async (req, res) => {
  try {
    const { type, url, caption, isPublic } = req.body;

    // Validate required fields
    if (!type || !url) {
      return res.status(400).json({
        success: false,
        message: 'Media type and URL are required'
      });
    }

    const providerProfile = await ProviderProfile.findOne({ userId: req.user.id });

    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    // Create gallery item
    const galleryItem = {
      type,
      url,
      caption,
      isPublic: isPublic !== undefined ? isPublic : true
    };

    // Add to gallery array
    providerProfile.gallery.push(galleryItem);
    await providerProfile.save();

    res.status(200).json({
      success: true,
      data: providerProfile.gallery
    });
  } catch (error) {
    logger.logError('Error adding gallery item', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /providers/profile/documents:
 *   post:
 *     summary: Add a verification document
 *     tags: [Documents]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - url
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [license, certification, insurance, identification, other]
 *                 description: Document type
 *               url:
 *                 type: string
 *                 description: URL of the document
 *     responses:
 *       200:
 *         description: Document added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Provider profile not found
 *       500:
 *         description: Server error
 */
router.post('/profile/documents', requireAuth, async (req, res) => {
  try {
    const { type, url } = req.body;

    // Validate required fields
    if (!type || !url) {
      return res.status(400).json({
        success: false,
        message: 'Document type and URL are required'
      });
    }

    const providerProfile = await ProviderProfile.findOne({ userId: req.user.id });

    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    // Create document
    const document = {
      type,
      url,
      uploadedAt: Date.now(),
      status: 'pending'
    };

    // Add to verificationDocuments array
    providerProfile.verificationDocuments.push(document);
    await providerProfile.save();

    res.status(200).json({
      success: true,
      data: providerProfile.verificationDocuments
    });
  } catch (error) {
    logger.logError('Error adding verification document', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /providers/profile/completion:
 *   get:
 *     summary: Get profile completion score
 *     tags: [Providers]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile completion information
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
 *                   properties:
 *                     score:
 *                       type: number
 *                       description: Completion percentage (0-100)
 *                     missingFields:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: List of fields that need completion
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Provider profile not found
 *       500:
 *         description: Server error
 */
router.get('/profile/completion', requireAuth, async (req, res) => {
  try {
    const providerProfile = await ProviderProfile.findOne({ userId: req.user.id });

    if (!providerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found'
      });
    }

    // Calculate score
    const score = providerProfile.calculateCompletionScore();

    res.status(200).json({
      success: true,
      data: {
        score,
        missingFields: getMissingFields(providerProfile)
      }
    });
  } catch (error) {
    logger.logError('Error calculating profile completion', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * Helper function to identify missing profile fields
 */
function getMissingFields(profile) {
  const missingFields = [];
  
  if (!profile.bio || profile.bio.length <= 50) missingFields.push('bio');
  if (!profile.businessName) missingFields.push('businessName');
  if (!profile.specialties || profile.specialties.length === 0) missingFields.push('specialties');
  if (!profile.credentials || profile.credentials.length === 0) missingFields.push('credentials');
  if (!profile.services || profile.services.length === 0) missingFields.push('services');
  if (!profile.languages || profile.languages.length === 0) missingFields.push('languages');
  if (!profile.gallery || profile.gallery.length === 0) missingFields.push('gallery');
  if (!profile.verificationDocuments || profile.verificationDocuments.length === 0) missingFields.push('verificationDocuments');
  if (!profile.providerType) missingFields.push('providerType');
  
  // Check if business hours are set
  let hasBusinessHours = false;
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  for (const day of daysOfWeek) {
    if (profile.businessHours && profile.businessHours[day] && 
        profile.businessHours[day].open && profile.businessHours[day].close) {
      hasBusinessHours = true;
      break;
    }
  }
  if (!hasBusinessHours) missingFields.push('businessHours');
  
  return missingFields;
}

module.exports = router; 