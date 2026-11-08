import api from './api'

export const userService = {
  async getUserProfile(userId) {
    return api.get(`/users/${userId}`)
  },

  async followUser(userId) {
    return api.post(`/users/${userId}/follow`)
  },

  async unfollowUser(userId) {
    return api.delete(`/users/${userId}/unfollow`)
  },

  async getFollowers(userId) {
    return api.get(`/users/${userId}/followers`)
  },

  async getFollowing(userId) {
    return api.get(`/users/${userId}/following`)
  },
}

export default userService
