const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_mode_only_12345';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT for a user payload.
 * @param {Object} user - Object containing at least user_id, username, email
 * @returns {string} Signed JWT
 */
function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Standard API JSON response helper
 */
function sendSuccess(res, data = {}, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function sendError(res, message = 'An error occurred', statusCode = 500, errors = null) {
  const payload = {
    success: false,
    message,
  };
  if (errors) {
    payload.errors = errors;
  }
  return res.status(statusCode).json(payload);
}

module.exports = {
  generateToken,
  sendSuccess,
  sendError,
  JWT_SECRET,
};
