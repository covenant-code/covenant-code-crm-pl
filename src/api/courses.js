import apiClient from './apiClient'

export const coursesApi = {
  getAll: (params) =>
    apiClient.get('/api/v1/courses', { params }).then((r) => r.data),

  getById: (id) =>
    apiClient.get(`/api/v1/courses/${id}`).then((r) => r.data),

  create: (data) =>
    apiClient.post('/api/v1/courses', data).then((r) => r.data),

  update: (id, data) =>
    apiClient.put(`/api/v1/courses/${id}`, data).then((r) => r.data),

  delete: (id) =>
    apiClient.delete(`/api/v1/courses/${id}`),
}
