import { useState } from 'react'
import { Plus, X, Image as ImageIcon, ExternalLink, Upload } from 'lucide-react'
import {
  AdminEditButton,
  AdminDeleteButton,
  AdminSaveButton,
  AdminCancelButton,
} from '../../components/admin/AdminUI'

// Import existing hero banners from assets
import desktopFestival from '../../assets/banners/desktop-festival-banner.jpg'
import desktopWedding from '../../assets/banners/desktop-wedding-banner.jpg'
import desktopTravel from '../../assets/banners/desktop-travel-banner.jpg'

export default function AdminBanners() {
  const [banners, setBanners] = useState([
    {
      id: 1,
      image: desktopFestival,
      buttonText: 'Shop Festival Edit',
      buttonUrl: '/collections?category=Banarasi',
      active: true,
      order: 1,
    },
    {
      id: 2,
      image: desktopWedding,
      buttonText: 'Explore Wedding Silk',
      buttonUrl: '/collections?category=Kanjivaram',
      active: true,
      order: 2,
    },
    {
      id: 3,
      image: desktopTravel,
      buttonText: 'View Collections',
      buttonUrl: '/collections',
      active: true,
      order: 3,
    },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [formData, setFormData] = useState({
    image: '',
    buttonText: '',
    buttonUrl: '',
  })
  const [errors, setErrors] = useState({})

  const handleOpenAdd = () => {
    setEditingBanner(null)
    setErrors({})
    setFormData({
      image: '',
      buttonText: '',
      buttonUrl: '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (b) => {
    setEditingBanner(b)
    setErrors({})
    setFormData({
      image: b.image || '',
      buttonText: b.buttonText || '',
      buttonUrl: b.buttonUrl || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this banner from homepage slider?')) {
      setBanners((prev) => prev.filter((b) => b.id !== id))
    }
  }

  const toggleActive = (id) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    )
  }

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }))
        if (errors.image) setErrors((prev) => ({ ...prev, image: null }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!formData.image) newErrors.image = 'Banner image is required'
    if (!formData.buttonText?.trim()) newErrors.buttonText = 'Button text name is required'
    if (!formData.buttonUrl?.trim()) newErrors.buttonUrl = 'Button URL link is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})

    if (editingBanner) {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === editingBanner.id
            ? { ...b, ...formData }
            : b
        )
      )
    } else {
      setBanners((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...formData,
          active: true,
          order: prev.length + 1,
        },
      ])
    }
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* ─── Page Title ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-normal text-2xl sm:text-3xl font-bold text-[#1F1713]">
            Homepage Sliders & Banners
          </h1>

        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#6D021B] text-white rounded-none-xl text-xs font-semibold shadow-xs hover:bg-[#580115] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#DEA53B]" />
          <span>Add Hero Banner</span>
        </button>
      </div>

      {/* ─── Banners List ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white border border-[#EDE4D8] rounded-none-2xl overflow-hidden shadow-2xs flex flex-col justify-between"
          >
            <div>
              {/* Banner Image Preview */}
              <div className="relative aspect-video w-full bg-stone-100 overflow-hidden border-b border-[#EDE4D8]">
                {banner.image ? (
                  <img
                    src={banner.image}
                    alt={banner.buttonText || 'Banner'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => toggleActive(banner.id)}
                  className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-none-full text-[10px] font-bold shadow-xs cursor-pointer ${banner.active
                      ? 'bg-emerald-600 text-white'
                      : 'bg-black/60 text-white backdrop-blur-xs'
                    }`}
                >
                  {banner.active ? 'Active' : 'Disabled'}
                </button>
              </div>

              {/* Banner Details */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#DEA53B] uppercase tracking-wider">
                    Slide #{banner.order}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Button Text Name
                  </label>
                  <p className="font-normal text-sm font-bold text-[#1F1713] mt-0.5">
                    {banner.buttonText || 'No Button Text'}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    Button URL Link
                  </label>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-[#6D021B] font-semibold bg-[#FAF7F2] px-2.5 py-1.5 rounded-none-lg border border-[#EDE4D8] break-all">
                    <ExternalLink className="w-3.5 h-3.5 text-[#DEA53B] shrink-0" />
                    <span>{banner.buttonUrl || 'No Link Set'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-[#EDE4D8] flex items-center justify-end gap-2">
              <AdminEditButton onClick={() => handleOpenEdit(banner)}>
                Edit
              </AdminEditButton>
              <AdminDeleteButton onClick={() => handleDelete(banner.id)}>
                Remove
              </AdminDeleteButton>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Add / Edit Banner Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-none-2xl border border-[#EDE4D8] w-full max-w-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EDE4D8] flex items-center justify-between">
              <h2 className="font-normal text-base font-bold text-[#1F1713]">
                {editingBanner ? 'Edit Banner' : 'Create New Hero Banner'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-none-lg hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              {/* 1. Image Upload & Preview */}
              <div className="space-y-2">
                <label className="block font-bold text-stone-700">
                  Banner Image <span className="text-red-500">*</span>
                </label>

                <div className="flex flex-col gap-3">
                  <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-dashed border-[#DEA53B] hover:border-[#6D021B] rounded-none-xl bg-[#FAF7F2] hover:bg-[#FFFDF9] text-[#6D021B] cursor-pointer transition-all shadow-2xs">
                    <Upload className="w-4 h-4 text-[#DEA53B]" />
                    <span className="font-bold text-xs">
                      {formData.image ? 'Change Banner Image' : 'Upload Banner Image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* Uploaded Image Preview */}
                  {formData.image && (
                    <div className="relative aspect-video w-full rounded-none-xl border border-[#EDE4D8] overflow-hidden group shadow-sm bg-stone-100">
                      <img
                        src={formData.image}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                        title="Remove image"
                        className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-none-full flex items-center justify-center text-xs opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                {errors.image && (
                  <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                    ⚠ {errors.image}
                  </p>
                )}
              </div>

              {/* 2. Button Text Name */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Button Text Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.buttonText}
                  onChange={(e) => {
                    setFormData({ ...formData, buttonText: e.target.value })
                    if (errors.buttonText) setErrors((prev) => ({ ...prev, buttonText: null }))
                  }}
                  placeholder="e.g. Shop Festive Edit"
                  className={`w-full px-3 py-2 border rounded-none-xl focus:outline-none bg-white font-medium transition-colors ${errors.buttonText ? 'border-red-500 ring-2 ring-red-100 bg-red-50/20' : 'border-[#EDE4D8] focus:border-[#6D021B]'
                    }`}
                />
                {errors.buttonText && (
                  <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                    ⚠ {errors.buttonText}
                  </p>
                )}
              </div>

              {/* 3. Button URL Link */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Button URL Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.buttonUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, buttonUrl: e.target.value })
                    if (errors.buttonUrl) setErrors((prev) => ({ ...prev, buttonUrl: null }))
                  }}
                  placeholder="e.g. /collections?category=Banarasi"
                  className={`w-full px-3 py-2 border rounded-none-xl focus:outline-none bg-white font-medium transition-colors ${errors.buttonUrl ? 'border-red-500 ring-2 ring-red-100 bg-red-50/20' : 'border-[#EDE4D8] focus:border-[#6D021B]'
                    }`}
                />
                {errors.buttonUrl && (
                  <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                    ⚠ {errors.buttonUrl}
                  </p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-[#EDE4D8] flex items-center justify-end gap-2">
                <AdminCancelButton onClick={() => setIsModalOpen(false)} />
                <AdminSaveButton type="submit">
                  {editingBanner ? 'Update Banner' : 'Save Banner'}
                </AdminSaveButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

