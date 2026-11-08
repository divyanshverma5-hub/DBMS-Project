import api from './api'

export const genreMoodService = {
  async getGenres() {
    return api.get('/genres')
  },

  async getTracksByGenre(genreId) {
    return api.get(`/genres/${genreId}/tracks`)
  },

  async getMoods() {
    return api.get('/moods')
  },

  async getMoodHierarchy() {
    return api.get('/moods/hierarchy')
  },

  async getTracksByMood(moodId) {
    return api.get(`/moods/${moodId}/tracks`)
  },
}

export default genreMoodService
