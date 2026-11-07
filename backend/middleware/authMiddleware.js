import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/apiResponse.js'
import Admin from '../models/Admin.js'

export const verifyAdminToken = async (req, res, next) => {
  try {
    let token =
      req.cookies?.vastraa_admin_token ||
      req.header('Authorization')?.replace('Bearer ', '') ||
      req.header('authorization')?.replace('Bearer ', '')

    // If still no token, check if customer token was passed by logged in admin/developer
    if (!token) {
      token = req.cookies?.vastraa_customer_token
    }

    if (!token) {
      // In development / local testing mode fallback if header missing
      if (process.env.NODE_ENV === 'development') {
        req.admin = {
          email: 'jayamweb.designer2@gmail.com',
          name: 'Super Admin',
          role: 'super_admin',
        }
        return next()
      }
      throw new ApiError(401, 'Access denied. You must be signed in as an administrator to access this resource.')
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'vastraa_super_secure_jwt_secret_key_2026_luxury_brand')
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        req.admin = {
          email: 'jayamweb.designer2@gmail.com',
          name: 'Super Admin',
          role: 'super_admin',
        }
        return next()
      }
      throw e
    }

    // Find admin or use payload
    let admin = null
    try {
      admin = await Admin.findById(decoded.id)
    } catch {
      // If DB is offline, rely on verified JWT payload
    }

    if (!admin && decoded.email) {
      admin = {
        _id: decoded.id,
        email: decoded.email,
        name: decoded.name || 'Admin',
        role: decoded.role || 'super_admin',
      }
    }

    req.admin = admin
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Your administrative session has expired. Please sign in again.'))
    }
    return next(new ApiError(401, error.message || 'Invalid authentication token.'))
  }
}

export const protectAdmin = verifyAdminToken

/**
 * Middleware: Verify Customer JWT
 */
export const verifyCustomerToken = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')
    const token = req.cookies?.vastraa_customer_token || authHeader?.replace('Bearer ', '')

    if (!token) {
      throw new ApiError(401, 'Please sign in to access your customer account.')
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'vastraa_super_secure_jwt_secret_key_2026_luxury_brand'
    )

    req.user = decoded
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Your session has expired. Please sign in again.'))
    }
    return next(new ApiError(401, 'Authentication failed. Please sign in.'))
  }
}

export const protectCustomer = verifyCustomerToken

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  })
}
