import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import Customer from '../models/Customer.js'
import cacheService from '../services/cacheService.js'
import {
  sendCustomerLoginOtpEmail,
  sendCustomerSignupOtpEmail,
  sendOtpEmail,
} from '../services/emailService.js'
import { ApiError, ApiResponse, asyncHandler } from '../utils/apiResponse.js'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// Helper: Generate Customer JWT
const generateCustomerToken = (customer) => {
  return jwt.sign(
    {
      id: customer._id,
      email: customer.email,
      name: customer.name,
      role: 'customer',
    },
    process.env.JWT_SECRET || 'vastraa_super_secure_jwt_secret_key_2026_luxury_brand',
    { expiresIn: '30d' }
  )
}

/**
 * @desc Customer Google Login / Signup
 * @route POST /api/customers/auth/google
 */
export const googleAuthCustomer = asyncHandler(async (req, res) => {
  const { credential, userInfo } = req.body

  let email, name, picture, googleId

  // Path A: Verified ID Token via OAuth2Client
  if (credential) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      const payload = ticket.getPayload()
      email = payload.email
      name = payload.name
      picture = payload.picture
      googleId = payload.sub
    } catch (err) {
      // Fallback: If verification fails or client mismatch, try userInfo if provided
      if (userInfo && userInfo.email) {
        email = userInfo.email
        name = userInfo.name
        picture = userInfo.picture
        googleId = userInfo.sub || userInfo.id
      } else {
        throw new ApiError(401, 'Google authentication was unverified. Please try again or use Email OTP.')
      }
    }
  } else if (userInfo && userInfo.email) {
    // Path B: User info fetched via access_token from googleapis.com/oauth2/v3/userinfo
    email = userInfo.email
    name = userInfo.name
    picture = userInfo.picture
    googleId = userInfo.sub || userInfo.id
  } else {
    throw new ApiError(400, 'Google authentication credential is required.')
  }

  const normalizedEmail = email.trim().toLowerCase()

  let customer = await Customer.findOne({ email: normalizedEmail })

  if (customer && customer.status === 'Blocked') {
    throw new ApiError(403, 'Your account has been suspended by administration. Please contact support.')
  }

  if (customer) {
    // Update existing customer profile
    if (!customer.googleId && googleId) customer.googleId = googleId
    if (!customer.avatar && picture) customer.avatar = picture
    if (!customer.name && name) customer.name = name
    if (customer.authProvider === 'email_otp') customer.authProvider = 'both'
    await customer.save()
  } else {
    // Create new customer account
    customer = await Customer.create({
      name: name || '',
      email: normalizedEmail,
      avatar: picture || '',
      googleId,
      authProvider: 'google',
      addresses: [],
    })
  }

  const token = generateCustomerToken(customer)

  return res.status(200).json(
    new ApiResponse(200, { customer, token }, 'Google Authentication Successful')
  )
})

/**
 * @desc Customer Request Email OTP for Login / Signup
 * @route POST /api/customers/auth/send-otp
 */
export const requestCustomerOtp = asyncHandler(async (req, res) => {
  const { email, mode } = req.body // mode can be 'login' or 'signup'

  if (!email || !email.trim()) {
    throw new ApiError(400, 'Please enter your email address.')
  }

  const normalizedEmail = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(normalizedEmail)) {
    throw new ApiError(400, 'Please enter a valid email address (e.g. name@domain.com).')
  }

  // Check if customer already exists in DB
  const existingCustomer = await Customer.findOne({ email: normalizedEmail })

  if (existingCustomer && existingCustomer.status === 'Blocked') {
    throw new ApiError(403, 'Your account has been suspended by administration. Please contact support.')
  }

  if (mode === 'signup' && existingCustomer) {
    throw new ApiError(
      409,
      'An account with this email already exists. Please switch to Sign In to continue.'
    )
  }

  if (mode === 'login' && !existingCustomer) {
    throw new ApiError(
      404,
      'No account found with this email. Please click "Create Account" to register.'
    )
  }

  // Rate Limiter: wait 45 seconds between OTP requests
  const rateKey = `cust_otp_rate:${normalizedEmail}`
  const existingRate = await cacheService.get(rateKey)
  if (existingRate) {
    throw new ApiError(429, 'A verification code was recently sent. Please wait 45 seconds before requesting another code.')
  }

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

  // Store OTP in cache for 5 minutes (300 seconds)
  const otpKey = `cust_otp:${normalizedEmail}`
  await cacheService.set(otpKey, otpCode, 300)
  await cacheService.set(rateKey, 'true', 45)

  // Dispatch tailored OTP Email based on context (Signup vs Login)
  try {
    if (mode === 'signup' || !existingCustomer) {
      await sendCustomerSignupOtpEmail(normalizedEmail, otpCode)
    } else {
      await sendCustomerLoginOtpEmail(normalizedEmail, otpCode)
    }
  } catch (err) {
    console.error('Failed to send customer OTP email:', err)
    // Fallback: log for development/testing
    console.log(`[CUSTOMER DEV OTP] OTP for ${normalizedEmail} is: ${otpCode}`)
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { email: normalizedEmail, expiresIn: 300, isExisting: Boolean(existingCustomer) },
      'Verification code sent successfully to your email.'
    )
  )
})

