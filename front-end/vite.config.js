import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load single .env from project root
  const env = loadEnv(mode, process.cwd(), '')
  const rawBase = env.BASE_URL
  // Normalize base URL to have leading and trailing slashes (e.g. '/vasraa/')
  const baseUrl = rawBase.startsWith('/')
    ? (rawBase.endsWith('/') ? rawBase : `${rawBase}/`)
    : `/${rawBase}/`

  return {
    base: baseUrl,
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      port: 5173,
      host: true,
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
  }
})
