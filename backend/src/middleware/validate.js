const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Validates request results from express-validator rule chains.
 * If validation errors exist, halts request and returns 400 Bad Request with field errors.
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    return sendError(res, 'Validation failed. Please correct the input fields.', 400, formattedErrors);
  }
  next();
}

module.exports = {
  validateRequest,
};
