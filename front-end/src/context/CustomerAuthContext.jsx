import React, { createContext, useContext, useState, useEffect } from 'react'
import { API_BASE_URL } from '../config/apiConfig'

const CustomerAuthContext = createContext(null)
const TOKEN_KEY = 'vastraa_customer_token'
const USER_KEY = 'vastraa_customer_user'

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem(TOKEN_KEY) || null
  })

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Persist session to localStorage
  useEffect(() => {
    if (token && customer) {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(customer))
    } else {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  }, [token, customer])

  // Fetch updated customer profile & addresses from MongoDB
  const refreshCustomer = async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE_URL}/customers/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const result = await res.json()
      if (res.status === 401 || res.status === 403 || result?.data?.status === 'Blocked') {
        // Customer was blocked or token invalidated; immediately log out
        logout()
        return
      }
      if (result.success && result.data) {
        setCustomer(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch customer profile:', err)
    }
  }

  // Periodic verification to immediately logout if admin blocks customer
  useEffect(() => {
    if (!token) return
    refreshCustomer()
    const interval = setInterval(refreshCustomer, 15000)
    return () => clearInterval(interval)
  }, [token])

  // 1. Google Login / Signup (supports credential or userInfo)
  const loginWithGoogle = async (credentialOrUserInfo) => {
    setLoading(true)
    try {
      const payload = typeof credentialOrUserInfo === 'string'
        ? { credential: credentialOrUserInfo }
        : credentialOrUserInfo?.credential
        ? credentialOrUserInfo
        : { userInfo: credentialOrUserInfo }

      const res = await fetch(`${API_BASE_URL}/customers/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (result.success && result.data) {
        setToken(result.data.token)
        setCustomer(result.data.customer)
        setIsAuthModalOpen(false)
        return { success: true }
      }
      return { success: false, error: result.message || 'Google login failed' }
    } catch (err) {
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // 2. Send Email OTP (mode: 'login' | 'signup' | undefined)
  const sendEmailOtp = async (email, mode) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/customers/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mode }),
      })
      const result = await res.json()
      if (result.success) {
        return { success: true, isExisting: result.data?.isExisting }
      }
      return { success: false, error: result.message || 'Failed to send OTP' }
    } catch (err) {
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // 3. Verify Email OTP & Login
  const verifyEmailOtp = async (email, otp, name = '') => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/customers/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, name }),
      })
      const result = await res.json()
      if (result.success && result.data) {
        setToken(result.data.token)
        setCustomer(result.data.customer)
        setIsAuthModalOpen(false)
        return { success: true }
      }
      return { success: false, error: result.message || 'Invalid or expired OTP' }
    } catch (err) {
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // 4. Add Address
  const addAddress = async (addressData) => {
    if (!token) return { success: false, error: 'Please sign in first' }
    try {
      const res = await fetch(`${API_BASE_URL}/customers/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
      })
      const result = await res.json()
      if (result.success && result.data) {
        setCustomer((prev) => ({
          ...prev,
          addresses: result.data.addresses,
        }))
        return { success: true, address: result.data.address }
      }
      return { success: false, error: result.message || 'Failed to add address' }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // 5. Update Address
  const updateAddress = async (addressId, addressData) => {
    if (!token) return { success: false, error: 'Please sign in first' }
    try {
      const res = await fetch(`${API_BASE_URL}/customers/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressData),
      })
      const result = await res.json()
      if (result.success && result.data) {
        setCustomer((prev) => ({
          ...prev,
          addresses: result.data.addresses,
        }))
        return { success: true }
      }
      return { success: false, error: result.message || 'Failed to update address' }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // 6. Delete Address
  const deleteAddress = async (addressId) => {
    if (!token) return { success: false, error: 'Please sign in first' }
    try {
      const res = await fetch(`${API_BASE_URL}/customers/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const result = await res.json()
      if (result.success && result.data) {
        setCustomer((prev) => ({
          ...prev,
          addresses: result.data.addresses,
        }))
        return { success: true }
      }
      return { success: false, error: result.message || 'Failed to delete address' }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  // Logout
  const logout = () => {
    setToken(null)
    setCustomer(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        isAuthenticated: Boolean(token && customer),
        loading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        loginWithGoogle,
        sendEmailOtp,
        verifyEmailOtp,
        refreshCustomer,
        addAddress,
        updateAddress,
        deleteAddress,
        logout,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  )
}

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext)
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider')
  }
  return context
}

