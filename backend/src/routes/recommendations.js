const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, recommendationController.getUserRecommendations);
router.post('/', authenticateToken, recommendationController.storeRecommendation);

module.exports = router;
