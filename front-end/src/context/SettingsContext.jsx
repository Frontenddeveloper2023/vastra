import React, { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext(null)

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    storeName: 'Vastraa - The House of Sarees',
    contactEmail: 'vastraa@gmail.com',
    supportPhone: '+91 9807738888',
    atelierAddress: 'Plot No 1, 3rd Street, Tambaram, Urapakkam, Chennai - 603 210',
    googleMapsUrl: 'https://maps.google.com/?q=Tambaram+Urapakkam+Chennai',
    instagram: 'https://instagram.com/vastraasarees',
    facebook: 'https://facebook.com/vastraasarees',
    twitter: 'https://x.com/vastraasarees',
    youtube: 'https://youtube.com/@vastraasarees',
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

