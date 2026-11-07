import express from 'express'
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
  getStockAlerts,
  restockProductVariant,
} from '../controllers/productController.js'
import { protectAdmin } from '../middleware/authMiddleware.js'
import { uploadProductImages } from '../middleware/uploadMiddleware.js'

const router = express.Router()

// Stock alerts endpoint (must come before /:id)
router.get('/stock-alerts', protectAdmin, getStockAlerts)

// Restock product variant
router.patch('/:id/restock', protectAdmin, restockProductVariant)

// Public storefront routes
router.get('/', getProducts)
router.get('/:id', getProductById)

// Protected Admin Inventory management routes
router.post('/', protectAdmin, createProduct)
router.put('/:id', protectAdmin, updateProduct)
router.delete('/:id', protectAdmin, deleteProduct)

// Multi-image upload route
router.post(
  '/upload',
  protectAdmin,
  uploadProductImages.array('images', 5),
  uploadImages
)

export default router

