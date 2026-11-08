import api from './api'

export const trackService = {
  async getTracks(params = {}) {
    return api.get('/tracks', params)
  },

  async getTrackById(id) {
    return api.get(`/tracks/${id}`)
  },

  async recordListen(trackId, durationListenedSec) {
    return api.post('/listening-history/listen', {
      track_id: trackId,
      duration_listened_sec: durationListenedSec,
    })
  },

  async getListeningHistory(params = {}) {
    return api.get('/listening-history/history', params)
  },

  async getTrackSummary(trackId) {
    return api.get(`/listening-history/tracks/${trackId}/summary`)
  },

  async logMood(moodId, intensity) {
    return api.post('/listening-history/mood-log', {
      mood_id: moodId,
      intensity,
    })
  },

  async getMoodLogHistory() {
    return api.get('/listening-history/mood-log/history')
  },
}

export default trackService
