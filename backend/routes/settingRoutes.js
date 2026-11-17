import express from 'express'
import { getSettings, updateSettings } from '../controllers/settingController.js'
import { protectAdmin } from '../middleware/authMiddleware.js'
import { uploadCmsImages } from '../middleware/uploadMiddleware.js'
import { uploadCmsImage } from '../controllers/homeCmsController.js'

const router = express.Router()

router.get('/', getSettings)
router.put('/', updateSettings)
router.post('/upload-logo', protectAdmin, uploadCmsImages.single('image'), uploadCmsImage)

export default router

