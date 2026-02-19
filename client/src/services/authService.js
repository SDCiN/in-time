import api from './api'

export const authService = {
  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },

  async logout() {
    const { data } = await api.post('/auth/logout')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    return data
  },

  async refreshToken(refreshToken) {
    const { data } = await api.post('/auth/refresh', { refreshToken })
    return data
  },

  async forgotPassword(email) {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  },

  async resetPassword(token, newPassword) {
    const { data } = await api.post('/auth/reset-password', { token, newPassword })
    return data
  },
}
