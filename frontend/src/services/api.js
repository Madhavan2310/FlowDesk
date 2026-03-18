import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

// Workflows
export const workflowAPI = {
  // User
  create: (data) => api.post('/workflows/create', data),
  getMyWorkflows: () => api.get('/workflows/my'),
  getById: (id) => api.get(`/workflows/${id}`),

  // Manager
  getAllForManager: () => api.get('/workflows/manager/all'),
  managerAction: (id, data) => api.post(`/workflows/manager/${id}/action`, data),

  // CEO
  getAllForCeo: () => api.get('/workflows/ceo/all'),
  ceoAction: (id, data) => api.post(`/workflows/ceo/${id}/action`, data),
}

export default api

// Notifications (USER only)
export const notificationAPI = {
  getAll:       () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAllRead:  () => api.post('/notifications/mark-all-read'),
  markOneRead:  (id) => api.post(`/notifications/${id}/mark-read`),
}
