const express = require('express');
const router = express.Router();
const artistController = require('../controllers/artistController');

router.get('/', artistController.getArtists);
router.get('/:id', artistController.getArtistById);
router.get('/:id/tracks', artistController.getArtistTracks);

module.exports = router;
