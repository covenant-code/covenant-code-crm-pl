import apiClient from './apiClient'

export const lessonsApi = {
  getAll: (params) =>
    apiClient.get('/api/v1/lessons', { params }).then((r) => r.data),

  getById: (id) =>
    apiClient.get(`/api/v1/lessons/${id}`).then((r) => r.data),

  create: (data) =>
    apiClient.post('/api/v1/lessons', data).then((r) => r.data),

  update: (id, data) =>
    apiClient.put(`/api/v1/lessons/${id}`, data).then((r) => r.data),

  delete: (id) =>
    apiClient.delete(`/api/v1/lessons/${id}`),

  getByTeacher: (teacherId, params) =>
    apiClient.get(`/api/v1/teachers/${teacherId}/lessons`, { params }).then((r) => r.data),
}
