// Centralized helper to get backend base URL and API URL from the single VITE_BACKEND_URL variable

const rawBackend = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').trim().replace(/\/+$/, '')

// Base server URL (for images, sockets, static files) -> e.g. "http://localhost:5000" or "https://webscape.co.in/vastraa-backend"
export const BACKEND_URL = rawBackend

// API base URL (for REST calls) -> e.g. "http://localhost:5000/api" or "https://webscape.co.in/vastraa-backend/api"
export const API_BASE_URL = rawBackend.endsWith('/api') ? rawBackend : `${rawBackend}/api`

export default API_BASE_URL
