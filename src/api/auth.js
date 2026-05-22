import apiClient from './apiClient'

export const authApi = {
  login: (data) =>
    apiClient.post('/api/v1/auth/login', data).then((r) => r.data),

  register: (data) =>
    apiClient.post('/api/v1/auth/register', data).then((r) => r.data),
}
