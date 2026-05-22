import apiClient from './apiClient'

export const leadsApi = {
  getAll: (params) =>
    apiClient.get('/api/v1/leads', { params }).then((r) => r.data),

  getById: (id) =>
    apiClient.get(`/api/v1/leads/${id}`).then((r) => r.data),

  create: (data) =>
    apiClient.post('/api/v1/leads', data).then((r) => r.data),

  update: (id, data) =>
    apiClient.put(`/api/v1/leads/${id}`, data).then((r) => r.data),

  updateStatus: (id, status) =>
    apiClient.patch(`/api/v1/leads/${id}/status`, { status }).then((r) => r.data),

  getComments: (id) =>
    apiClient.get(`/api/v1/leads/${id}/comments`).then((r) => r.data),

  addComment: (id, text) =>
    apiClient.post(`/api/v1/leads/${id}/comments`, { text }).then((r) => r.data),

  convert: (id, data) =>
    apiClient.post(`/api/v1/leads/${id}/convert`, data).then((r) => r.data),
}
