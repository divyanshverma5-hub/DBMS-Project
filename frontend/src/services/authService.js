import api from './api'

export const authService = {
  async register(userData) {
    return api.post('/auth/register', userData)
  },

  async login(credentials) {
    return api.post('/auth/login', credentials)
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignored: client side token wipe is standard for stateless JWT
    }
    localStorage.removeItem('token')
  },

  async getMe() {
    return api.get('/auth/me')
  },

  async updateProfile(profileData) {
    return api.put('/auth/profile', profileData)
  },

  async changePassword(passwordData) {
    return api.put('/auth/change-password', passwordData)
  },
}

export default authService
