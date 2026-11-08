const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { generateRecommendations } = require('../controllers/recommendationGeneratorController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, recommendationController.getUserRecommendations);
router.post('/generate', authenticateToken, generateRecommendations);
router.post('/', authenticateToken, recommendationController.storeRecommendation);

module.exports = router;
