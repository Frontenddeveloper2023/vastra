import { useState, useEffect, useRef } from 'react'
import {
  Save,
  MapPin,
  Share2,
  Truck,
  ShieldCheck,
  Building,
  CheckCircle2,
  Scale,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCcw,
  Percent,
  Megaphone,
  MessageCircle,
  Upload,
  Image as ImageIcon,
} from 'lucide-react'
import { useShipping } from '../../context/ShippingContext'
import { useSettings } from '../../context/SettingsContext'
import { AdminDeleteButton, AdminSaveButton } from '../../components/admin/AdminUI'
import { getCmsImageUrl } from '../../utils/imageHelper'
import notify from '../../utils/toast'

export default function AdminSettings() {
  const [saved, setSaved] = useState(false)
  const { settings: globalSettings, updateSettings } = useSettings()
  const {
    shippingSettings,
    updateWeightSettings,
    addCity,
    updateCity,
    removeCity,
  } = useShipping()

  // Weight form local state
  const [weightForm, setWeightForm] = useState({
    initialWeightKg: shippingSettings.weightBased.initialWeightKg,
    initialWeightCost: shippingSettings.weightBased.initialWeightCost,
    incrementGrams: shippingSettings.weightBased.incrementGrams,
    incrementCost: shippingSettings.weightBased.incrementCost,
  })

  // City form local state
  const [newCityName, setNewCityName] = useState('')
  const [newCityCost, setNewCityCost] = useState('')
  const [cityError, setCityError] = useState('')
  const [editingCityId, setEditingCityId] = useState(null)
  const [editCityName, setEditCityName] = useState('')
  const [editCityCost, setEditCityCost] = useState('')
  const [editCityError, setEditCityError] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingSignature, setUploadingSignature] = useState(false)
  const logoInputRef = useRef(null)
  const signatureInputRef = useRef(null)

  const [settings, setSettings] = useState({
    storeName: globalSettings.storeName || 'Vastraa - The House of Sarees',
    logoUrl: globalSettings.logoUrl || '',
    signatureUrl: globalSettings.signatureUrl || '',
    contactEmail: globalSettings.contactEmail || 'vastraa@gmail.com',
    supportPhone: globalSettings.supportPhone || '+91 9807738888',
    atelierAddress: globalSettings.atelierAddress || 'Plot No 1, 3rd Street, Tambaram, Urapakkam, Chennai - 603 210',
    googleMapsUrl: globalSettings.googleMapsUrl || 'https://maps.google.com/?q=Tambaram+Urapakkam+Chennai',
    instagram: globalSettings.instagram || 'https://instagram.com/vastraasarees',
    facebook: globalSettings.facebook || 'https://facebook.com/vastraasarees',
    twitter: globalSettings.twitter || 'https://x.com/vastraasarees',
    youtube: globalSettings.youtube || 'https://youtube.com/@vastraasarees',
    navAnnouncement: globalSettings.navAnnouncement || 'Pay Online & GET 10% OFF',
    whatsappMessage: globalSettings.whatsappMessage || 'Hello Vastraa, I am browsing your saree collection and would like to know more details!',
    estimatedDays: globalSettings.estimatedDays || '3 to 5 business days',
    adminPhone: globalSettings.adminPhone || '+91 9807738888',
    adminEmail: globalSettings.adminEmail || 'admin@vastraa.com',
    authMethod: globalSettings.authMethod || 'OTP Only (SMS & Email)',
    returnPolicyEnabled: globalSettings.returnPolicy?.enabled !== false,
    returnWindowDays: globalSettings.returnPolicy?.returnWindowDays || 7,
    gstEnabled: globalSettings.gst?.enabled || false,
    gstNumber: globalSettings.gst?.gstNumber || '',
    gstPercentage: globalSettings.gst?.percentage ?? 5,
  })

  // Keep local form in sync when globalSettings finishes loading from DB
  useEffect(() => {
    if (globalSettings) {
      setSettings({
        storeName: globalSettings.storeName || '',
        logoUrl: globalSettings.logoUrl || '',
        signatureUrl: globalSettings.signatureUrl || '',
        contactEmail: globalSettings.contactEmail || '',
        supportPhone: globalSettings.supportPhone || '',
        atelierAddress: globalSettings.atelierAddress || '',
        googleMapsUrl: globalSettings.googleMapsUrl || '',
        instagram: globalSettings.instagram || '',
        facebook: globalSettings.facebook || '',
        twitter: globalSettings.twitter || '',
        youtube: globalSettings.youtube || '',
        navAnnouncement: globalSettings.navAnnouncement || 'Pay Online & GET 10% OFF',
        whatsappMessage: globalSettings.whatsappMessage || 'Hello Vastraa, I am browsing your saree collection and would like to know more details!',
        estimatedDays: globalSettings.estimatedDays || '',
        adminPhone: globalSettings.adminPhone || '',
        adminEmail: globalSettings.adminEmail || '',
        authMethod: globalSettings.authMethod || 'OTP Only (SMS & Email)',
        returnPolicyEnabled: globalSettings.returnPolicy?.enabled !== false,
        returnWindowDays: globalSettings.returnPolicy?.returnWindowDays || 7,
        gstEnabled: globalSettings.gst?.enabled || false,
        gstNumber: globalSettings.gst?.gstNumber || '',
        gstPercentage: globalSettings.gst?.percentage ?? 5,
      })
    }
  }, [globalSettings])

  useEffect(() => {
    if (shippingSettings?.weightBased) {
      setWeightForm({
        initialWeightKg: shippingSettings.weightBased.initialWeightKg,
        initialWeightCost: shippingSettings.weightBased.initialWeightCost,
        incrementGrams: shippingSettings.weightBased.incrementGrams,
        incrementCost: shippingSettings.weightBased.incrementCost,
      })
    }
  }, [shippingSettings])

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  // Check in real-time if entered city already exists
  const isCityAlreadyExist = (name, excludeId = null) => {
    if (!name || !name.trim()) return false
    const trimmed = name.trim().toLowerCase()
    return shippingSettings.cityBased.cities.some(
      (c) => c.name.toLowerCase() === trimmed && (excludeId ? c.id !== excludeId : true)
    )
  }

  // Handle adding a new city manually
  const handleAddNewCity = (e) => {
    e.preventDefault()
    setCityError('')

    if (!newCityName.trim()) {
      setCityError('Please enter a city name.')
      return
    }

    // Check before creating
    if (isCityAlreadyExist(newCityName)) {
      const existing = shippingSettings.cityBased.cities.find(
        (c) => c.name.toLowerCase() === newCityName.trim().toLowerCase()
      )
      setCityError(`"${existing.name}" already exists in the city list with delivery charge ₹${existing.cost}!`)
      return
    }

    const res = addCity(newCityName.trim(), Number(newCityCost) || 0)
    if (res && !res.success) {
      setCityError(res.error)
      return
    }

    setNewCityName('')
    setNewCityCost('')
    setCityError('')
  }

  // Handle saving edited city
  const handleSaveEditCity = (id) => {
    setEditCityError('')
    if (!editCityName.trim()) {
      setEditCityError('City name cannot be blank.')
      return
    }

    if (isCityAlreadyExist(editCityName, id)) {
      setEditCityError(`City "${editCityName.trim()}" already exists in the list!`)
      return
    }

    updateCity(id, editCityName.trim(), Number(editCityCost) || 0)
    setEditingCityId(null)
    setEditCityError('')
  }

  // Handle Logo Upload directly
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    try {
      const API_BASE = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api'
      const token = localStorage.getItem('vastraa_admin_token')
      const formData = new FormData()
      formData.append('image', file)
      formData.append('section', 'brand-logo')

      const res = await fetch(`${API_BASE}/settings/upload-logo`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })

      const data = await res.json()
      if (data.success && (data.data?.path || data.data?.image)) {
        const uploadedPath = data.data.path || data.data.image
        handleChange('logoUrl', uploadedPath)
        // Automatically save to settings DB immediately so sidebar updates right away
        await updateSettings({
          ...settings,
          logoUrl: uploadedPath,
        })
        notify.success('Logo uploaded and updated successfully!')
      } else {
        notify.error(data.message || 'Failed to upload brand logo.')
      }
    } catch (err) {
      console.error(err)
      notify.error('Network error uploading logo.')
    } finally {
      setUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ''
    }
  }

  const handleRemoveLogo = async () => {
    handleChange('logoUrl', '')
    await updateSettings({
      ...settings,
      logoUrl: '',
    })
    notify.success('Custom logo removed. Default logo restored.')
  }

  // Handle Signature Upload directly
  const handleSignatureUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingSignature(true)
    try {
      const API_BASE = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api'
      const token = localStorage.getItem('vastraa_admin_token')
      const formData = new FormData()
      formData.append('image', file)
      formData.append('section', 'invoice-signature')

      const res = await fetch(`${API_BASE}/settings/upload-logo`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })

      const data = await res.json()
      if (data.success && (data.data?.path || data.data?.image)) {
        const uploadedPath = data.data.path || data.data.image
        handleChange('signatureUrl', uploadedPath)
        await updateSettings({
          ...settings,
          signatureUrl: uploadedPath,
        })
        notify.success('Invoice signature uploaded and updated successfully!')
      } else {
        notify.error(data.message || 'Failed to upload invoice signature.')
      }
    } catch (err) {
      console.error(err)
      notify.error('Network error uploading signature.')
    } finally {
      setUploadingSignature(false)
      if (signatureInputRef.current) signatureInputRef.current.value = ''
    }
  }

  const handleRemoveSignature = async () => {
    handleChange('signatureUrl', '')
    await updateSettings({
      ...settings,
      signatureUrl: '',
    })
    notify.success('Invoice signature removed.')
  }

  const handleSave = async (e) => {
    e.preventDefault()

    try {
      // 1. Save weight settings to shipping context and DB
      updateWeightSettings({
        initialWeightKg: Number(weightForm.initialWeightKg) || 1,
        initialWeightCost: Number(weightForm.initialWeightCost) || 0,
        incrementGrams: Number(weightForm.incrementGrams) || 200,
        incrementCost: Number(weightForm.incrementCost) || 0,
      })

      // 2. Save store identity, social links, return policy, and admin email to MongoDB
      await updateSettings({
        ...settings,
        returnPolicy: {
          enabled: Boolean(settings.returnPolicyEnabled),
          returnWindowDays: Number(settings.returnWindowDays) || 7,
          returnPolicyText: globalSettings.returnPolicy?.returnPolicyText || '',
        },
        gst: {
          enabled: Boolean(settings.gstEnabled),
          gstNumber: settings.gstNumber?.trim() || '',
          percentage: Number(settings.gstPercentage) || 0,
        },
        shipping: {
          weightBased: {
            enabled: true,
            initialWeightKg: Number(weightForm.initialWeightKg) || 1,
            initialWeightCost: Number(weightForm.initialWeightCost) || 0,
            incrementGrams: Number(weightForm.incrementGrams) || 200,
            incrementCost: Number(weightForm.incrementCost) || 0,
          },
          cityBased: shippingSettings.cityBased,
        },
      })

      setSaved(true)
      notify.success('All settings saved and updated successfully!')
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Failed to save settings:', err)
      notify.error('Failed to update settings. Please try again.')
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ─── Page Title ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className=" text-2xl sm:text-3xl font-bormal text-[#1F1713]">
            Settings
          </h1>

        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-none-xl animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings updated successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Brand Logo & Store Identity */}
        <div className="bg-white border border-[#EDE4D8] rounded-none-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EDE4D8]">
            <ImageIcon className="w-4 h-4 text-[#6D021B]" />
            <h2 className="text-base font-bold text-[#1F1713]">
              Brand Logo & Identity
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 bg-[#FAF7F2] border border-[#EDE4D8] rounded-xl">
            {/* Logo Preview */}
            <div className="w-20 h-20 rounded-xl bg-white border border-[#EDE4D8] p-2 flex items-center justify-center shrink-0 shadow-xs relative group overflow-hidden">
              {settings.logoUrl ? (
                <img
                  src={getCmsImageUrl(settings.logoUrl)}
                  alt="Brand Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <ImageIcon className="w-6 h-6 text-stone-300 mx-auto" />
                  <span className="text-[10px] text-stone-400 font-semibold block mt-1">Default Logo</span>
                </div>
              )}
            </div>

            {/* Logo Actions */}
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs font-bold text-stone-800">Store Logo</p>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Recommended: 250 × 80 px (Max: 500 × 200 px, &lt; 2 MB)
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Upload your official brand logo (PNG or SVG with transparent background recommended, JPG/WebP also supported). Displays in the admin sidebar, customer navigation, and invoice header.
              </p>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  className="hidden"
                  id="logo-upload-input"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6D021B] hover:bg-[#580015] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-all disabled:opacity-60"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingLogo ? 'Uploading...' : 'Upload New Logo'}</span>
                </button>

                {settings.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-red-500" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Authorized Signature Upload */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 bg-[#FAF7F2] border border-[#EDE4D8] rounded-xl mt-4">
            {/* Signature Preview */}
            <div className="w-28 h-16 rounded-xl bg-white border border-[#EDE4D8] p-2 flex items-center justify-center shrink-0 shadow-xs relative group overflow-hidden">
              {settings.signatureUrl ? (
                <img
                  src={getCmsImageUrl(settings.signatureUrl)}
                  alt="Invoice Signature"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <span className="text-[10px] text-stone-400 font-semibold block">No Signature</span>
                </div>
              )}
            </div>

            {/* Signature Actions */}
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs font-bold text-stone-800">Authorized Signature for Invoice PDF</p>
                <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  Recommended: 200 × 70 px (Max: 300 × 120 px, &lt; 1 MB)
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Upload official company stamp or signatory signature photo (transparent PNG recommended for clean white PDF background). If not uploaded, the signature area will be omitted from the invoice.
              </p>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <input
                  type="file"
                  ref={signatureInputRef}
                  onChange={handleSignatureUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  id="signature-upload-input"
                />
                <button
                  type="button"
                  onClick={() => signatureInputRef.current?.click()}
                  disabled={uploadingSignature}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6D021B] hover:bg-[#580015] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-all disabled:opacity-60"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingSignature ? 'Uploading...' : 'Upload Signature'}</span>
                </button>

                {settings.signatureUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveSignature}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-600 border border-stone-200 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-red-500" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 1. Store Identity & Atelier Address */}
        <div className="bg-white border border-[#EDE4D8] rounded-none-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EDE4D8]">
            <Building className="w-4 h-4 text-[#6D021B]" />
            <h2 className=" text-base font-bold text-[#1F1713]">
              Contact Us
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Brand Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => handleChange('supportPhone', e.target.value)}
                className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Google Maps Link / URL</label>
              <input
                type="url"
                value={settings.googleMapsUrl}
                onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
                placeholder="https://maps.google.com/..."
                className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">Address</label>
              <textarea
                rows="2"
                value={settings.atelierAddress}
                onChange={(e) => handleChange('atelierAddress', e.target.value)}
                className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B]"
              />
            </div>
          </div>
        </div>

        {/* 2. Social Media URLs */}
        <div className="bg-white border border-[#EDE4D8] rounded-none-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EDE4D8]">
            <Share2 className="w-4 h-4 text-[#6D021B]" />
            <h2 className=" text-base font-bold text-[#1F1713]">
              Social Media Links (Footer & Top Bar)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Instagram URL</label>
              <input
                type="url"
                value={settings.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Facebook URL</label>
              <input
                type="url"
                value={settings.facebook}
                onChange={(e) => handleChange('facebook', e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">X (Twitter) URL</label>
              <input
                type="url"
                value={settings.twitter}
                onChange={(e) => handleChange('twitter', e.target.value)}
                placeholder="https://x.com/..."
                className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">YouTube URL</label>
              <input
                type="url"
                value={settings.youtube}
                onChange={(e) => handleChange('youtube', e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B]"
              />
            </div>
          </div>
        </div>

        {/* 2B. Top Bar Header Announcement Offer / Promo Text */}
        <div className="bg-white border border-[#EDE4D8] rounded-none-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EDE4D8]">
            <Megaphone className="w-4 h-4 text-[#6D021B]" />
            <div>
              <h2 className="text-base font-bold text-[#1F1713]">
                Header Navbar Announcement (Offer / Promo Bar)
              </h2>
              <p className="text-[11px] text-[#73655B] mt-0.5">
                Edit the announcement promo message displayed in the top bar above the navigation menu.
              </p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Top Bar Announcement Text
            </label>
            <input
              type="text"
              value={settings.navAnnouncement}
              onChange={(e) => handleChange('navAnnouncement', e.target.value)}
              placeholder="e.g., Pay Online & GET 10% OFF"
              className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B] font-medium"
            />
          </div>
        </div>

        {/* 2C. WhatsApp Customer Support Setting */}
        <div className="bg-white border border-[#EDE4D8] rounded-none-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EDE4D8]">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <div>
              <h2 className="text-base font-bold text-[#1F1713]">
                WhatsApp Support Chat Settings
              </h2>
              <p className="text-[11px] text-[#73655B] mt-0.5">
                Customize the pre-filled greeting message sent when customers click the floating WhatsApp button.
              </p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              WhatsApp Pre-filled Message Text
            </label>
            <textarea
              rows={2}
              value={settings.whatsappMessage}
              onChange={(e) => handleChange('whatsappMessage', e.target.value)}
              placeholder="e.g. Hello Vastraa, I am browsing your saree collection and would like to know more details!"
              className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B] text-xs font-medium leading-relaxed"
            />
            <p className="text-[10px] text-stone-400 mt-1">
              Note: The recipient number is taken automatically from your <strong>Support Phone</strong> in Contact Us.
            </p>
          </div>
        </div>

        {/* 3. Shipping Cost Management: Weight Based & City Based */}
        <div className="bg-white border border-[#EDE4D8] rounded-none-2xl p-5 shadow-2xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EDE4D8]">
            <Truck className="w-4 h-4 text-[#6D021B]" />
            <div>
              <h2 className="text-base font-bold text-[#1F1713]">
                Shipping Cost Management (Weight & City Based)
              </h2>
              <p className="text-[11px] text-[#73655B] mt-0.5">
                Configure customizable weight thresholds and city-specific delivery rates used at checkout.
              </p>
            </div>
          </div>

          {/* 3A. Weight-Based Shipping Rule */}
          <div className="bg-[#FAF7F2] p-4.5 rounded-none border border-[#EDE4D8]/80 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#EDE4D8]/60">
              <Scale className="w-4 h-4 text-[#6D021B]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F1713]">
                1. Weight Based Shipping Configuration
              </h3>
            </div>

            <p className="text-[11px] text-stone-600 leading-relaxed">
              Set the initial base weight limit and cost. Admin can customize additional weight increments (e.g. every 200g or 300g) and the extra fee added for each step.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Initial Base Weight (kg) */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Initial Base Weight (in kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={weightForm.initialWeightKg}
                  onChange={(e) =>
                    setWeightForm({ ...weightForm, initialWeightKg: e.target.value })
                  }
                  placeholder="1"
                  className="w-full px-3 py-2 bg-white border border-[#EDE4D8] rounded-none focus:outline-none focus:border-[#6D021B] font-medium"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  e.g., 1 kg base weight
                </span>
              </div>

              {/* Initial Base Weight Cost (₹) */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Initial Base Weight Cost (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={weightForm.initialWeightCost}
                  onChange={(e) =>
                    setWeightForm({ ...weightForm, initialWeightCost: e.target.value })
                  }
                  placeholder="50"
                  className="w-full px-3 py-2 bg-white border border-[#EDE4D8] rounded-none focus:outline-none focus:border-[#6D021B] font-bold text-[#6D021B]"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Amount for initial {weightForm.initialWeightKg || 1} kg
                </span>
              </div>

              {/* Increment Step (grams) */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Every Additional Weight (in grams)
                </label>
                <input
                  type="number"
                  step="50"
                  min="50"
                  value={weightForm.incrementGrams}
                  onChange={(e) =>
                    setWeightForm({ ...weightForm, incrementGrams: e.target.value })
                  }
                  placeholder="200"
                  className="w-full px-3 py-2 bg-white border border-[#EDE4D8] rounded-none focus:outline-none focus:border-[#6D021B] font-medium"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  e.g., 200g or 300g interval
                </span>
              </div>

              {/* Increment Cost (₹) */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Additional Cost per Step (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={weightForm.incrementCost}
                  onChange={(e) =>
                    setWeightForm({ ...weightForm, incrementCost: e.target.value })
                  }
                  placeholder="20"
                  className="w-full px-3 py-2 bg-white border border-[#EDE4D8] rounded-none focus:outline-none focus:border-[#6D021B] font-bold text-emerald-700"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  +₹{weightForm.incrementCost || 0} per every {weightForm.incrementGrams || 200}g
                </span>
              </div>
            </div>

            {/* Live calculation formula preview */}
            <div className="bg-white p-2.5 rounded-none border border-stone-200 text-[11px] text-stone-700 flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-stone-800">
                Formula Preview:
              </span>
              <span>
                Up to <strong>{weightForm.initialWeightKg || 1} kg</strong> = <strong>₹{weightForm.initialWeightCost || 0}</strong>.
                Each additional <strong>{weightForm.incrementGrams || 200}g</strong> adds <strong>+₹{weightForm.incrementCost || 0}</strong>.
              </span>
            </div>
          </div>

          {/* 3B. City-Based Shipping Settings */}
          <div className="bg-[#FAF7F2] p-4.5 rounded-none border border-[#EDE4D8]/80 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#EDE4D8]/60">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#6D021B]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F1713]">
                  2. City Based Shipping Rates ({shippingSettings.cityBased.cities.length} Cities)
                </h3>
              </div>
              <span className="text-[11px] text-stone-500">
                These cities appear in the customer checkout dropdown
              </span>
            </div>

            {/* Add New City Form */}
            <div className="bg-white p-3.5 border border-stone-200 rounded-none space-y-2">
              <span className="block font-bold text-stone-800 text-xs">
                Add New Delivery City Manually:
              </span>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newCityName}
                    onChange={(e) => {
                      setNewCityName(e.target.value)
                      if (cityError) setCityError('')
                    }}
                    placeholder="Enter city name (e.g. Coimbatore, Jaipur)"
                    className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-none focus:outline-none focus:bg-white text-xs ${cityError || isCityAlreadyExist(newCityName)
                        ? 'border-red-400 bg-red-50/20'
                        : 'border-[#EDE4D8]'
                      }`}
                  />
                  {/* Immediate live badge when typing an existing city */}
                  {isCityAlreadyExist(newCityName) && (
                    <span className="absolute right-2 top-2 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 border border-red-200">
                      Already Exists
                    </span>
                  )}
                </div>

                <div className="relative sm:w-44">
                  <span className="absolute left-3 top-2 text-stone-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={newCityCost}
                    onChange={(e) => setNewCityCost(e.target.value)}
                    placeholder="Shipping Cost"
                    className="w-full pl-7 pr-3 py-2 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none focus:outline-none focus:bg-white text-xs font-bold text-[#6D021B]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddNewCity}
                  className="px-4 py-2 bg-[#6D021B] hover:bg-[#520117] text-white font-bold text-xs rounded-none flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add City</span>
                </button>
              </div>

              {/* Warning message if city already exists or error occurred */}
              {(cityError || isCityAlreadyExist(newCityName)) && (
                <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium flex items-center gap-1.5">
                  <span className="font-bold">⚠️ Warning:</span>
                  <span>
                    {cityError ||
                      `City "${newCityName.trim()}" is already in your delivery list (fee: ₹${shippingSettings.cityBased.cities.find(
                        (c) => c.name.toLowerCase() === newCityName.trim().toLowerCase()
                      )?.cost || 0
                      }). Please edit the existing entry or choose a different city.`}
                  </span>
                </div>
              )}
            </div>

            {/* City Rates Table */}
            <div className="border border-stone-200 bg-white overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#FAF7F2] border-b border-stone-200 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-4 font-bold text-stone-700">City Name</th>
                      <th className="py-2.5 px-4 font-bold text-stone-700">Delivery Fee (₹)</th>
                      <th className="py-2.5 px-4 font-bold text-stone-700 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {shippingSettings.cityBased.cities.map((city) => (
                      <tr key={city.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-2.5 px-4 font-medium text-stone-900">
                          {editingCityId === city.id ? (
                            <div>
                              <input
                                type="text"
                                value={editCityName}
                                onChange={(e) => {
                                  setEditCityName(e.target.value)
                                  if (editCityError) setEditCityError('')
                                }}
                                className={`px-2 py-1 border rounded-none bg-white text-xs w-full max-w-xs focus:outline-none ${isCityAlreadyExist(editCityName, city.id) || editCityError
                                    ? 'border-red-400 bg-red-50/20'
                                    : 'border-[#6D021B]'
                                  }`}
                              />
                              {(isCityAlreadyExist(editCityName, city.id) || editCityError) && (
                                <span className="text-[10px] text-red-600 block mt-0.5 font-bold">
                                  {editCityError || '⚠️ City name already exists in list'}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-stone-400" />
                              <span>{city.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-4">
                          {editingCityId === city.id ? (
                            <div className="relative w-28">
                              <span className="absolute left-2 top-1 text-stone-400 font-bold">₹</span>
                              <input
                                type="number"
                                min="0"
                                value={editCityCost}
                                onChange={(e) => setEditCityCost(e.target.value)}
                                className="pl-6 pr-2 py-1 border border-[#6D021B] rounded-none bg-white text-xs font-bold text-[#6D021B] w-full focus:outline-none"
                              />
                            </div>
                          ) : (
                            <span className="font-bold text-[#6D021B] bg-[#FAF7F2] px-2 py-0.5 border border-[#EDE4D8]">
                              ₹{city.cost}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {editingCityId === city.id ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSaveEditCity(city.id)}
                                className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-none cursor-pointer"
                                title="Save"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCityId(null)}
                                className="p-1 text-stone-400 hover:bg-stone-100 rounded-none cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCityId(city.id)
                                  setEditCityName(city.name)
                                  setEditCityCost(city.cost)
                                }}
                                className="p-1 text-stone-500 hover:text-[#6D021B] hover:bg-stone-100 rounded-none cursor-pointer transition-colors"
                                title="Edit rate"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeCity(city.id)}
                                className="p-1 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-none cursor-pointer transition-colors"
                                title="Delete city"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Admin Security: OTP Login (No Password) */}
        <div className="bg-white border border-[#EDE4D8] rounded-none-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE4D8]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#6D021B]" />
              <h2 className=" text-base font-bold text-[#1F1713]">
                Admin Email
              </h2>
            </div>

          </div>

          <p className="text-xs text-[#73655B] leading-relaxed">
            Admin access is secured strictly via one-time passwords (OTP) sent to your verified registered email.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">


            <div>
              <label className="block font-bold text-stone-700 mb-1">Admin Email (for Email OTP)</label>
              <input
                type="email"
                value={settings.adminEmail}
                onChange={(e) => handleChange('adminEmail', e.target.value)}
                className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B]"
              />
            </div>
          </div>
        </div>

        {/* 5. Product Returns Management (ON / OFF Switch) */}
        {/* <div className="bg-white border border-[#EDE4D8] rounded-none-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE4D8]">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#6D021B]" />
              <h2 className="text-base font-bold text-[#1F1713]">
                Product Returns ON / OFF Control
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleChange('returnPolicyEnabled', !settings.returnPolicyEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  settings.returnPolicyEnabled ? 'bg-emerald-600' : 'bg-stone-300'
                }`}
                role="switch"
                aria-checked={settings.returnPolicyEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    settings.returnPolicyEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 ${
                  settings.returnPolicyEnabled
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-stone-500 bg-stone-200'
                }`}
              >
                {settings.returnPolicyEnabled ? 'Returns ON' : 'Returns OFF'}
              </span>
            </div>
          </div>

          <p className="text-xs text-[#73655B] leading-relaxed">
            When Returns are <strong>OFF</strong>, the return policy badge and return request options will not be shown on any products or customer orders. When switched <strong>ON</strong>, all products will display return options according to the window days below.
          </p>

          {settings.returnPolicyEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Return Window (Days)
                </label>
                <div className="flex items-center border border-[#EDE4D8] bg-[#FAF7F2] px-3 py-2">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={settings.returnWindowDays}
                    onChange={(e) => handleChange('returnWindowDays', e.target.value)}
                    className="w-20 bg-transparent font-bold text-xs text-[#1F1713] focus:outline-hidden"
                  />
                  <span className="text-xs font-semibold text-stone-500 ml-2">Days after delivery</span>
                </div>
              </div>
            </div>
          )}
        </div> */}

        {/* 6. Global GST Control (ON / OFF Switch & Percentage) */}
        <div className="bg-white border border-[#EDE4D8] rounded-none-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EDE4D8]">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#6D021B]" />
              <h2 className="text-base font-bold text-[#1F1713]">
                GST Control
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleChange('gstEnabled', !settings.gstEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${settings.gstEnabled ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                role="switch"
                aria-checked={settings.gstEnabled}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${settings.gstEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 ${settings.gstEnabled
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-stone-500 bg-stone-200'
                  }`}
              >
                {settings.gstEnabled ? 'GST ON' : 'GST OFF'}
              </span>
            </div>
          </div>



          {settings.gstEnabled && (
            <div className="pt-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 text-xs mb-1">
                  GSTIN / Tax Number (Printed on Invoices)
                </label>
                <input
                  type="text"
                  value={settings.gstNumber}
                  onChange={(e) => handleChange('gstNumber', e.target.value.toUpperCase())}
                  placeholder="e.g. 33AAAAA0000A1Z5"
                  maxLength={15}
                  className="w-full px-3 py-2 border border-[#EDE4D8] uppercase tracking-wider font-mono text-xs focus:outline-none focus:border-[#6D021B]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 text-xs mb-1">
                  GST Tax Percentage (%)
                </label>
                <div className="inline-flex items-center border border-[#EDE4D8] bg-[#FAF7F2] px-2.5 py-1.5 w-full">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={settings.gstPercentage}
                    onChange={(e) => handleChange('gstPercentage', e.target.value)}
                    placeholder="e.g. 5"
                    className="w-20 bg-transparent font-bold text-xs text-[#1F1713] focus:outline-hidden"
                  />
                  <span className="text-xs font-semibold text-stone-500 ml-1">%</span>
                </div>
              </div>
            </div>
          )}
        </div>



        {/* Save Changes Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-[#6D021B] text-white rounded-none-xl text-xs font-semibold shadow-xs hover:bg-[#580115] transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#DEA53B]" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  )
}

