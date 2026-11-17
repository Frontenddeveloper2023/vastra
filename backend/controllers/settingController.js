import Setting from '../models/Setting.js'
import { emitEvent } from '../services/socketService.js'

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
 * Helper to resolve Google Maps short URLs or place links into an embeddable URL
 */
const resolveGoogleMapsUrl = async (inputUrl) => {
  if (!inputUrl || typeof inputUrl !== 'string') return inputUrl
  const trimmed = inputUrl.trim()

  // 1. If it's already an embed link (e.g. includes /maps/embed or output=embed)
  if (trimmed.includes('/maps/embed') || trimmed.includes('output=embed')) {
    return trimmed
  }

  // 2. If it's a short URL (maps.app.goo.gl or goo.gl/maps)
  if (trimmed.includes('maps.app.goo.gl') || trimmed.includes('goo.gl/maps')) {
    try {
      const response = await fetch(trimmed, { redirect: 'manual' })
      const redirectUrl = response.headers.get('location') || ''
      if (redirectUrl) {
        // Check for coordinates like 12.921859, 80.092649
        const coords = redirectUrl.match(/(-?\d+\.\d+),\s*\+?(-?\d+\.\d+)/)
        if (coords) {
          return `https://maps.google.com/maps?q=${coords[1]},${coords[2]}&t=&z=16&ie=UTF8&iwloc=&output=embed`
        }
        // Check for place name like /place/Jayam+Web+Solutions+Pvt+Ltd/@12.9216708,80.0895167
        const placeMatch = redirectUrl.match(/\/place\/([^/@]+)/)
        if (placeMatch) {
          const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
          return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=16&ie=UTF8&iwloc=&output=embed`
        }
      }
    } catch (err) {
      console.error('Failed to resolve Google Maps short URL:', err)
    }
  }

  // 3. Check for standard coordinates directly in URL or query
  const directCoords = trimmed.match(/(-?\d+\.\d+),\s*\+?(-?\d+\.\d+)/)
  if (directCoords) {
    return `https://maps.google.com/maps?q=${directCoords[1]},${directCoords[2]}&t=&z=16&ie=UTF8&iwloc=&output=embed`
  }

  // 4. Default: convert query/place directly to Google Maps embed
  const clean = trimmed.replace(/^https?:\/\/(www\.)?(google\.com\/maps\/?\??(q=)?)/i, '')
  return `https://maps.google.com/maps?q=${encodeURIComponent(clean)}&t=&z=16&ie=UTF8&iwloc=&output=embed`
}

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
    if (updates.logoUrl !== undefined) current.logoUrl = updates.logoUrl
    if (updates.contactEmail !== undefined) current.contactEmail = updates.contactEmail
    if (updates.supportPhone !== undefined) current.supportPhone = updates.supportPhone
    if (updates.atelierAddress !== undefined) current.atelierAddress = updates.atelierAddress
    if (updates.googleMapsUrl !== undefined) {
      current.googleMapsUrl = await resolveGoogleMapsUrl(updates.googleMapsUrl)
    }

    if (updates.instagram !== undefined) current.instagram = updates.instagram
    if (updates.facebook !== undefined) current.facebook = updates.facebook
    if (updates.twitter !== undefined) current.twitter = updates.twitter
    if (updates.youtube !== undefined) current.youtube = updates.youtube
    if (updates.navAnnouncement !== undefined) current.navAnnouncement = updates.navAnnouncement
    if (updates.whatsappMessage !== undefined) current.whatsappMessage = updates.whatsappMessage
    if (updates.signatureUrl !== undefined) current.signatureUrl = updates.signatureUrl

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

    if (updates.returnPolicy) {
      current.returnPolicy = {
        ...current.returnPolicy,
        ...updates.returnPolicy,
      }
    }

    if (updates.gst) {
      current.gst = {
        ...current.gst,
        ...updates.gst,
      }
    }

    await current.save()

    // ⚡ Emit WebSocket event for instant global update across all open user pages
    emitEvent('settings:updated', {
      settings: current,
      shipping: current.shipping,
      returnPolicy: current.returnPolicy,
      gst: current.gst,
      message: 'Store settings updated',
    })

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

