const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const { recordListenRules, updateListenRules, logMoodRules } = require('../validators');

// Listening history
router.post('/listen', authenticateToken, recordListenRules, validateRequest, activityController.recordListeningEvent);
router.put('/listen/:listenId', authenticateToken, updateListenRules, validateRequest, activityController.updateListeningEvent);
router.get('/history', authenticateToken, activityController.getUserListeningHistory);
router.get('/tracks/:id/summary', activityController.getTrackHistorySummary);

// Mood logs
router.post('/mood-log', authenticateToken, logMoodRules, validateRequest, activityController.logUserMood);
router.get('/mood-log/history', authenticateToken, activityController.getUserMoodHistory);

module.exports = router;
