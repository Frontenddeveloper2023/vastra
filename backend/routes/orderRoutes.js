import express from 'express'
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAdminOrders,
  updateOrderStatus,
  markOrdersAsRead,
  cancelCustomerOrder,
  requestCustomerReturn,
  handleReturnAction,
  downloadInvoicePdf,
} from '../controllers/orderController.js'
import { verifyCustomerToken, verifyAdminToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Customer Routes
router.post('/', verifyCustomerToken, createOrder)
router.get('/my-orders', verifyCustomerToken, getMyOrders)
router.post('/:orderId/cancel', verifyCustomerToken, cancelCustomerOrder)
router.post('/:orderId/return', verifyCustomerToken, requestCustomerReturn)
router.get('/:orderId/invoice-pdf', downloadInvoicePdf)
router.get('/:orderId', verifyCustomerToken, getOrderById)

// Admin Routes
router.get('/admin/all', verifyAdminToken, getAdminOrders)
router.patch('/admin/:id/status', verifyAdminToken, updateOrderStatus)
router.patch('/admin/:id/return-action', verifyAdminToken, handleReturnAction)
router.patch('/admin/mark-read', verifyAdminToken, markOrdersAsRead)

export default router

