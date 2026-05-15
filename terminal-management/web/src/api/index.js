import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
})

request.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const dashboardApi = {
  getStats: () => request.get('/dashboard/stats'),
  getResourceTrend: (params) => request.get('/dashboard/resource-trend', { params }),
  getRecentAlerts: (params) => request.get('/dashboard/recent-alerts', { params }),
}

export const deviceApi = {
  getList: (params) => request.get('/devices', { params }),
  getDetail: (id) => request.get(`/devices/${id}`),
  getHardware: (id) => request.get(`/devices/${id}/hardware`),
  getMonitor: (id, params) => request.get(`/devices/${id}/monitor`, { params }),
}

export const alertApi = {
  getRules: (params) => request.get('/alert/rules', { params }),
  createRule: (data) => request.post('/alert/rules', data),
  updateRule: (id, data) => request.put(`/alert/rules/${id}`, data),
  deleteRule: (id) => request.delete(`/alert/rules/${id}`),
  toggleRule: (id, enabled) => request.put(`/alert/rules/${id}/toggle`, { enabled }),
  getRecords: (params) => request.get('/alert/records', { params }),
  acknowledgeRecord: (id) => request.put(`/alert/records/${id}/acknowledge`),
  resolveRecord: (id) => request.put(`/alert/records/${id}/resolve`),
}

export const monitorApi = {
  getHistory: (deviceId, params) => request.get(`/monitor/${deviceId}/history`, { params }),
  getRealtime: (deviceId) => request.get(`/monitor/${deviceId}/realtime`),
}

export default request
