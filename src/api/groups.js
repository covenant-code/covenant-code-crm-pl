import apiClient from './apiClient'

export const groupsApi = {
  getAll: (params) =>
    apiClient.get('/api/v1/groups', { params }).then((r) => r.data),

  getById: (id) =>
    apiClient.get(`/api/v1/groups/${id}`).then((r) => r.data),

  create: (data) =>
    apiClient.post('/api/v1/groups', data).then((r) => r.data),

  update: (id, data) =>
    apiClient.put(`/api/v1/groups/${id}`, data).then((r) => r.data),

  updateStatus: (id, status) =>
    apiClient.patch(`/api/v1/groups/${id}/status`, { status }).then((r) => r.data),

  getStudents: (id) =>
    apiClient.get(`/api/v1/groups/${id}/students`).then((r) => r.data),

  addStudent: (id, studentId) =>
    apiClient.post(`/api/v1/groups/${id}/students`, { studentId }).then((r) => r.data),

  removeStudent: (groupId, studentId) =>
    apiClient.delete(`/api/v1/groups/${groupId}/students/${studentId}`),

  getLessons: (id, params) =>
    apiClient.get(`/api/v1/groups/${id}/lessons`, { params }).then((r) => r.data),
}
