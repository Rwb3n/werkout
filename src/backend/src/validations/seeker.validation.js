const { body, param, query } = require('express-validator');

/**
 * Validation rules for creating/updating seeker profile
 */
const profileValidation = [
  body('bio')
    .optional()
    .isString()
    .withMessage('Bio must be a string')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  
  body('fitnessLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Fitness level must be beginner, intermediate, or advanced'),
  
  body('fitnessGoals')
    .optional()
    .isArray()
    .withMessage('Fitness goals must be an array of strings'),
  
  body('fitnessGoals.*')
    .optional()
    .isString()
    .withMessage('Each fitness goal must be a string')
    .trim(),
  
  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array of strings'),
  
  body('interests.*')
    .optional()
    .isString()
    .withMessage('Each interest must be a string')
    .trim(),
  
  body('preferredTrainingTypes')
    .optional()
    .isArray()
    .withMessage('Preferred training types must be an array of strings'),
  
  body('preferredTrainingTypes.*')
    .optional()
    .isString()
    .withMessage('Each training type must be a string')
    .trim(),
  
  body('medicalConsiderations')
    .optional()
    .isString()
    .withMessage('Medical considerations must be a string')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Medical considerations cannot be more than 1000 characters')
];

/**
 * Validation rules for creating a workout
 */
const createWorkoutValidation = [
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  
  body('workoutType')
    .notEmpty()
    .withMessage('Workout type is required')
    .isIn(['strength', 'cardio', 'flexibility', 'sports', 'crossfit', 'other'])
    .withMessage('Invalid workout type'),
  
  body('duration')
    .notEmpty()
    .withMessage('Duration is required')
    .isNumeric()
    .withMessage('Duration must be a number')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 minute'),
  
  body('intensityLevel')
    .notEmpty()
    .withMessage('Intensity level is required')
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid intensity level'),
  
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot be more than 500 characters'),
  
  body('metrics')
    .optional()
    .isObject()
    .withMessage('Metrics must be an object'),
  
  body('metrics.distance')
    .optional()
    .isNumeric()
    .withMessage('Distance must be a number')
    .isFloat({ min: 0 })
    .withMessage('Distance cannot be negative'),
  
  body('metrics.sets')
    .optional()
    .isNumeric()
    .withMessage('Sets must be a number')
    .isInt({ min: 0 })
    .withMessage('Sets cannot be negative'),
  
  body('metrics.reps')
    .optional()
    .isNumeric()
    .withMessage('Reps must be a number')
    .isInt({ min: 0 })
    .withMessage('Reps cannot be negative'),
  
  body('metrics.weight')
    .optional()
    .isNumeric()
    .withMessage('Weight must be a number')
    .isFloat({ min: 0 })
    .withMessage('Weight cannot be negative'),
  
  body('metrics.calories')
    .optional()
    .isNumeric()
    .withMessage('Calories must be a number')
    .isInt({ min: 0 })
    .withMessage('Calories cannot be negative'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value')
];

/**
 * Validation rules for updating a workout
 */
const updateWorkoutValidation = [
  param('id')
    .notEmpty()
    .withMessage('Workout ID is required'),

  ...createWorkoutValidation.map(validation => {
    // Make all fields optional for updates
    if (validation.builder && validation.builder.fields.includes('workoutType')) {
      return body('workoutType')
        .optional()
        .isIn(['strength', 'cardio', 'flexibility', 'sports', 'crossfit', 'other'])
        .withMessage('Invalid workout type');
    }
    if (validation.builder && validation.builder.fields.includes('duration')) {
      return body('duration')
        .optional()
        .isNumeric()
        .withMessage('Duration must be a number')
        .isInt({ min: 1 })
        .withMessage('Duration must be at least 1 minute');
    }
    if (validation.builder && validation.builder.fields.includes('intensityLevel')) {
      return body('intensityLevel')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Invalid intensity level');
    }
    return validation;
  })
];

/**
 * Validation rules for getting workouts
 */
const getWorkoutsValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  
  query('type')
    .optional()
    .isIn(['strength', 'cardio', 'flexibility', 'sports', 'crossfit', 'other'])
    .withMessage('Invalid workout type')
];

/**
 * Validation rules for adding a journey milestone
 */
const journeyMilestoneValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value')
];

/**
 * Validation rules for updating measurements
 */
const measurementsValidation = [
  body()
    .custom(body => {
      if (!body.height && !body.weight && !body.bodyFat) {
        throw new Error('At least one measurement must be provided');
      }
      return true;
    }),
  
  body('height')
    .optional()
    .isNumeric()
    .withMessage('Height must be a number')
    .isFloat({ min: 0 })
    .withMessage('Height cannot be negative'),
  
  body('weight')
    .optional()
    .isNumeric()
    .withMessage('Weight must be a number')
    .isFloat({ min: 0 })
    .withMessage('Weight cannot be negative'),
  
  body('bodyFat')
    .optional()
    .isNumeric()
    .withMessage('Body fat must be a number')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Body fat must be between 0 and 100')
];

module.exports = {
  profileValidation,
  createWorkoutValidation,
  updateWorkoutValidation,
  getWorkoutsValidation,
  journeyMilestoneValidation,
  measurementsValidation
}; 