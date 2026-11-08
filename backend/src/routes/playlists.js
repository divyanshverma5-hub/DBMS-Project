const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const { createPlaylistRules, addTrackToPlaylistRules } = require('../validators');

// Playlist CRUD
router.post('/', authenticateToken, createPlaylistRules, validateRequest, playlistController.createPlaylist);
router.get('/', authenticateToken, playlistController.getUserPlaylists);
router.get('/:playlistNo', authenticateToken, playlistController.getPlaylistById);
router.put('/:playlistNo', authenticateToken, playlistController.updatePlaylist);
router.delete('/:playlistNo', authenticateToken, playlistController.deletePlaylist);

// Playlist tracks
router.post('/:playlistNo/tracks', authenticateToken, addTrackToPlaylistRules, validateRequest, playlistController.addTrackToPlaylist);
router.delete('/:playlistNo/tracks/:trackId', authenticateToken, playlistController.removeTrackFromPlaylist);

module.exports = router;
