import api from './api'

export const recommendationService = {
  async getUserRecommendations(params = {}) {
    return api.get('/recommendations', params)
  },

  async generateRecommendations(moodId, limit = 20) {
    return api.post('/recommendations/generate', {
      mood_id: moodId,
      limit,
    })
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
