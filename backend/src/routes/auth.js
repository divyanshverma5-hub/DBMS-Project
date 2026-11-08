const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const {
  registerRules,
  loginRules,
  updateProfileRules,
  changePasswordRules,
} = require('../validators');

// Public routes
router.post('/register', registerRules, validateRequest, authController.register);
router.post('/login', loginRules, validateRequest, authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', authenticateToken, authController.getMe);
router.put('/profile', authenticateToken, updateProfileRules, validateRequest, authController.updateProfile);
router.put('/change-password', authenticateToken, changePasswordRules, validateRequest, authController.changePassword);

module.exports = router;
