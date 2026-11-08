import api from './api'

export const playlistService = {
  async getUserPlaylists() {
    return api.get('/playlists')
  },

  async getPlaylistById(playlistNo, userId = null) {
    return api.get(`/playlists/${playlistNo}`, userId ? { user_id: userId } : null)
  },

  async createPlaylist(name, moodId = null) {
    return api.post('/playlists', { name, mood_id: moodId })
  },

  async updatePlaylist(playlistNo, { name, mood_id }) {
    return api.put(`/playlists/${playlistNo}`, { name, mood_id })
  },

  async deletePlaylist(playlistNo) {
    return api.delete(`/playlists/${playlistNo}`)
  },

  async addTrackToPlaylist(playlistNo, trackId) {
    return api.post(`/playlists/${playlistNo}/tracks`, { track_id: trackId })
  },

  async removeTrackFromPlaylist(playlistNo, trackId) {
    return api.delete(`/playlists/${playlistNo}/tracks/${trackId}`)
  },
}

export default playlistService
