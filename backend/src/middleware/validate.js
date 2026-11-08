const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return sendError(res, 'Validation failed. Please correct the input fields.', 400, formattedErrors);
  }
  next();
}

module.exports = { validateRequest };
