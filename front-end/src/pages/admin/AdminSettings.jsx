import { useState } from 'react'
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
} from 'lucide-react'
import { useShipping } from '../../context/ShippingContext'
import { AdminDeleteButton, AdminSaveButton } from '../../components/admin/AdminUI'

export default function AdminSettings() {
  const [saved, setSaved] = useState(false)
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

  const [settings, setSettings] = useState({
    // Store Identity
    storeName: 'Vastraa - The House of Sarees',
    contactEmail: 'vastraa@gmail.com',
    supportPhone: '+91 9807738888',
    atelierAddress: 'Plot No 1, 3rd Street, Tambaram, Urapakkam, Chennai - 603 210',
    googleMapsUrl: 'https://maps.google.com/?q=Tambaram+Urapakkam+Chennai',

    // Social Media Links
    instagram: 'https://instagram.com/vastraasarees',
    facebook: 'https://facebook.com/vastraasarees',
    twitter: 'https://x.com/vastraasarees',
    youtube: 'https://youtube.com/@vastraasarees',

    // Shipping & Delivery general info
    estimatedDays: '3 to 5 business days',

    // Admin Auth (OTP Only)
    adminPhone: '+91 9807738888',
    adminEmail: 'admin@vastraa.com',
    authMethod: 'OTP Only (SMS & Email)',
  })

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

  const handleSave = (e) => {
    e.preventDefault()
    // Save weight settings to shipping context
    updateWeightSettings({
      initialWeightKg: Number(weightForm.initialWeightKg) || 1,
      initialWeightCost: Number(weightForm.initialWeightCost) || 0,
      incrementGrams: Number(weightForm.incrementGrams) || 200,
      incrementCost: Number(weightForm.incrementCost) || 0,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
        {/* 1. Store Identity & Atelier Address */}
        <div className="bg-white border border-[#EDE4D8] rounded-none-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EDE4D8]">
            <Building className="w-4 h-4 text-[#6D021B]" />
            <h2 className=" text-base font-bold text-[#1F1713]">
              Contact Information
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
              <label className="block font-bold text-stone-700 mb-1">Physical Atelier Address</label>
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
                    className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-none focus:outline-none focus:bg-white text-xs ${
                      cityError || isCityAlreadyExist(newCityName)
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
                      `City "${newCityName.trim()}" is already in your delivery list (fee: ₹${
                        shippingSettings.cityBased.cities.find(
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
                                className={`px-2 py-1 border rounded-none bg-white text-xs w-full max-w-xs focus:outline-none ${
                                  isCityAlreadyExist(editCityName, city.id) || editCityError
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

