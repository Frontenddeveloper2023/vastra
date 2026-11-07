import nodemailer from 'nodemailer'
import {
  getCustomerLoginOtpEmailTemplate,
  getCustomerSignupOtpEmailTemplate,
  getAdminOtpEmailTemplate,
  getOrderInvoiceEmailTemplate,
  getOrderCancellationEmailTemplate,
} from '../templates/emailTemplates.js'

/**
 * Configure and cache the nodemailer SMTP transporter
 */
const getTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null
  }

  const isSecure =
    process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'webscape.co.in',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  })
}

/**
 * Generic Reusable Mail Dispatcher
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter()

  if (!transporter) {
    console.log(`\n======================================================`)
    console.log(`[VASTRAA EMAIL SIMULATOR (No SMTP Credentials)]`)
    console.log(`Recipient: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`======================================================\n`)
    return true
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || `"Vastraa" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log(`[SMTP Sent] Email delivered to ${to} (ID: ${info.messageId})`)
    return true
  } catch (err) {
    console.error(`[SMTP Error] Delivery failed to ${to}:`, err.message)
    return false
  }
}

/**
 * 1. Dispatch Admin Portal Security OTP Email
 */
export const sendAdminOtpEmail = async (email, otp) => {
  const html = getAdminOtpEmailTemplate(otp)
  const success = await sendEmail({
    to: email,
    subject: `🔐 Security Passcode: ${otp} for Vastraa Admin Portal`,
    html,
    text: `Your Vastraa Admin Portal verification passcode is: ${otp}. It expires in 5 minutes. Do not share this code.`,
  })

  if (!success) {
    console.log(`[Fallback Console Admin OTP]: >>> ${otp} <<< for ${email}`)
  }
  return true
}

// Backwards-compatibility alias for existing references
export const sendOtpEmail = sendAdminOtpEmail

/**
 * 2. Dispatch Customer Sign-In (Login) OTP Email
 */
export const sendCustomerLoginOtpEmail = async (email, otp) => {
  const html = getCustomerLoginOtpEmailTemplate(otp)
  const success = await sendEmail({
    to: email,
    subject: ` ${otp} is your Vastraa account sign-in code`,
    html,
    text: `Welcome back to Vastraa! Your sign-in code is: ${otp}. Valid for 5 minutes.`,
  })

  if (!success) {
    console.log(`[Fallback Console Customer Login OTP]: >>> ${otp} <<< for ${email}`)
  }
  return true
}

/**
 * 3. Dispatch Customer Registration (Signup) OTP Email
 */
export const sendCustomerSignupOtpEmail = async (email, otp) => {
  const html = getCustomerSignupOtpEmailTemplate(otp)
  const success = await sendEmail({
    to: email,
    subject: ` Welcome to Vastraa - Confirm your account with ${otp}`,
    html,
    text: `Welcome to the Vastraa family! Confirm your registration with passcode: ${otp}. Valid for 5 minutes.`,
  })

  if (!success) {
    console.log(`[Fallback Console Customer Signup OTP]: >>> ${otp} <<< for ${email}`)
  }
  return true
}

/**
 * 4. Dispatch Customer Order Invoice & Confirmation Email
 */
export const sendOrderInvoiceEmail = async (email, orderDetails) => {
  const html = getOrderInvoiceEmailTemplate(orderDetails)
  return await sendEmail({
    to: email,
    subject: `🛍️ Order Confirmed #${orderDetails.orderId} - Thank you for choosing Vastraa`,
    html,
    text: `Thank you for your order #${orderDetails.orderId} at Vastraa Silks. Total Amount: ₹${orderDetails.totalAmount}`,
  })
}

/**
 * 5. Dispatch Customer Order Cancellation Notice with Professional Store Reason
 */
export const sendOrderCancellationEmail = async (email, details) => {
  const html = getOrderCancellationEmailTemplate(details)
  return await sendEmail({
    to: email,
    subject: `Notice regarding your Vastraa Order #${details.orderId} [Cancellation & Refund]`,
    html,
    text: `Important update regarding your Vastraa order #${details.orderId}. Your order was cancelled by our store. Reason: ${details.reason}`,
  })
}
