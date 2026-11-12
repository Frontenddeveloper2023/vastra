import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

import http from 'http'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import attributeRoutes from './routes/attributeRoutes.js'
import homeCmsRoutes from './routes/homeCmsRoutes.js'
import settingRoutes from './routes/settingRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import { errorHandler } from './middleware/authMiddleware.js'
import { initSocket } from './services/socketService.js'

// Resolve __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000

// Initialize WebSockets
initSocket(server)

// 1. Connect MongoDB Database
connectDB()

// 2. Ensure public/uploads directory exists
const uploadDir = path.join(__dirname, 'public/uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 3. Security & CORS Configuration
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows serving images to frontend
}))

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:4173',
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// 4. Request Body & Cookie Parsers
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))
app.use(cookieParser())

// 5. Static File Serving (Uploads Folder & Product Images Folder)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))
app.use('/vastra-product-img', express.static(path.join(__dirname, 'public/vastra-product-img')))
// Fallback: If any direct uploads/products URL is requested, also check vastra-product-img
app.use('/uploads/products', express.static(path.join(__dirname, 'public/vastra-product-img')))

// 6. Centralized API Router Structure (Modular Routing)
const apiRouter = express.Router()

// Admin & Storefront Routes Grouping
apiRouter.use('/admin/auth', authRoutes)
apiRouter.use('/products', productRoutes)
apiRouter.use('/attributes', attributeRoutes)
apiRouter.use('/home-cms', homeCmsRoutes)
apiRouter.use('/settings', settingRoutes)
apiRouter.use('/customers', customerRoutes)
apiRouter.use('/orders', orderRoutes)

// API Health / Test Route
apiRouter.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Vastraa Luxury Backend API is running smoothly...',
    timestamp: new Date().toISOString(),
  })
})

// Mount Centralized Router under /api
app.use('/api', apiRouter)

// 7. Route Not Found (404) Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route not found: [${req.method}] ${req.originalUrl}`,
  })
})

// 8. Global Centralized Error Handler Middleware
app.use(errorHandler)

// 9. Start Server
server.listen(PORT, () => {
  console.log(`🚀 [Vastraa Server Active] Running on port: ${PORT}`)
  console.log(`📡 [API Base URL] http://localhost:${PORT}/api`)
  console.log(`📁 [Uploads Directory] http://localhost:${PORT}/uploads`)
  console.log(`⚡ [WebSocket Service Active] Socket.IO server connected`)
})

export default app