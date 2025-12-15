import axios from 'axios'

const API_URL = "http://127.0.0.1:8000"

const api = axios.create({
  baseURL: API_URL,
})

// Request interceptor - add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - handle expired tokens
api.interceptors.response.use(
  response => response,
  error => {
    // If token is expired or invalid (401), clear storage and redirect to login
    if (error.response?.status === 401) {
      console.error('Token expired or invalid - logging out')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api