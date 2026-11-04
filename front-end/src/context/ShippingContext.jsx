import React, { createContext, useContext, useState, useEffect } from 'react'

const ShippingContext = createContext(null)

const STORAGE_KEY = 'vastraa_shipping_settings'

// Default Shipping Configuration
const DEFAULT_SHIPPING_SETTINGS = {
  // 1. Weight-based settings
  weightBased: {
    enabled: true,
    initialWeightKg: 1, // Base initial weight in kg (e.g., 1 kg)
    initialWeightCost: 50, // Amount in ₹ for the initial base weight (e.g., ₹50)
    incrementGrams: 200, // Customizable step interval in grams (e.g., 200g, 300g, etc.)
    incrementCost: 20, // Amount in ₹ for each increment step (e.g., ₹20 per 200g)
  },

  // 2. City-based settings (manually added/managed by Admin)
  cityBased: {
    enabled: true,
    cities: [
      { id: 'city-1', name: 'Chennai', cost: 40 },
      { id: 'city-2', name: 'Bangalore', cost: 60 },
      { id: 'city-3', name: 'Hyderabad', cost: 70 },
      { id: 'city-4', name: 'Mumbai', cost: 90 },
      { id: 'city-5', name: 'Delhi NCR', cost: 100 },
      { id: 'city-6', name: 'Kolkata', cost: 110 },
      { id: 'city-7', name: 'Coimbatore', cost: 50 },
      { id: 'city-8', name: 'Madurai', cost: 45 },
    ],
  },
}

export const ShippingProvider = ({ children }) => {
  const [shippingSettings, setShippingSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load shipping settings from storage', e)
    }
    return DEFAULT_SHIPPING_SETTINGS
  })

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shippingSettings))
    } catch (e) {
      console.error('Failed to save shipping settings', e)
    }
  }, [shippingSettings])

  // Update Weight-based configuration
  const updateWeightSettings = (newWeightSettings) => {
    setShippingSettings((prev) => ({
      ...prev,
      weightBased: {
        ...prev.weightBased,
        ...newWeightSettings,
      },
    }))
  }

  // Add a new City with custom shipping cost
  const addCity = (name, cost) => {
    if (!name || !name.trim()) return { success: false, error: 'City name is required' }
    const formattedName = name.trim()

    // Check if city already exists (case-insensitive)
    const existing = shippingSettings.cityBased.cities.find(
      (c) => c.name.toLowerCase() === formattedName.toLowerCase()
    )

    if (existing) {
      return {
        success: false,
        error: `"${existing.name}" is already added to the shipping list with delivery fee ₹${existing.cost}.`,
      }
    }

    setShippingSettings((prev) => ({
      ...prev,
      cityBased: {
        ...prev.cityBased,
        cities: [
          ...prev.cityBased.cities,
          {
            id: 'city-' + Date.now(),
            name: formattedName,
            cost: Number(cost) || 0,
          },
        ],
      },
    }))

    return { success: true }
  }

  // Update an existing city
  const updateCity = (id, newName, newCost) => {
    setShippingSettings((prev) => ({
      ...prev,
      cityBased: {
        ...prev.cityBased,
        cities: prev.cityBased.cities.map((c) =>
          c.id === id ? { ...c, name: newName.trim(), cost: Number(newCost) || 0 } : c
        ),
      },
    }))
  }

  // Remove a city
  const removeCity = (id) => {
    setShippingSettings((prev) => ({
      ...prev,
      cityBased: {
        ...prev.cityBased,
        cities: prev.cityBased.cities.filter((c) => c.id !== id),
      },
    }))
  }

  /**
   * Calculate Total Shipping Fee based on:
   * 1. Total order weight (in grams or kg)
   * 2. Destination City
   * 
   * @param {number} totalWeightGrams - Total weight of all items in grams
   * @param {string} cityName - Selected destination city
   * @returns {{
   *   weightCost: number,
   *   cityCost: number,
   *   totalShipping: number,
   *   weightBreakdown: string,
   *   cityBreakdown: string,
   *   totalWeightGrams: number
   * }}
   */
  const calculateShippingCost = (totalWeightGrams = 0, cityName = '') => {
    const { weightBased, cityBased } = shippingSettings

    // 1. Calculate Weight-Based Cost
    let weightCost = 0
    let weightBreakdown = ''
    const baseWeightGrams = (Number(weightBased.initialWeightKg) || 1) * 1000
    const baseCost = Number(weightBased.initialWeightCost) || 0
    const stepGrams = Number(weightBased.incrementGrams) || 200
    const stepCost = Number(weightBased.incrementCost) || 0

    if (totalWeightGrams <= 0) {
      weightCost = 0
      weightBreakdown = 'No weight'
    } else if (totalWeightGrams <= baseWeightGrams) {
      weightCost = baseCost
      weightBreakdown = `Base weight (up to ${(baseWeightGrams / 1000).toFixed(1)}kg): ₹${baseCost}`
    } else {
      const extraGrams = totalWeightGrams - baseWeightGrams
      // Calculate number of increments (ceil ensures any fraction of the increment is covered)
      const increments = Math.ceil(extraGrams / stepGrams)
      const extraCost = increments * stepCost
      weightCost = baseCost + extraCost
      weightBreakdown = `Base (₹${baseCost}) + Extra ${increments} × ${stepGrams}g (₹${extraCost})`
    }

    // 2. Calculate City-Based Cost
    let cityCost = 0
    let cityBreakdown = ''
    if (cityName) {
      const matched = cityBased.cities.find(
        (c) => c.name.toLowerCase() === cityName.trim().toLowerCase()
      )
      if (matched) {
        cityCost = Number(matched.cost) || 0
        cityBreakdown = `${matched.name} delivery charge: ₹${cityCost}`
      } else {
        cityBreakdown = `Standard city delivery`
      }
    }

    const totalShipping = weightCost + cityCost

    return {
      weightCost,
      cityCost,
      totalShipping,
      weightBreakdown,
      cityBreakdown,
      totalWeightGrams,
    }
  }

  return (
    <ShippingContext.Provider
      value={{
        shippingSettings,
        updateWeightSettings,
        addCity,
        updateCity,
        removeCity,
        calculateShippingCost,
        cityList: shippingSettings.cityBased.cities,
      }}
    >
      {children}
    </ShippingContext.Provider>
  )
}

export const useShipping = () => {
  const context = useContext(ShippingContext)
  if (!context) {
    throw new Error('useShipping must be used within a ShippingProvider')
  }
  return context
}

