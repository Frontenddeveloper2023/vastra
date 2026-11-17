import axios from 'axios'
import { API_BASE_URL } from '../config/apiConfig'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach token from localStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vastraa_admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Human-readable error interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.message === 'Network Error'
        ? 'Unable to connect to the server. Please ensure the backend is running.'
        : error.message || 'An unexpected error occurred.')
    return Promise.reject(new Error(message))
  }
)

