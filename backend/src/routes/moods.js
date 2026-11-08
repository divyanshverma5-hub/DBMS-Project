const express = require('express');
const router = express.Router();
const genreMoodController = require('../controllers/genreMoodController');

router.get('/', genreMoodController.getMoods);
router.get('/hierarchy', genreMoodController.getMoodHierarchy);
router.get('/:id/tracks', genreMoodController.getTracksByMood);

module.exports = router;
