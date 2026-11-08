'use strict';

const jwt = require('jsonwebtoken');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (typeof secret !== 'string' || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 bytes of random data.');
  }
  return secret;
}

function generateToken(user) {
  return jwt.sign({
    user_id: user.user_id,
    username: user.username,
    email: user.email,
  }, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

function sendSuccess(res, data = {}, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

function sendError(res, message = 'An error occurred', statusCode = 500, errors = null) {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
}

module.exports = { generateToken, sendSuccess, sendError, getJwtSecret };
