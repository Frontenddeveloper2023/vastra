import express from 'express'
import {
  getHomeCMS,
  updateHomeCMS,
  uploadCmsImage,
} from '../controllers/homeCmsController.js'
import { protectAdmin } from '../middleware/authMiddleware.js'
import { uploadCmsImages } from '../middleware/uploadMiddleware.js'

const router = express.Router()

// Public read route (frontend storefront & admin load)
router.get('/', getHomeCMS)

// Admin protected update route
router.put('/', protectAdmin, updateHomeCMS)

// Admin protected image upload route
router.post('/upload', protectAdmin, uploadCmsImages.single('image'), uploadCmsImage)

export default router

