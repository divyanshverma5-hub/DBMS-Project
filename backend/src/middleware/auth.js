const jwt = require('jsonwebtoken');
const { JWT_SECRET, sendError } = require('../utils/response');

/**
 * Authentication Middleware:
 * Extracts Bearer token from Authorization header and verifies it.
 * Populates req.user with decoded payload: { user_id, username, email }
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return sendError(res, 'Authentication token required. Please log in.', 401);
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Token has expired. Please log in again.', 401);
      }
      return sendError(res, 'Invalid or malformed authentication token.', 403);
    }
    // Attach user payload
    req.user = decoded;
    next();
  });
}

/**
 * Optional Authentication Middleware:
 * If a token is provided, decodes and attaches req.user.
 * If no token is provided, proceeds without error.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (!err) {
      req.user = decoded;
    } else {
      req.user = null;
    }
    next();
  });
}

module.exports = {
  authenticateToken,
  optionalAuth,
};
