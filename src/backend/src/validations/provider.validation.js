const { body, param } = require('express-validator');

/**
 * Validation rules for creating/updating provider profile
 */
const profileValidation = [
  body('businessName')
    .optional()
    .isString()
    .withMessage('Business name must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Business name cannot be more than 100 characters'),
  
  body('bio')
    .optional()
    .isString()
    .withMessage('Bio must be a string')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot be more than 1000 characters'),
  
  body('specialties')
    .optional()
    .isArray()
    .withMessage('Specialties must be an array of strings'),
  
  body('specialties.*')
    .optional()
    .isString()
    .withMessage('Each specialty must be a string')
    .trim(),
  
  body('experience')
    .optional()
    .isNumeric()
    .withMessage('Experience must be a number')
    .isInt({ min: 0 })
    .withMessage('Experience cannot be negative'),
  
  body('languages')
    .optional()
    .isArray()
    .withMessage('Languages must be an array of strings'),
  
  body('languages.*')
    .optional()
    .isString()
    .withMessage('Each language must be a string')
    .trim(),
  
  body('responseTime')
    .optional()
    .isIn(['immediate', 'within-hour', 'same-day', 'within-24-hours', 'within-48-hours'])
    .withMessage('Invalid response time value'),
  
  body('providerType')
    .optional()
    .isIn(['trainer', 'coach', 'gym', 'club', 'event_organizer'])
    .withMessage('Invalid provider type'),
  
  body('businessHours')
    .optional()
    .isObject()
    .withMessage('Business hours must be an object')
];

/**
 * Validation rules for adding a credential
 */
const credentialValidation = [
  body('title')
    .notEmpty()
    .withMessage('Credential title is required')
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  
  body('organization')
    .notEmpty()
    .withMessage('Organization is required')
    .isString()
    .withMessage('Organization must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Organization cannot be more than 100 characters'),
  
  body('year')
    .notEmpty()
    .withMessage('Year is required')
    .isNumeric()
    .withMessage('Year must be a number')
    .isInt({ min: 1950, max: new Date().getFullYear() })
    .withMessage(`Year must be between 1950 and ${new Date().getFullYear()}`),
  
  body('verificationUrl')
    .optional()
    .isURL()
    .withMessage('Verification URL must be a valid URL')
];

/**
 * Validation rules for adding a service
 */
const serviceValidation = [
  body('title')
    .notEmpty()
    .withMessage('Service title is required')
    .isString()
    .withMessage('Title must be a string')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isString()
    .withMessage('Description must be a string')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  
  body('type')
    .notEmpty()
    .withMessage('Service type is required')
    .isIn(['one-on-one', 'group', 'online', 'consultation', 'assessment', 'other'])
    .withMessage('Invalid service type'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

/**
 * Validation rules for adding a gallery item
 */
const galleryValidation = [
  body('type')
    .notEmpty()
    .withMessage('Media type is required')
    .isIn(['image', 'video'])
    .withMessage('Type must be either image or video'),
  
  body('url')
    .notEmpty()
    .withMessage('URL is required')
    .isURL()
    .withMessage('URL must be a valid URL'),
  
  body('caption')
    .optional()
    .isString()
    .withMessage('Caption must be a string')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Caption cannot be more than 200 characters'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value')
];

/**
 * Validation rules for adding a verification document
 */
const documentValidation = [
  body('type')
    .notEmpty()
    .withMessage('Document type is required')
    .isIn(['license', 'certification', 'insurance', 'identification', 'other'])
    .withMessage('Invalid document type'),
  
  body('url')
    .notEmpty()
    .withMessage('URL is required')
    .isURL()
    .withMessage('URL must be a valid URL')
];

/**
 * Validation rules for updating business hours
 */
const businessHoursValidation = [
  body()
    .isObject()
    .withMessage('Business hours must be an object'),
  
  body('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
    .optional()
    .isObject()
    .withMessage('Each day must be an object'),
  
  body('monday.open', 'tuesday.open', 'wednesday.open', 'thursday.open', 'friday.open', 'saturday.open', 'sunday.open')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Opening time must be in HH:MM format (24-hour)'),
  
  body('monday.close', 'tuesday.close', 'wednesday.close', 'thursday.close', 'friday.close', 'saturday.close', 'sunday.close')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Closing time must be in HH:MM format (24-hour)')
];

module.exports = {
  profileValidation,
  credentialValidation,
  serviceValidation,
  galleryValidation,
  documentValidation,
  businessHoursValidation
}; 