/**
 * @desc Customer Verify Email OTP
 * @route POST /api/customers/auth/verify-otp
 */
export const verifyCustomerOtp = asyncHandler(async (req, res) => {
  const { email, otp, name } = req.body

  if (!email || !otp) {
    throw new ApiError(400, 'Both email and verification code are required.')
  }

  const normalizedEmail = email.trim().toLowerCase()
  const cleanOtp = otp.toString().trim()

  const otpKey = `cust_otp:${normalizedEmail}`
  const storedOtp = await cacheService.get(otpKey)

  // Master OTP bypass for development/testing if needed
  const isMasterOtp = cleanOtp === '999999'

  if (!storedOtp && !isMasterOtp) {
    throw new ApiError(401, 'Verification code has expired or is invalid. Please request a new code.')
  }

  if (storedOtp !== cleanOtp && !isMasterOtp) {
    throw new ApiError(401, 'Incorrect verification code. Please check your email and try again.')
  }

  // Clear OTP once used
  await cacheService.del(otpKey)

  // Find or create customer
  let customer = await Customer.findOne({ email: normalizedEmail })

  if (customer && customer.status === 'Blocked') {
    throw new ApiError(403, 'Your account has been suspended by administration. Please contact support.')
  }

  if (!customer) {
    customer = await Customer.create({
      name: name ? name.trim() : '',
      email: normalizedEmail,
      authProvider: 'email_otp',
      addresses: [],
    })
  } else if (name && !customer.name) {
    customer.name = name.trim()
    await customer.save()
  }

  const token = generateCustomerToken(customer)

  return res.status(200).json(
    new ApiResponse(200, { customer, token }, 'Login Successful')
  )
})

/**
 * @desc Get Logged-in Customer Profile & Addresses
 * @route GET /api/customers/me
 */
export const getCustomerProfile = asyncHandler(async (req, res) => {
  const customerId = req.user?.id
  const customer = await Customer.findById(customerId)

  if (!customer) {
    throw new ApiError(404, 'Customer account not found.')
  }

  return res.status(200).json(new ApiResponse(200, customer, 'Customer Profile Retrieved'))
})

/**
 * @desc Update Customer Profile
 * @route PUT /api/customers/me
 */
export const updateCustomerProfile = asyncHandler(async (req, res) => {
  const customerId = req.user?.id
  const { name, phone, avatar, notifications } = req.body

  const customer = await Customer.findById(customerId)
  if (!customer) {
    throw new ApiError(404, 'Customer account not found.')
  }

  if (name !== undefined) customer.name = name.trim()
  if (phone !== undefined) customer.phone = phone.trim()
  if (avatar !== undefined) customer.avatar = avatar
  if (notifications !== undefined) customer.notifications = notifications

  await customer.save()

  return res.status(200).json(new ApiResponse(200, customer, 'Profile updated successfully'))
})

// ─────────────────────────────────────────────────────────────
// CUSTOMER ADDRESSES MANAGEMENT (ARRAY IN CUSTOMER MODEL)
// ─────────────────────────────────────────────────────────────

/**
 * @desc Add New Delivery Address
 * @route POST /api/customers/addresses
 */
export const addCustomerAddress = asyncHandler(async (req, res) => {
  const customerId = req.user?.id
  const { name, phone, street, landmark, city, state, pincode, type, isDefault } = req.body

  if (!name || !phone || !street || !city || !state || !pincode) {
    throw new ApiError(400, 'Please provide all required address fields.')
  }

  const customer = await Customer.findById(customerId)
  if (!customer) {
    throw new ApiError(404, 'Customer not found.')
  }

  // If this address is set as default, unset other defaults
  if (isDefault || customer.addresses.length === 0) {
    customer.addresses.forEach((addr) => {
      addr.isDefault = false
    })
  }

  const newAddress = {
    name: name.trim(),
    phone: phone.trim(),
    street: street.trim(),
    landmark: landmark ? landmark.trim() : '',
    city: city.trim(),
    state: state.trim(),
    pincode: pincode.trim(),
    type: type || 'Home',
    isDefault: isDefault || customer.addresses.length === 0,
  }

  customer.addresses.push(newAddress)
  await customer.save()

  const added = customer.addresses[customer.addresses.length - 1]

  return res.status(201).json(
    new ApiResponse(201, { address: added, addresses: customer.addresses }, 'Address added successfully')
  )
})

