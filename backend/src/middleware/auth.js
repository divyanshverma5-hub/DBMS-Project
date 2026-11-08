'use strict';

const jwt = require('jsonwebtoken');
const { getJwtSecret, sendError } = require('../utils/response');

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const parts = typeof authHeader === 'string' ? authHeader.split(' ') : [];
  const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;

  if (!token) return sendError(res, 'Authentication token required. Please log in.', 401);

  let secret;
  try {
    secret = getJwtSecret();
  } catch (err) {
    return next(err);
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 'Token has expired. Please log in again.', 401);
      }
      return sendError(res, 'Invalid or malformed authentication token.', 401);
    }
    req.user = decoded;
    next();
  });
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const parts = typeof authHeader === 'string' ? authHeader.split(' ') : [];
  const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : null;
  if (!token) {
    req.user = null;
    return next();
  }

  let secret;
  try {
    secret = getJwtSecret();
  } catch (err) {
    return next(err);
  }

  jwt.verify(token, secret, (err, decoded) => {
    req.user = err ? null : decoded;
    next();
  });
}

module.exports = { authenticateToken, optionalAuth };
