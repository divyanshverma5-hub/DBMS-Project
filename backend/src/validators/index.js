const { body, param, query } = require('express-validator');

// Auth validation
const registerRules = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain alphanumeric characters and underscores'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email address is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 40 })
    .withMessage('First name must not exceed 40 characters'),
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 40 })
    .withMessage('Last name must not exceed 40 characters'),
  body('account_type')
    .optional()
    .isIn(['free', 'premium'])
    .withMessage('Account type must be either free or premium'),
  body('plan_type')
    // Free is the default account type, so it must never require a subscription plan.
    // Only premium registrations must provide one of the supported plan types.
    .custom((value, { req }) => {
      const accountType = String(req.body.account_type || 'free').trim().toLowerCase();
      return accountType !== 'premium' || ['basic', 'standard', 'family'].includes(value);
    })
    .withMessage('Plan type must be basic, standard, or family for premium accounts'),
];

const loginRules = [
  body('login')
    .trim()
    .notEmpty()
    .withMessage('Username or email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const updateProfileRules = [
  body('first_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ max: 40 }),
  body('last_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ max: 40 }),
  body('country')
    .optional()
    .trim()
    .isLength({ max: 40 }),
  body('profile_image_url')
    .optional({ nullable: true })
    .trim()
    .isURL()
    .withMessage('Profile image must be a valid URL'),
  body('birth_date')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Birth date must be a valid date (YYYY-MM-DD)'),
];

const changePasswordRules = [
  body('old_password')
    .notEmpty()
    .withMessage('Current password is required'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

// Playlist validation
const createPlaylistRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Playlist name is required')
    .isLength({ max: 100 })
    .withMessage('Playlist name must not exceed 100 characters'),
  body('mood_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Mood ID must be a positive integer'),
];

const addTrackToPlaylistRules = [
  param('playlist_no')
    .isInt({ min: 1 })
    .withMessage('Playlist number must be a positive integer'),
  body('track_id')
    .isInt({ min: 1 })
    .withMessage('Track ID must be a positive integer'),
];

// Rating validation
const rateTrackRules = [
  body('track_id')
    .isInt({ min: 1 })
    .withMessage('Track ID must be a positive integer'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
];

// Mood Log validation
const logMoodRules = [
  body('mood_id')
    .isInt({ min: 1 })
    .withMessage('Mood ID must be a positive integer'),
  body('intensity')
    .isInt({ min: 1, max: 5 })
    .withMessage('Intensity must be an integer between 1 and 5'),
];

// Listening History validation
const recordListenRules = [
  body('track_id')
    .isInt({ min: 1 })
    .withMessage('Track ID must be a positive integer'),
  body('duration_listened_sec')
    .isInt({ min: 0 })
    .withMessage('Duration listened must be a non-negative integer in seconds'),
];

module.exports = {
  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules,
  createPlaylistRules,
  addTrackToPlaylistRules,
  rateTrackRules,
  logMoodRules,
  recordListenRules,
};
