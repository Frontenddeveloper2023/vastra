import React, { createContext, useContext, useState, useEffect } from 'react'
import getSocket from '../services/socket'
import { API_BASE_URL } from '../config/apiConfig'

const SettingsContext = createContext(null)

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    storeName: '',
    logoUrl: '',
    contactEmail: '',
    supportPhone: '',
    atelierAddress: '',
    googleMapsUrl: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    navAnnouncement: 'Pay Online & GET 10% OFF',
    whatsappMessage: 'Hello Vastraa, I am browsing your saree collection and would like to know more details!',
    estimatedDays: '3 to 5 business days',
    shipping: {
      weightBased: {
        enabled: true,
        initialWeightKg: 1,
        initialWeightCost: 50,
        incrementGrams: 200,
        incrementCost: 20,
      },
      cityBased: {
        enabled: true,
        cities: [],
      },
    },
    adminPhone: '+91 9807738888',
    adminEmail: 'admin@vastraa.com',
    authMethod: 'OTP Only (SMS & Email)',
    signatureUrl: '',
    gst: {
      enabled: false,
      gstNumber: '',
      percentage: 5,
    },
  })
  const [loading, setLoading] = useState(true)

  // Fetch settings from MongoDB
  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`)
      const result = await res.json()
      if (result.success && result.data) {
        setSettings((prev) => ({
          ...prev,
          ...result.data,
          shipping: {
            ...prev.shipping,
            ...(result.data.shipping || {}),
          },
        }))
      }
    } catch (err) {
      console.error('Failed to load settings from server:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()

    // ⚡ Real-time WebSocket listener for immediate instant settings updates
    const socket = getSocket()
    const onSettingsUpdated = (data) => {
      const updated = data?.settings || data
      if (updated) {
        setSettings((prev) => ({
          ...prev,
          ...(typeof updated === 'object' ? updated : {}),
          gst: updated.gst || data?.gst || prev.gst,
          returnPolicy: updated.returnPolicy || data?.returnPolicy || prev.returnPolicy,
        }))
      }
    }

    socket.on('settings:updated', onSettingsUpdated)

    return () => {
      socket.off('settings:updated', onSettingsUpdated)
    }
  }, [])

  // Save/Update settings in MongoDB
  const updateSettings = async (newSettings) => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      })
      const result = await res.json()
      if (result.success && result.data) {
        setSettings((prev) => ({
          ...prev,
          ...result.data,
        }))
        return { success: true, data: result.data }
      }
      return { success: false, error: result.message || 'Failed to update settings' }
    } catch (err) {
      console.error('Error updating settings:', err)
      return { success: false, error: err.message }
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        fetchSettings,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

