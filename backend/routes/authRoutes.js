import express from 'express'
import {
  requestEmailOtp,
  verifyEmailOtp,
  loginWithGoogle,
  getAdminProfile,
  adminLogout,
} from '../controllers/authController.js'
import { verifyAdminToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public Auth Endpoints
router.post('/request-otp', requestEmailOtp)
router.post('/verify-otp', verifyEmailOtp)
router.post('/google', loginWithGoogle)

// Protected Admin Endpoints
router.get('/me', verifyAdminToken, getAdminProfile)
router.post('/logout', verifyAdminToken, adminLogout)

export default router
