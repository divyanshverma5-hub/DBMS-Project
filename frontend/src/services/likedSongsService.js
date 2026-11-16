import api from './api'

const likedSongsService = {
  async getLikedSongs(params = {}) { return api.get('/liked-songs', params) },
  async getLikedMoods() { return api.get('/liked-songs/moods') },
  async getLikeStatus(trackId) { return api.get(`/liked-songs/status/${trackId}`) },
  async likeSong(trackId) { return api.post('/liked-songs', { track_id: trackId }) },
  async unlikeSong(trackId) { return api.delete(`/liked-songs/${trackId}`) },
}

export default likedSongsService
