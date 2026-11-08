import api from './api'

export const artistService = {
  async getArtists(params = {}) {
    return api.get('/artists', params)
  },

  async getArtistById(id) {
    return api.get(`/artists/${id}`)
  },

  async getArtistTracks(id) {
    return api.get(`/artists/${id}/tracks`)
  },
}

export default artistService
