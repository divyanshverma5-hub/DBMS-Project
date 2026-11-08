import api from './api'

export const recommendationService = {
  async getUserRecommendations(params = {}) {
    return api.get('/recommendations', params)
  },

  async storeRecommendation(trackId, moodId, score) {
    return api.post('/recommendations', {
      track_id: trackId,
      mood_id: moodId,
      score,
    })
  },
}

export default recommendationService
