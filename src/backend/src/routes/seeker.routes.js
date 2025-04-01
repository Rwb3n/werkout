const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/clerk.middleware');
const SeekerProfile = require('../models/SeekerProfile.model');
const logger = require('../utils/logger');
const validate = require('../middleware/validate.middleware');
const {
  profileValidation,
  createWorkoutValidation,
  updateWorkoutValidation,
  getWorkoutsValidation,
  journeyMilestoneValidation,
  measurementsValidation
} = require('../validations/seeker.validation');

/**
 * @route   GET /api/seekers/profile
 * @desc    Get current user's seeker profile
 * @access  Private
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const seekerProfile = await SeekerProfile.findOne({ userId: req.user.id });

    if (!seekerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Seeker profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: seekerProfile
    });
  } catch (error) {
    logger.logError('Error fetching seeker profile', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/seekers/profile
 * @desc    Create or update seeker profile
 * @access  Private
 */
router.post('/profile', requireAuth, validate(profileValidation), async (req, res) => {
  try {
    // Fields to update
    const {
      bio,
      fitnessLevel,
      fitnessGoals,
      interests,
      preferredTrainingTypes,
      medicalConsiderations,
      measurements
    } = req.body;

    // Build profile object
    const profileFields = {};
    if (bio) profileFields.bio = bio;
    if (fitnessLevel) profileFields.fitnessLevel = fitnessLevel;
    if (fitnessGoals) profileFields.fitnessGoals = fitnessGoals;
    if (interests) profileFields.interests = interests;
    if (preferredTrainingTypes) profileFields.preferredTrainingTypes = preferredTrainingTypes;
    if (medicalConsiderations) profileFields.medicalConsiderations = medicalConsiderations;
    if (measurements) profileFields.measurements = measurements;

    // Check if profile exists
    let seekerProfile = await SeekerProfile.findOne({ userId: req.user.id });

    if (seekerProfile) {
      // Update
      seekerProfile = await SeekerProfile.findOneAndUpdate(
        { userId: req.user.id },
        { $set: profileFields },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        data: seekerProfile
      });
    }

    // Create
    seekerProfile = new SeekerProfile({
      userId: req.user.id,
      ...profileFields
    });

    await seekerProfile.save();

    res.status(201).json({
      success: true,
      data: seekerProfile
    });
  } catch (error) {
    logger.logError('Error creating/updating seeker profile', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/seekers/profile/journey
 * @desc    Add fitness journey milestone
 * @access  Private
 */
router.post('/profile/journey', requireAuth, validate(journeyMilestoneValidation), async (req, res) => {
  try {
    const { title, description, date, isPublic } = req.body;

    const seekerProfile = await SeekerProfile.findOne({ userId: req.user.id });

    if (!seekerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Seeker profile not found'
      });
    }

    // Create milestone
    const milestone = {
      title,
      description,
      date: date || Date.now(),
      isPublic: isPublic !== undefined ? isPublic : true
    };

    // Add to journey array
    seekerProfile.fitnessJourney.unshift(milestone);
    await seekerProfile.save();

    res.status(200).json({
      success: true,
      data: seekerProfile.fitnessJourney
    });
  } catch (error) {
    logger.logError('Error adding journey milestone', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/seekers/profile/measurements
 * @desc    Update measurements
 * @access  Private
 */
router.put('/profile/measurements', requireAuth, validate(measurementsValidation), async (req, res) => {
  try {
    const { height, weight, bodyFat } = req.body;

    const seekerProfile = await SeekerProfile.findOne({ userId: req.user.id });

    if (!seekerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Seeker profile not found'
      });
    }

    // Build measurements object
    const measurementsUpdate = {};
    if (height !== undefined) measurementsUpdate.height = height;
    if (weight !== undefined) measurementsUpdate.weight = weight;
    if (bodyFat !== undefined) measurementsUpdate.bodyFat = bodyFat;
    
    // Add last updated timestamp
    measurementsUpdate.lastUpdated = Date.now();

    // Update measurements
    seekerProfile.measurements = {
      ...seekerProfile.measurements,
      ...measurementsUpdate
    };

    await seekerProfile.save();

    res.status(200).json({
      success: true,
      data: seekerProfile.measurements
    });
  } catch (error) {
    logger.logError('Error updating measurements', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/seekers/profile/completion
 * @desc    Get profile completion score
 * @access  Private
 */
router.get('/profile/completion', requireAuth, async (req, res) => {
  try {
    const seekerProfile = await SeekerProfile.findOne({ userId: req.user.id });

    if (!seekerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Seeker profile not found'
      });
    }

    // Calculate score
    const score = seekerProfile.calculateCompletionScore();

    res.status(200).json({
      success: true,
      data: {
        score,
        missingFields: getMissingFields(seekerProfile)
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
 * @swagger
 * /seekers/profile/workouts:
 *   post:
 *     summary: Add a new workout
 *     tags: [Workouts]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workoutType
 *               - duration
 *               - intensityLevel
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Workout date (defaults to current date if not provided)
 *               workoutType:
 *                 type: string
 *                 enum: [strength, cardio, flexibility, sports, crossfit, other]
 *                 description: Type of workout
 *               duration:
 *                 type: number
 *                 description: Duration in minutes
 *               intensityLevel:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: Workout intensity level
 *               notes:
 *                 type: string
 *                 description: Notes about the workout
 *               metrics:
 *                 type: object
 *                 description: Workout-specific measurements
 *                 properties:
 *                   distance:
 *                     type: number
 *                     description: Distance covered (for cardio)
 *                   sets:
 *                     type: number
 *                     description: Number of sets (for strength)
 *                   reps:
 *                     type: number
 *                     description: Number of reps (for strength)
 *                   weight:
 *                     type: number
 *                     description: Weight used (for strength)
 *                   calories:
 *                     type: number
 *                     description: Calories burned
 *               isPublic:
 *                 type: boolean
 *                 description: Whether the workout is visible to others
 *     responses:
 *       201:
 *         description: Workout created successfully
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
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Seeker profile not found
 *       500:
 *         description: Server error
 */
router.post('/profile/workouts', requireAuth, validate(createWorkoutValidation), async (req, res) => {
  try {
    const {
      date,
      workoutType,
      duration,
      intensityLevel,
      notes,
      metrics,
      isPublic
    } = req.body;

    const seekerProfile = await SeekerProfile.findOne({ userId: req.user.id });

    if (!seekerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Seeker profile not found'
      });
    }

    // Create new workout object
    const newWorkout = {
      date: date || Date.now(),
      workoutType,
      duration,
      intensityLevel,
      notes,
      metrics,
      isPublic: isPublic !== undefined ? isPublic : false
    };

    // Add to workouts array
    seekerProfile.workouts.push(newWorkout);
    await seekerProfile.save();

    res.status(201).json({
      success: true,
      data: seekerProfile.workouts[seekerProfile.workouts.length - 1]
    });
  } catch (error) {
    logger.logError('Error adding workout', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /seekers/profile/workouts:
 *   get:
 *     summary: Get all workouts
 *     tags: [Workouts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter workouts by start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter workouts by end date (YYYY-MM-DD)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter workouts by type
 *     responses:
 *       200:
 *         description: List of workouts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Seeker profile not found
 *       500:
 *         description: Server error
 */
router.get('/profile/workouts', requireAuth, validate(getWorkoutsValidation), async (req, res) => {
  try {
    const seekerProfile = await SeekerProfile.findOne({ userId: req.user.id });

    if (!seekerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Seeker profile not found'
      });
    }

    // Sort workouts by date (newest first)
    const workouts = seekerProfile.workouts.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      count: workouts.length,
      data: workouts
    });
  } catch (error) {
    logger.logError('Error fetching workouts', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /seekers/profile/workouts/{id}:
 *   get:
 *     summary: Get a specific workout
 *     tags: [Workouts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout ID
 *     responses:
 *       200:
 *         description: Workout details
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
 *         description: Workout or seeker profile not found
 *       500:
 *         description: Server error
 */
router.get('/profile/workouts/:id', requireAuth, async (req, res) => {
  try {
    const seekerProfile = await SeekerProfile.findOne({ userId: req.user.id });

    if (!seekerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Seeker profile not found'
      });
    }

    // Find the workout by ID
    const workout = seekerProfile.workouts.id(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (error) {
    logger.logError('Error fetching workout', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /seekers/profile/workouts/{id}:
 *   put:
 *     summary: Update a workout
 *     tags: [Workouts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               workoutType:
 *                 type: string
 *                 enum: [strength, cardio, flexibility, sports, crossfit, other]
 *               duration:
 *                 type: number
 *               intensityLevel:
 *                 type: string
 *                 enum: [low, medium, high]
 *               notes:
 *                 type: string
 *               metrics:
 *                 type: object
 *                 properties:
 *                   distance:
 *                     type: number
 *                   sets:
 *                     type: number
 *                   reps:
 *                     type: number
 *                   weight:
 *                     type: number
 *                   calories:
 *                     type: number
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Workout updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workout or seeker profile not found
 *       500:
 *         description: Server error
 */
router.put('/profile/workouts/:id', requireAuth, validate(updateWorkoutValidation), async (req, res) => {
  try {
    const seekerProfile = await SeekerProfile.findOne({ userId: req.user.id });

    if (!seekerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Seeker profile not found'
      });
    }

    // Find workout index
    const workoutIndex = seekerProfile.workouts.findIndex(w => w._id.toString() === req.params.id);

    if (workoutIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Update fields
    const {
      date,
      workoutType,
      duration,
      intensityLevel,
      notes,
      metrics,
      isPublic
    } = req.body;

    if (date) seekerProfile.workouts[workoutIndex].date = date;
    if (workoutType) seekerProfile.workouts[workoutIndex].workoutType = workoutType;
    if (duration) seekerProfile.workouts[workoutIndex].duration = duration;
    if (intensityLevel) seekerProfile.workouts[workoutIndex].intensityLevel = intensityLevel;
    if (notes !== undefined) seekerProfile.workouts[workoutIndex].notes = notes;
    if (metrics) {
      seekerProfile.workouts[workoutIndex].metrics = {
        ...seekerProfile.workouts[workoutIndex].metrics,
        ...metrics
      };
    }
    if (isPublic !== undefined) seekerProfile.workouts[workoutIndex].isPublic = isPublic;

    await seekerProfile.save();

    res.status(200).json({
      success: true,
      data: seekerProfile.workouts[workoutIndex]
    });
  } catch (error) {
    logger.logError('Error updating workout', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /seekers/profile/workouts/{id}:
 *   delete:
 *     summary: Delete a workout
 *     tags: [Workouts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout ID
 *     responses:
 *       200:
 *         description: Workout deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Workout or seeker profile not found
 *       500:
 *         description: Server error
 */
router.delete('/profile/workouts/:id', requireAuth, async (req, res) => {
  try {
    const seekerProfile = await SeekerProfile.findOne({ userId: req.user.id });

    if (!seekerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Seeker profile not found'
      });
    }

    // Find workout index
    const workoutIndex = seekerProfile.workouts.findIndex(w => w._id.toString() === req.params.id);

    if (workoutIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Remove workout
    seekerProfile.workouts.splice(workoutIndex, 1);
    await seekerProfile.save();

    res.status(200).json({
      success: true,
      message: 'Workout deleted successfully'
    });
  } catch (error) {
    logger.logError('Error deleting workout', error);
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
  
  if (!profile.bio || profile.bio.trim() === '') {
    missingFields.push('bio');
  }

  if (!profile.fitnessGoals || profile.fitnessGoals.length === 0) {
    missingFields.push('fitnessGoals');
  }

  if (!profile.interests || profile.interests.length === 0) {
    missingFields.push('interests');
  }

  if (!profile.preferredTrainingTypes || profile.preferredTrainingTypes.length === 0) {
    missingFields.push('preferredTrainingTypes');
  }

  if (!profile.measurements || (!profile.measurements.height && !profile.measurements.weight)) {
    missingFields.push('measurements');
  }

  return missingFields;
}

module.exports = router; 