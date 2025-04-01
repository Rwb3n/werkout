const { body } = require('express-validator');

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain at least one letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  
  body('firstName')
    .isString()
    .notEmpty()
    .withMessage('First name is required')
    .trim(),
  
  body('lastName')
    .isString()
    .notEmpty()
    .withMessage('Last name is required')
    .trim(),
  
  body('userType')
    .isIn(['seeker', 'provider'])
    .withMessage('User type must be either seeker or provider')
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for forgot password
 */
const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
];

/**
 * Validation rules for password reset
 */
const resetPasswordValidation = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain at least one letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
}; 