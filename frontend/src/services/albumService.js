import api from './api'

export const albumService = {
  async getAlbums(params = {}) {
    return api.get('/albums', params)
  },

  async getAlbumById(id) {
    return api.get(`/albums/${id}`)
  },
}

export default albumService
