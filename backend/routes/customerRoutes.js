import express from 'express'
import {
  googleAuthCustomer,
  requestCustomerOtp,
  verifyCustomerOtp,
  getCustomerProfile,
  updateCustomerProfile,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  getAdminCustomers,
} from '../controllers/customerController.js'
import { protectCustomer, verifyAdminToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// ── Admin Endpoints ──
router.get('/admin/all', verifyAdminToken, getAdminCustomers)
router.get('/', verifyAdminToken, getAdminCustomers)

// ── Authentication Endpoints ──
router.post('/auth/google', googleAuthCustomer)
router.post('/auth/send-otp', requestCustomerOtp)
router.post('/auth/verify-otp', verifyCustomerOtp)

// ── Profile Endpoints (Protected) ──
router.get('/me', protectCustomer, getCustomerProfile)
router.put('/me', protectCustomer, updateCustomerProfile)

// ── Address Endpoints (Protected) ──
router.post('/addresses', protectCustomer, addCustomerAddress)
router.put('/addresses/:addressId', protectCustomer, updateCustomerAddress)
router.delete('/addresses/:addressId', protectCustomer, deleteCustomerAddress)

export default router

