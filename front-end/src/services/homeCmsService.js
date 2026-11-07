import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach token from localStorage if available
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

export const homeCmsService = {
  // Fetch current Home CMS configuration
  get: async () => {
    const response = await api.get('/home-cms')
    return response.data?.data?.cms || response.data?.cms
  },

  // Update whole Home CMS or individual section
  update: async (cmsData) => {
    const response = await api.put('/home-cms', cmsData)
    return response.data?.data?.cms || response.data?.cms
  },

  // Upload an image for banners, mood cards, or backgrounds
  uploadImage: async (file, section = 'cms') => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('section', section)

    const response = await api.post('/home-cms/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data?.data?.image || response.data?.image
  },
}

export default homeCmsService

