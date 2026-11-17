import express from 'express'
import { submitContactInquiry, getAllInquiries } from '../controllers/contactController.js'

const router = express.Router()

// Public endpoint for customers to submit contact message
router.post('/', submitContactInquiry)

// Admin endpoint to view contact messages
router.get('/admin/all', getAllInquiries)

export default router

