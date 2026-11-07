import Setting from '../models/Setting.js'

// Default fallback cities if none initialized
const DEFAULT_CITIES = [
  { id: 'city-1', name: 'Chennai', cost: 40 },
  { id: 'city-2', name: 'Bangalore', cost: 60 },
  { id: 'city-3', name: 'Hyderabad', cost: 70 },
  { id: 'city-4', name: 'Mumbai', cost: 90 },
  { id: 'city-5', name: 'Delhi NCR', cost: 100 },
  { id: 'city-6', name: 'Kolkata', cost: 110 },
  { id: 'city-7', name: 'Coimbatore', cost: 50 },
  { id: 'city-8', name: 'Madurai', cost: 45 },
]

/**
 * Helper to ensure a settings singleton document exists in DB
 */
const getOrCreateSettings = async () => {
  let setting = await Setting.findOne()
  if (!setting) {
    setting = await Setting.create({
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
          cities: DEFAULT_CITIES,
        },
      },
    })
  } else if (!setting.shipping || !setting.shipping.cityBased || !setting.shipping.cityBased.cities || setting.shipping.cityBased.cities.length === 0) {
    setting.shipping = setting.shipping || {}
    setting.shipping.cityBased = setting.shipping.cityBased || {}
    setting.shipping.cityBased.cities = DEFAULT_CITIES
    await setting.save()
  }
  return setting
}

/**
 * @desc Get all settings (store identity, social links, shipping, etc.)
 * @route GET /api/settings
 * @access Public
 */
export const getSettings = async (req, res) => {
  try {
    const setting = await getOrCreateSettings()
    res.status(200).json({
      success: true,
      message: 'Store settings retrieved successfully',
      data: setting,
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings',
      error: error.message,
    })
  }
}

/**
 * @desc Update settings
 * @route PUT /api/settings
 * @access Public / Admin
 */
export const updateSettings = async (req, res) => {
  try {
    const current = await getOrCreateSettings()
    const updates = req.body

    // Merge updates into document
    if (updates.storeName !== undefined) current.storeName = updates.storeName
    if (updates.contactEmail !== undefined) current.contactEmail = updates.contactEmail
    if (updates.supportPhone !== undefined) current.supportPhone = updates.supportPhone
    if (updates.atelierAddress !== undefined) current.atelierAddress = updates.atelierAddress
    if (updates.googleMapsUrl !== undefined) current.googleMapsUrl = updates.googleMapsUrl

    if (updates.instagram !== undefined) current.instagram = updates.instagram
    if (updates.facebook !== undefined) current.facebook = updates.facebook
    if (updates.twitter !== undefined) current.twitter = updates.twitter
    if (updates.youtube !== undefined) current.youtube = updates.youtube

    if (updates.estimatedDays !== undefined) current.estimatedDays = updates.estimatedDays

    if (updates.shipping) {
      if (updates.shipping.weightBased) {
        current.shipping.weightBased = {
          ...current.shipping.weightBased,
          ...updates.shipping.weightBased,
        }
      }
      if (updates.shipping.cityBased) {
        current.shipping.cityBased = {
          ...current.shipping.cityBased,
          ...updates.shipping.cityBased,
        }
      }
    }

    if (updates.adminPhone !== undefined) current.adminPhone = updates.adminPhone
    if (updates.adminEmail !== undefined) current.adminEmail = updates.adminEmail
    if (updates.authMethod !== undefined) current.authMethod = updates.authMethod

    await current.save()

    res.status(200).json({
      success: true,
      message: 'Store settings updated successfully',
      data: current,
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message,
    })
  }
}

