import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AccountSidebar from '../../components/AccountSidebar'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import notify from '../../utils/toast'

export default function Profile() {
  const { customer, token, isAuthenticated, refreshCustomer } = useCustomerAuth()
  const navigate = useNavigate()

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
  })
  const [saving, setSaving] = useState(false)
  const [savedNotification, setSavedNotification] = useState(false)

  // Redirect to /login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/profile' }, replace: true })
    }
  }, [isAuthenticated, navigate])

  // Populate data from customer object
  useEffect(() => {
    if (customer) {
      setProfileData({
        fullName: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
      })
    }
  }, [customer])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const res = await fetch(`${API_BASE}/customers/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileData.fullName,
          phone: profileData.phone,
        }),
      })
      const result = await res.json()
      if (result.success) {
        setSavedNotification(true)
        notify.success('Profile saved successfully!')
        if (refreshCustomer) refreshCustomer()
        setTimeout(() => setSavedNotification(false), 3000)
      } else {
        notify.error(result.message || 'Failed to update profile')
      }
    } catch (err) {
      notify.error(err.message || 'Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full bg-[#FAF7F2] min-h-[calc(100vh-140px)] pt-[78px] xs:pt-[82px] sm:pt-[90px] md:pt-[140px] lg:pt-[148px] pb-12 sm:pb-16 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* ─── GRID CONTAINER: Side-by-side from md (768px) and above ─── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-6 lg:gap-8 items-start">

          {/* ─── REUSABLE ACCOUNT SIDEBAR (Mobile button & Desktop Sidebar) ─── */}
          <AccountSidebar active="profile" />

          {/* ─── RIGHT MAIN CONTENT: Edit Profile Form ─── */}
          <div className="w-full md:col-span-8 lg:col-span-8 bg-white rounded-none-2xl sm:rounded-none-3xl border border-[#EDE4D8] p-6 sm:p-8 shadow-sm">
            <div className="border-b border-[#F0E8DC]">
              <h1 className="font-normal text-xl sm:text-2xl font-bold text-[#1F1713]">
                Edit Profile
              </h1>

            </div>

            {savedNotification && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-none-xl flex items-center gap-2 animate-fade-in">
                <span>✓</span>
                <span>Profile changes have been saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Row 1: Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#1F1713] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#FAF7F2] border border-[#E3D7C7] rounded-none-xl px-4 py-3 text-xs sm:text-sm text-[#1F1713] focus:bg-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#1F1713] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    disabled
                    readOnly
                    className="w-full bg-[#F5EFE6] border border-[#E3D7C7] rounded-none-xl px-4 py-3 text-xs sm:text-sm text-[#73655B] cursor-not-allowed opacity-80"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Email is verified with your account</p>
                </div>
              </div>

              {/* Row 2: Phone & Date of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-[#1F1713] mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#FAF7F2] border border-[#E3D7C7] rounded-none-xl px-4 py-3 text-xs sm:text-sm text-[#1F1713] focus:bg-white focus:outline-none focus:border-primary transition-all"
                  />
                </div>


              </div>


              {/* Submit Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary hover:bg-primary-dark text-white font-medium text-xs sm:text-sm px-8 py-3.5 rounded-none-full transition-all duration-200 shadow-md hover:shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}

