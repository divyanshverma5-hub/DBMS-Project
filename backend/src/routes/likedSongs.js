const express = require('express');
const router = express.Router();
const controller = require('../controllers/likedSongsController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);
router.get('/moods', controller.getLikedMoods);
router.get('/status/:trackId', controller.getLikeStatus);
router.get('/', controller.listLikedSongs);
router.post('/', controller.likeSong);
router.delete('/:trackId', controller.unlikeSong);

module.exports = router;
