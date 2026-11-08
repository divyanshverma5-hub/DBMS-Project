const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Public profile view
router.get('/:id', optionalAuth, userController.getUserProfile);

// Social following
router.post('/:id/follow', authenticateToken, userController.followUser);
router.delete('/:id/unfollow', authenticateToken, userController.unfollowUser);
router.get('/:id/followers', userController.getFollowers);
router.get('/:id/following', userController.getFollowing);

module.exports = router;
