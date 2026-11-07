import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AdminAuthContext = createContext(null)

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem('vastraa_admin_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('vastraa_admin_token') || '')
  const [loading, setLoading] = useState(false)

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('vastraa_admin_token', token)
    } else {
      localStorage.removeItem('vastraa_admin_token')
    }
  }, [token])

  // Sync admin to localStorage
  useEffect(() => {
    if (admin) {
      localStorage.setItem('vastraa_admin_user', JSON.stringify(admin))
    } else {
      localStorage.removeItem('vastraa_admin_user')
    }
  }, [admin])

  // 1. Request Email OTP
  const requestOtp = async (email) => {
    setLoading(true)
    try {
      const res = await api.post('/admin/auth/request-otp', { email })
      setLoading(false)
      return res
    } catch (err) {
      setLoading(false)
      throw err
    }
  }

  // 2. Verify Email OTP
  const verifyOtp = async (email, otp) => {
    setLoading(true)
    try {
      const res = await api.post('/admin/auth/verify-otp', { email, otp })
      if (res?.data?.token) {
        setToken(res.data.token)
        setAdmin(res.data.admin)
      }
      setLoading(false)
      return res
    } catch (err) {
      setLoading(false)
      throw err
    }
  }

  // 3. Login with Google
  const loginGoogle = async (credentialResponse) => {
    setLoading(true)
    try {
      const res = await api.post('/admin/auth/google', {
        credential: credentialResponse.credential,
      })
      if (res?.data?.token) {
        setToken(res.data.token)
        setAdmin(res.data.admin)
      }
      setLoading(false)
      return res
    } catch (err) {
      setLoading(false)
      throw err
    }
  }

  // 4. Logout
  const logout = async () => {
    try {
      await api.post('/admin/auth/logout')
    } catch {
      // ignore network errors on logout
    }
    setToken('')
    setAdmin(null)
    localStorage.removeItem('vastraa_admin_token')
    localStorage.removeItem('vastraa_admin_user')
  }

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token,
        loading,
        requestOtp,
        verifyOtp,
        loginGoogle,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