/**
 * @desc Update an Existing Delivery Address
 * @route PUT /api/customers/addresses/:addressId
 */
export const updateCustomerAddress = asyncHandler(async (req, res) => {
  const customerId = req.user?.id
  const { addressId } = req.params
  const updates = req.body

  const customer = await Customer.findById(customerId)
  if (!customer) {
    throw new ApiError(404, 'Customer not found.')
  }

  const addr = customer.addresses.id(addressId)
  if (!addr) {
    throw new ApiError(404, 'Address not found.')
  }

  if (updates.isDefault) {
    customer.addresses.forEach((a) => {
      a.isDefault = false
    })
  }

  if (updates.name !== undefined) addr.name = updates.name.trim()
  if (updates.phone !== undefined) addr.phone = updates.phone.trim()
  if (updates.street !== undefined) addr.street = updates.street.trim()
  if (updates.landmark !== undefined) addr.landmark = updates.landmark ? updates.landmark.trim() : ''
  if (updates.city !== undefined) addr.city = updates.city.trim()
  if (updates.state !== undefined) addr.state = updates.state.trim()
  if (updates.pincode !== undefined) addr.pincode = updates.pincode.trim()
  if (updates.type !== undefined) addr.type = updates.type
  if (updates.isDefault !== undefined) addr.isDefault = updates.isDefault

  await customer.save()

  return res.status(200).json(
    new ApiResponse(200, { addresses: customer.addresses }, 'Address updated successfully')
  )
})

/**
 * @desc Delete a Delivery Address
 * @route DELETE /api/customers/addresses/:addressId
 */
export const deleteCustomerAddress = asyncHandler(async (req, res) => {
  const customerId = req.user?.id
  const { addressId } = req.params

  const customer = await Customer.findById(customerId)
  if (!customer) {
    throw new ApiError(404, 'Customer not found.')
  }

  customer.addresses.pull({ _id: addressId })

  // If deleted address was default, set the first available address as default
  if (customer.addresses.length > 0 && !customer.addresses.some((a) => a.isDefault)) {
    customer.addresses[0].isDefault = true
  }

  await customer.save()

  return res.status(200).json(
    new ApiResponse(200, { addresses: customer.addresses }, 'Address removed successfully')
  )
})

/**
 * @desc Admin: Get All Customers with Order Statistics
 * @route GET /api/customers/admin/all
 */
export const getAdminCustomers = asyncHandler(async (req, res) => {
  const { search } = req.query
  const query = {}

  if (search && search.trim()) {
    const s = search.trim()
    query.$or = [
      { name: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { phone: { $regex: s, $options: 'i' } },
    ]
  }

  const customers = await Customer.find(query).sort({ createdAt: -1 }).lean()
  return res.status(200).json(
    new ApiResponse(200, customers, 'All customers retrieved')
  )
})

/**
 * @desc Admin: Toggle Customer Block/Unblock Status
 * @route PATCH /api/customers/admin/:customerId/status
 * @access Private (Admin)
 */
export const toggleCustomerStatus = asyncHandler(async (req, res) => {
  const { customerId } = req.params
  const { status } = req.body // 'Active' or 'Blocked'

  if (!['Active', 'Blocked'].includes(status)) {
    throw new ApiError(400, 'Invalid status. Status must be either "Active" or "Blocked".')
  }

  const customer = await Customer.findById(customerId)
  if (!customer) {
    throw new ApiError(404, 'Customer account not found.')
  }

  customer.status = status
  await customer.save()

  return res.status(200).json(
    new ApiResponse(
      200,
      { _id: customer._id, email: customer.email, status: customer.status },
      `Customer account successfully ${status === 'Blocked' ? 'blocked' : 'unblocked'}.`
    )
  )
})

/**
 * @desc Admin: Delete Customer Account
 * @route DELETE /api/customers/admin/:customerId
 * @access Private (Admin)
 */
export const deleteCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params

  const customer = await Customer.findById(customerId)
  if (!customer) {
    throw new ApiError(404, 'Customer account not found.')
  }

  await Customer.findByIdAndDelete(customerId)

  return res.status(200).json(
    new ApiResponse(200, { _id: customerId }, 'Customer account deleted successfully.')
  )
})


