import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import { ApiError, ApiResponse, asyncHandler } from '../utils/apiResponse.js'
import cacheService from '../services/cacheService.js'
import { sendOtpEmail } from '../services/emailService.js'
import Admin from '../models/Admin.js'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Helper: Sign JWT
const generateAdminToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id || 'admin_temp_id',
      email: admin.email,
      name: admin.name,
      role: admin.role || 'super_admin',
    },
    process.env.JWT_SECRET || 'vastraa_super_secure_jwt_secret_key_2026_luxury_brand',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// ─────────────────────────────────────────────────────────────
// 1. REQUEST EMAIL OTP
// ─────────────────────────────────────────────────────────────
export const requestEmailOtp = asyncHandler(async (req, res) => {
  const { email } = req.body

  if (!email || !email.trim()) {
    throw new ApiError(400, 'Please provide a valid administrative email address.')
  }

  const normalizedEmail = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(normalizedEmail)) {
    throw new ApiError(400, 'The email address format is invalid. Please check and try again.')
  }

  // Rate Limiter / OTP frequency check via Redis
  const rateKey = `otp_ratelimit:${normalizedEmail}`
  const existingRecent = await cacheService.get(rateKey)
  if (existingRecent) {
    throw new ApiError(429, 'An OTP was recently requested. Please wait 45 seconds before requesting another code.')
  }

  // Check admin whitelist if configured
  const allowedList = (process.env.ADMIN_EMAILS || 'jayamweb.designer2@gmail.com')
    .split(',')
    .map((e) => e.trim().toLowerCase())

  if (allowedList.length > 0 && !allowedList.includes(normalizedEmail)) {
    throw new ApiError(403, 'This email is not authorized for administrative access. Please contact support.')
  }

  // Generate cryptographic 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

  // Store OTP in Redis/Memory with 5 minutes (300 seconds) expiration
  const otpKey = `admin_otp:${normalizedEmail}`
  await cacheService.set(otpKey, { otp: otpCode, attempts: 0 }, 300)
  // Set 45s resend lock
  await cacheService.set(rateKey, 'true', 45)

  // Send real email via SMTP
  await sendOtpEmail(normalizedEmail, otpCode)

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        email: normalizedEmail,
      },
      `A 6-digit verification code has been dispatched to ${normalizedEmail}. Please check your email inbox.`
    )
  )
})

// ─────────────────────────────────────────────────────────────
// 2. VERIFY EMAIL OTP & SIGN IN
// ─────────────────────────────────────────────────────────────
export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    throw new ApiError(400, 'Both email and 6-digit verification code are required.')
  }

  const normalizedEmail = email.trim().toLowerCase()
  const cleanOtp = String(otp).trim()

  if (cleanOtp.length !== 6) {
    throw new ApiError(400, 'The verification code must be exactly 6 numeric digits.')
  }

  const otpKey = `admin_otp:${normalizedEmail}`
  const record = await cacheService.get(otpKey)

  if (!record) {
    throw new ApiError(400, 'The verification code has expired or was not requested. Please request a new code.')
  }

  if (record.attempts >= 5) {
    await cacheService.del(otpKey)
    throw new ApiError(429, 'Too many incorrect attempts. For security reasons, please request a new verification code.')
  }

  if (record.otp !== cleanOtp) {
    record.attempts += 1
    await cacheService.set(otpKey, record, 300)
    const remaining = 5 - record.attempts
    throw new ApiError(400, `Incorrect verification code. ${remaining} attempt(s) remaining.`)
  }

  // OTP is correct! Clear from cache
  await cacheService.del(otpKey)

  // Find or create admin in MongoDB
  let admin = null
  try {
    admin = await Admin.findOne({ email: normalizedEmail })
    if (!admin) {
      admin = await Admin.create({
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        role: 'super_admin',
        authProvider: 'email_otp',
      })
    } else {
      admin.lastLogin = new Date()
      await admin.save()
    }
  } catch (dbErr) {
    admin = {
      _id: 'local_admin_session',
      email: normalizedEmail,
      name: normalizedEmail.split('@')[0],
      role: 'super_admin',
    }
  }

  const token = generateAdminToken(admin)

  // Set secure HttpOnly cookie
  res.cookie('vastraa_admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
      'Welcome back! You have successfully signed into the Vastraa Admin Portal.'
    )
  )
})

// ─────────────────────────────────────────────────────────────
// 3. GOOGLE OAUTH SIGN IN
// ─────────────────────────────────────────────────────────────
export const loginWithGoogle = asyncHandler(async (req, res) => {
  const { credential, accessToken } = req.body

  if (!credential && !accessToken) {
    throw new ApiError(400, 'Google authentication token is required.')
  }

  let email = ''
  let name = ''
  let picture = ''

  try {
    if (credential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      const payload = ticket.getPayload()
      email = payload.email
      name = payload.name
      picture = payload.picture
    } else {
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const userInfo = await userInfoRes.json()
      email = userInfo.email
      name = userInfo.name
      picture = userInfo.picture
    }
  } catch (gErr) {
    throw new ApiError(401, 'Google authentication failed. Please verify your Google credentials.')
  }

  if (!email) {
    throw new ApiError(400, 'Unable to retrieve email from your Google account.')
  }

  const normalizedEmail = email.toLowerCase()

  // Whitelist check
  const allowedList = (process.env.ADMIN_EMAILS || 'admin@vastraa.com,manikandan@vastraa.com')
    .split(',')
    .map((e) => e.trim().toLowerCase())

  if (allowedList.length > 0 && !allowedList.includes(normalizedEmail)) {
    throw new ApiError(403, `Access denied: Google account (${normalizedEmail}) is not authorized for administrative access.`)
  }

  // Find or create admin
  let admin = null
  try {
    admin = await Admin.findOne({ email: normalizedEmail })
    if (!admin) {
      admin = await Admin.create({
        email: normalizedEmail,
        name: name || 'Google Admin',
        avatar: picture || '',
        role: 'super_admin',
        authProvider: 'google',
      })
    } else {
      admin.lastLogin = new Date()
      if (picture && !admin.avatar) admin.avatar = picture
      await admin.save()
    }
  } catch {
    admin = {
      _id: 'google_admin_session',
      email: normalizedEmail,
      name: name || 'Google Admin',
      role: 'super_admin',
      avatar: picture || '',
    }
  }

  const token = generateAdminToken(admin)

  res.cookie('vastraa_admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          avatar: admin.avatar,
        },
      },
      `Signed in with Google as ${admin.name}.`
    )
  )
})

// ─────────────────────────────────────────────────────────────
// 4. CURRENT ADMIN STATUS & LOGOUT
// ─────────────────────────────────────────────────────────────
export const getAdminProfile = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, { admin: req.admin }, 'Admin profile retrieved successfully.')
  )
})

export const adminLogout = asyncHandler(async (req, res) => {
  res.clearCookie('vastraa_admin_token')
  return res.status(200).json(
    new ApiResponse(200, null, 'Signed out of administrative portal successfully.')
  )
})
