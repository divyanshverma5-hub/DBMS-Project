const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const { rateTrackRules } = require('../validators');

router.post('/', authenticateToken, rateTrackRules, validateRequest, ratingController.rateTrack);
router.delete('/tracks/:trackId', authenticateToken, ratingController.deleteRating);
router.get('/my-ratings', authenticateToken, ratingController.getUserRatings);
router.get('/tracks/:trackId', ratingController.getTrackRatings);

module.exports = router;
