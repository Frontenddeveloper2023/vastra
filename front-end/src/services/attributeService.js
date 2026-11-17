import axios from 'axios'
import { API_BASE_URL } from '../config/apiConfig'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

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

export const attributeService = {
  // Returns { _id, materials: [], designs: [], colors: [] }
  getAll: async () => {
    const response = await api.get('/attributes')
    return response.data?.data || response.data
  },

  // Add item: section = 'materials' | 'designs' | 'colors'
  addItem: async (section, data) => {
    const response = await api.post(`/attributes/${section}`, data)
    return response.data?.data || response.data
  },

  // Remove item by name: section = 'materials' | 'designs' | 'colors'
  removeItem: async (section, name) => {
    const response = await api.delete(`/attributes/${section}`, {
      params: { name },
    })
    return response.data?.data || response.data
  },
}

export default attributeService
