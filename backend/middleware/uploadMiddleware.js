import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 1. Product Images Upload Directory
const uploadDir = path.join(__dirname, '../public/uploads/products')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.webp'
    const variantIndex = req.body.variantIndex || '0'
    const imgIndex = req.body.imgIndex || '0'
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e7)}`
    cb(null, `variant-${variantIndex}-img-${imgIndex}-${uniqueSuffix}${ext}`)
  },
})

// 2. CMS Images Upload Directory
const cmsUploadDir = path.join(__dirname, '../public/uploads/cms')
if (!fs.existsSync(cmsUploadDir)) {
  fs.mkdirSync(cmsUploadDir, { recursive: true })
}

const cmsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, cmsUploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.webp'
    const section = req.body.section || 'cms'
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e7)}`
    cb(null, `${section}-${uniqueSuffix}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|avif/
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '')
  const mimeType = allowedTypes.test(file.mimetype)
  const extMatch = allowedTypes.test(ext)

  if (mimeType && extMatch) {
    return cb(null, true)
  }
  cb(new Error('Only image files (JPEG, JPG, PNG, WEBP, AVIF) are allowed!'))
}

export const uploadProductImages = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter,
})

export const uploadCmsImages = multer({
  storage: cmsStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter,
})
