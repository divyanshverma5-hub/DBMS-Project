const express = require('express');
const router = express.Router();
const genreMoodController = require('../controllers/genreMoodController');

router.get('/', genreMoodController.getGenres);
router.get('/:id/tracks', genreMoodController.getTracksByGenre);

module.exports = router;
