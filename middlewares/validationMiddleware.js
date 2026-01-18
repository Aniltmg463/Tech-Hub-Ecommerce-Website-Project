import { body, validationResult } from 'express-validator';

/**
 * Validation rules for user registration
 * Ensures data integrity before it reaches the controller
 */
export const registerValidationRules = [
  // Name: Required, min 2 chars, letters and spaces only
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters long')
    // .matches(/^[a-zA-Z\s]+$/).withMessage('Name should only contain letters and spaces'),

    // allow letters, numbers, spaces, and special characters
  .matches(/^[\w\s!@#$%^&*()\-_=+[\]{};:'",.<>?/\\|`~]+$/)
  // .withMessage('Name can contain letters, numbers, spaces, and special characters')
    ,

  // Email: Required, valid email format, normalized
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  // Password: Required, min 6 characters (keeping it simple)
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  // Phone: Required, 7-13 digits only
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[0-9]{7,13}$/).withMessage('Phone number must be 7-13 digits'),

  // Address: Required, min 5 characters
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ min: 5 }).withMessage('Address must be at least 5 characters long'),

  // Security Answer: Required, min 2 characters
  body('answer')
    .trim()
    .notEmpty().withMessage('Security answer is required')
    .isLength({ min: 2 }).withMessage('Answer must be at least 2 characters long'),

  // Role: Optional, must be 0 (user) or 1 (admin) if provided
  body('role')
    .optional()
    .isIn([0, 1, '0', '1']).withMessage('Invalid role value')
];

/**
 * Middleware to check validation results
 * If validation fails, returns 400 with detailed errors
 * If validation passes, calls next()
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }

  next();
};
