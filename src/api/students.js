import apiClient from './apiClient'

export const studentsApi = {
  getAll: (params) =>
    apiClient.get('/api/v1/students', { params }).then((r) => r.data),

  getById: (id) =>
    apiClient.get(`/api/v1/students/${id}`).then((r) => r.data),

  create: (data) =>
    apiClient.post('/api/v1/students', data).then((r) => r.data),

  update: (id, data) =>
    apiClient.put(`/api/v1/students/${id}`, data).then((r) => r.data),

  delete: (id) =>
    apiClient.delete(`/api/v1/students/${id}`),

  getLessons: (id, params) =>
    apiClient.get(`/api/v1/students/${id}/lessons`, { params }).then((r) => r.data),
}
