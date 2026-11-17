import axios from 'axios'
import { API_BASE_URL } from '../config/apiConfig'

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

export const productService = {
  // Fetch products with optional query params (category, search, page, limit, sort)
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params })
    return response.data?.data || response.data
  },

  // Fetch single product by ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data?.data?.product || response.data?.product
  },

  // Create new product
  create: async (productData) => {
    const response = await api.post('/products', productData)
    return response.data?.data?.product || response.data?.product
  },

  // Update product
  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData)
    return response.data?.data?.product || response.data?.product
  },

  // Delete product
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },

  // Upload image file for variant, returning relative format: "uploads/products/variant-0-img-0-..."
  uploadVariantImage: async (file, variantIndex = 0, imgIndex = 0) => {
    const formData = new FormData()
    formData.append('images', file)
    formData.append('variantIndex', variantIndex)
    formData.append('imgIndex', imgIndex)

    const response = await api.post('/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data?.data?.image || response.data?.image
  },

  // Stock alerts
  getStockAlerts: async () => {
    const response = await api.get('/products/stock-alerts')
    return response.data?.data || response.data
  },

  // Restock product variant
  restockVariant: async (productId, { variantIndex = 0, addQuantity, newStock }) => {
    const response = await api.patch(`/products/${productId}/restock`, {
      variantIndex,
      addQuantity,
      newStock,
    })
    return response.data?.data || response.data
  },
}

export default productService

