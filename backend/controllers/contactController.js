import ContactInquiry from '../models/ContactInquiry.js'
import Setting from '../models/Setting.js'
import { sendContactInquiryEmail } from '../services/emailService.js'
import { emitEvent } from '../services/socketService.js'

/**
 * @desc Submit customer contact inquiry & email admin
 * @route POST /api/contact
 * @access Public
 */
export const submitContactInquiry = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your full name.' })
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' })
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your message.' })
    }

    // 1. Save to MongoDB
    const inquiry = await ContactInquiry.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      subject: subject ? subject.trim() : 'General Inquiry',
      message: message.trim(),
    })

    // 2. Fetch admin email from settings DB or environment
    const setting = await Setting.findOne()
    const targetAdminEmail =
      setting?.adminEmail ||
      setting?.contactEmail ||
      (process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',')[0].trim() : 'jayamweb.designer2@gmail.com')

    // 3. Dispatch luxury HTML email to admin
    await sendContactInquiryEmail(targetAdminEmail, {
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      subject: inquiry.subject,
      message: inquiry.message,
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    })

    // 4. Emit real-time WebSocket alert to admin navbar
    emitEvent('inquiry:new', {
      inquiry,
      message: `New message from ${inquiry.name}: "${inquiry.subject}"`,
    })

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent successfully to our team.',
      data: inquiry,
    })
  } catch (error) {
    console.error('Failed to submit contact inquiry:', error)
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while sending your message. Please try again.',
      error: error.message,
    })
  }
}

/**
 * @desc Get all customer inquiries
 * @route GET /api/contact/admin/all
 * @access Private (Admin)
 */
export const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await ContactInquiry.find().sort({ createdAt: -1 }).limit(100)
    return res.status(200).json({
      success: true,
      data: inquiries,
    })
  } catch (error) {
    console.error('Failed to get inquiries:', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch inquiries' })
  }
}

