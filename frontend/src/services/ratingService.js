import api from './api'

export const ratingService = {
  async rateTrack(trackId, rating) {
    return api.post('/ratings', { track_id: trackId, rating })
  },

  async deleteRating(trackId) {
    return api.delete(`/ratings/tracks/${trackId}`)
  },

  async getUserRatings() {
    return api.get('/ratings/my-ratings')
  },

  async getTrackRatings(trackId) {
    return api.get(`/ratings/tracks/${trackId}`)
  },
}

export default ratingService
