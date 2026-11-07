// Helper to resolve images (relative server uploads, direct filenames, or external URLs)
export const getCmsImageUrl = (img, fallback = '') => {
  if (!img || typeof img !== 'string') return fallback
  const trimmed = img.trim()
  if (!trimmed) return fallback

  // Already a full URL or data/blob URI
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed
  }

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const host = apiBase.replace(/\/api\/?$/, '')
  const cleanPath = trimmed.replace(/^\/+/, '')

  // If path already starts with uploads/ or vastra-product-img/, use it directly
  if (cleanPath.startsWith('uploads/') || cleanPath.startsWith('vastra-product-img/')) {
    return `${host}/${cleanPath}`
  }

  // If it's just a raw filename (e.g. "418M5nb5B-L._SX522_.jpg" or "products/..."), prefix with uploads/products/
  if (cleanPath.startsWith('products/')) {
    return `${host}/uploads/${cleanPath}`
  }

  return `${host}/uploads/products/${cleanPath}`
}

