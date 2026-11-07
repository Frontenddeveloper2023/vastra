import express from 'express'
import {
  getAttributes,
  addAttributeItem,
  removeAttributeItem,
} from '../controllers/attributeController.js'
import { protectAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// GET /api/attributes -> Returns the single master { _id, materials, designs, colors }
router.get('/', getAttributes)

// POST /api/attributes/:section (section: 'materials' | 'designs' | 'colors')
router.post('/:section', protectAdmin, addAttributeItem)

// DELETE /api/attributes/:section?name=xyz
router.delete('/:section', protectAdmin, removeAttributeItem)

export default router
