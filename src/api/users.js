import apiClient from './apiClient'

export const usersApi = {
  getAll: (params) =>
    apiClient.get('/api/v1/users', { params }).then((r) => r.data),

  getById: (id) =>
    apiClient.get(`/api/v1/users/${id}`).then((r) => r.data),

  toggleEnabled: (id, enabled) =>
    apiClient.patch(`/api/v1/users/${id}/enabled`, { enabled }).then((r) => r.data),
}
