import { useState, useMemo } from 'react'
import {
  Sparkles,
  Layers,
  Image as ImageIcon,
  Check,
  Plus,
  Trash2,
  Edit2,
  Eye,
  ArrowRight,
  Upload,
  Link as LinkIcon,
  Search,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  Grid,
  Palette,
  ExternalLink,
  Smartphone,
  Laptop,
} from 'lucide-react'
import { useHomeCMS } from '../../context/HomeCMSContext'
import { allProductsList } from '../user/collections'
import { AdminSaveButton, AdminCancelButton } from '../../components/admin/AdminUI'

export default function AdminHomeCMS() {
  const {
    cmsData,
    updateHeroBanners,
    addHeroBanner,
    updateSingleHeroBanner,
    removeHeroBanner,
    updateStyleDirection,
    updateShopByCategory,
    updateNewArrivals,
    addCategoryShowcase,
    updateCategoryShowcase,
    removeCategoryShowcase,
  } = useHomeCMS()

  const [activeTab, setActiveTab] = useState('banners') // 'banners' | 'moods' | 'categories' | 'arrivals' | 'showcase'
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('')

  // -------------------------------------------------------------
  // TAB 0: Hero Banners State
  // -------------------------------------------------------------
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [bannerFormData, setBannerFormData] = useState({
    image: '',
    mobileImage: '',
    title: '',
    buttonText: 'SHOP NOW',
    buttonLink: '/collections',
  })
  const [bannerErrors, setBannerErrors] = useState({})

  const handleOpenAddBanner = () => {
    setEditingBanner(null)
    setBannerErrors({})
    setBannerFormData({
      image: '',
      mobileImage: '',
      title: '',
      buttonText: 'SHOP NOW',
      buttonLink: '/collections',
    })
    setIsBannerModalOpen(true)
  }

  const handleOpenEditBanner = (b) => {
    setEditingBanner(b)
    setBannerErrors({})
    setBannerFormData({
      image: b.image || '',
      mobileImage: b.mobileImage || '',
      title: b.title || '',
      buttonText: b.buttonText || 'SHOP NOW',
      buttonLink: b.buttonLink || '/collections',
    })
    setIsBannerModalOpen(true)
  }

  const handleDeleteBanner = (id) => {
    if ((cmsData.heroBanners || []).length <= 1) {
      alert('You must keep at least 1 banner for the hero slider.')
      return
    }
    if (window.confirm('Delete this banner from the hero slider?')) {
      removeHeroBanner(id)
      showSaved('Banner removed successfully!')
    }
  }

  const handleToggleBannerActive = (id) => {
    const banner = (cmsData.heroBanners || []).find((b) => b.id === id)
    if (banner) {
      updateSingleHeroBanner(id, { active: !banner.active })
      showSaved(`Banner ${!banner.active ? 'activated' : 'deactivated'}!`)
    }
  }

  const handleBannerImageUpload = (field, e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerFormData((prev) => ({ ...prev, [field]: reader.result }))
        if (bannerErrors[field]) {
          setBannerErrors((prev) => ({ ...prev, [field]: null }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveBannerModal = (e) => {
    e.preventDefault()
    const errs = {}
    if (!bannerFormData.image) errs.image = 'Desktop banner image is required'
    if (!bannerFormData.buttonText?.trim()) errs.buttonText = 'Button text is required'
    if (!bannerFormData.buttonLink?.trim()) errs.buttonLink = 'Target link is required'

    if (Object.keys(errs).length > 0) {
      setBannerErrors(errs)
      return
    }

    if (editingBanner) {
      updateSingleHeroBanner(editingBanner.id, {
        ...bannerFormData,
      })
      showSaved('Banner updated successfully!')
    } else {
      addHeroBanner(bannerFormData)
      showSaved('New banner added to homepage slider!')
    }
    setIsBannerModalOpen(false)
  }

  // -------------------------------------------------------------
  // TAB 1: Fashion For Every Mood State
  // -------------------------------------------------------------
  const [styleDirectionForm, setStyleDirectionForm] = useState(() => ({
    title: cmsData.styleDirection.title,
    highlightTitle: cmsData.styleDirection.highlightTitle,
    description: cmsData.styleDirection.description,
    buttonText: cmsData.styleDirection.buttonText,
    buttonUrl: cmsData.styleDirection.buttonUrl,
    backgroundImage: cmsData.styleDirection.backgroundImage,
    moods: JSON.parse(JSON.stringify(cmsData.styleDirection.moods || [])),
  }))

  const [styleErrors, setStyleErrors] = useState({})

  // Background image file upload
  const handleBgImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setStyleDirectionForm((prev) => ({ ...prev, backgroundImage: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Mood card image upload
  const handleMoodCardImageUpload = (index, e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const updated = [...styleDirectionForm.moods]
        updated[index] = { ...updated[index], image: reader.result }
        setStyleDirectionForm((prev) => ({ ...prev, moods: updated }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Update specific mood card fields
  const handleMoodCardChange = (index, field, value) => {
    const updated = [...styleDirectionForm.moods]
    updated[index] = { ...updated[index], [field]: value }
    setStyleDirectionForm((prev) => ({ ...prev, moods: updated }))
  }

  // Save Style Direction
  const handleSaveStyleDirection = (e) => {
    e.preventDefault()
    const errs = {}
    if (!styleDirectionForm.title.trim()) errs.title = 'Title cannot be blank'
    if (!styleDirectionForm.description.trim()) errs.description = 'Description cannot be blank'

    styleDirectionForm.moods.forEach((m, idx) => {
      if (!m.title.trim()) errs[`mood_${idx}_title`] = 'Mood title required'
      if (!m.subtitle.trim()) errs[`mood_${idx}_subtitle`] = 'Mood tagline required'
      if (!m.url.trim()) errs[`mood_${idx}_url`] = 'Target link required'
    })

    if (Object.keys(errs).length > 0) {
      setStyleErrors(errs)
      return
    }

    setStyleErrors({})
    updateStyleDirection(styleDirectionForm)
    showSaved('Fashion For Every Mood updated successfully!')
  }

  // -------------------------------------------------------------
  // TAB 2: Shop By Category (Max 6 Categories) State
  // -------------------------------------------------------------
  const [categoryForm, setCategoryForm] = useState(() => ({
    title: cmsData.shopByCategory.title,
    highlightTitle: cmsData.shopByCategory.highlightTitle,
    description: cmsData.shopByCategory.description,
    selectedCategories: JSON.parse(JSON.stringify(cmsData.shopByCategory.selectedCategories || [])),
  }))

  const [categoryPickerSlotIndex, setCategoryPickerSlotIndex] = useState(null)

  // Dynamic category options combining all categories created in admin + present in catalog
  const categoryDropdownOptions = useMemo(() => {
    let savedCategories = []
    try {
      const saved = localStorage.getItem('vastraa_admin_categories')
      if (saved) savedCategories = JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }

    const fromProducts = allProductsList.map((p) => p.category)
    const baseDefaults = [
      'Banarasi',
      'Kanjivaram',
      'Bridal',
      'Handloom',
      'Organza',
      'Chanderi',
      'Chiffon',
      'Bandhani',
      'Paithani',
    ]

    // Unique combination of all categories
    const combined = Array.from(
      new Set([...savedCategories, ...fromProducts, ...baseDefaults].filter(Boolean))
    )
    return combined
  }, [])

  // When admin selects a category from dropdown, update categoryName, auto-set href, and auto-pick the first product's photo
  const handleSelectCategoryDropdown = (index, chosenCategory) => {
    const matchingProducts = allProductsList.filter(
      (p) => p.category.toLowerCase() === chosenCategory.toLowerCase()
    )
    const featuredProduct = matchingProducts[0]

    const updated = [...categoryForm.selectedCategories]
    updated[index] = {
      ...updated[index],
      categoryName: chosenCategory,
      title: `${chosenCategory} Sarees`,
      itemCount: `${matchingProducts.length > 0 ? matchingProducts.length * 15 + 40 : 60} Items`,
      image: featuredProduct ? featuredProduct.image : updated[index].image,
      featuredProductId: featuredProduct ? featuredProduct.id : null,
      href: `/collections?category=${encodeURIComponent(chosenCategory)}`,
    }
    setCategoryForm((prev) => ({ ...prev, selectedCategories: updated }))
  }

  // When admin chooses a specific product inside the category product picker modal
  const handlePickProductForCategorySlot = (slotIndex, product) => {
    const updated = [...categoryForm.selectedCategories]
    updated[slotIndex] = {
      ...updated[slotIndex],
      image: product.image,
      featuredProductId: product.id,
      itemTitle: product.title,
    }
    setCategoryForm((prev) => ({ ...prev, selectedCategories: updated }))
    setCategoryPickerSlotIndex(null)
  }

  const handleUpdateCategoryCard = (index, field, value) => {
    const updated = [...categoryForm.selectedCategories]
    updated[index] = { ...updated[index], [field]: value }
    setCategoryForm((prev) => ({ ...prev, selectedCategories: updated }))
  }

  const handleAddCategorySlot = () => {
    if (categoryForm.selectedCategories.length >= 6) {
      alert('Maximum 6 categories can be displayed in Shop by Category.')
      return
    }
    const defaultCat = 'Banarasi'
    const matchingProducts = allProductsList.filter(
      (p) => p.category.toLowerCase() === defaultCat.toLowerCase()
    )
    const featuredProduct = matchingProducts[0]

    const defaultNew = {
      id: Date.now(),
      title: `${defaultCat} Sarees`,
      categoryName: defaultCat,
      itemCount: '80 Items',
      image: featuredProduct ? featuredProduct.image : allProductsList[0]?.image || '',
      featuredProductId: featuredProduct ? featuredProduct.id : null,
      href: `/collections?category=${encodeURIComponent(defaultCat)}`,
    }
    setCategoryForm((prev) => ({
      ...prev,
      selectedCategories: [...prev.selectedCategories, defaultNew],
    }))
  }

  const handleRemoveCategorySlot = (index) => {
    if (categoryForm.selectedCategories.length <= 1) {
      alert('You must have at least one category card.')
      return
    }
    setCategoryForm((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.filter((_, idx) => idx !== index),
    }))
  }

  const handleSaveShopByCategory = (e) => {
    e.preventDefault()
    updateShopByCategory(categoryForm)
    showSaved('Shop By Category updated successfully!')
  }

  // -------------------------------------------------------------
  // TAB 3: New Arrivals (Max 4 Products) State
  // -------------------------------------------------------------
  const [arrivalsForm, setArrivalsForm] = useState(() => ({
    title: cmsData.newArrivals.title,
    highlightTitle: cmsData.newArrivals.highlightTitle,
    description: cmsData.newArrivals.description,
    productIds: [...(cmsData.newArrivals.productIds || [1, 2, 3, 4])],
  }))

  const [isArrivalProductPickerOpen, setIsArrivalProductPickerOpen] = useState(false)
  const [productSearchTerm, setProductSearchTerm] = useState('')

  const handleToggleArrivalProduct = (productId) => {
    const exists = arrivalsForm.productIds.includes(productId)
    if (exists) {
      if (arrivalsForm.productIds.length <= 1) {
        alert('You must keep at least 1 product selected for New Arrivals.')
        return
      }
      const nextProductIds = arrivalsForm.productIds.filter((id) => id !== productId)
      const updated = { ...arrivalsForm, productIds: nextProductIds }
      setArrivalsForm(updated)
      updateNewArrivals(updated)
      showSaved('New Arrivals updated automatically!')
      return
    }

    if (arrivalsForm.productIds.length >= 4) {
      alert('Maximum 4 products allowed in the New Arrivals section.')
      return
    }

    const nextProductIds = [...arrivalsForm.productIds, productId]
    const updated = { ...arrivalsForm, productIds: nextProductIds }
    setArrivalsForm(updated)
    updateNewArrivals(updated)
    showSaved('New Arrivals updated automatically!')
  }

  const handleArrivalsFieldChange = (field, value) => {
    const updated = { ...arrivalsForm, [field]: value }
    setArrivalsForm(updated)
    updateNewArrivals(updated)
  }

  const handleSaveNewArrivals = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    updateNewArrivals(arrivalsForm)
    showSaved('New Arrivals section updated successfully!')
  }

  // -------------------------------------------------------------
  // TAB 4: Category Showcases (Max 4 Products each)
  // -------------------------------------------------------------
  const [showcaseCategorySelect, setShowcaseCategorySelect] = useState('Kanjivaram')
  const [pickerShowcaseId, setPickerShowcaseId] = useState(null)

  const handleCreateNewShowcase = () => {
    const existing = cmsData.categoryShowcases.find(
      (cs) => cs.categoryName.toLowerCase() === showcaseCategorySelect.toLowerCase()
    )
    if (existing) {
      alert(`A showcase section for "${existing.categoryName}" already exists!`)
      return
    }
    addCategoryShowcase(showcaseCategorySelect)
    showSaved(`Added new section for ${showcaseCategorySelect}!`)
  }

  const handleToggleShowcaseProduct = (showcaseId, productId) => {
    const targetShowcase = cmsData.categoryShowcases.find((cs) => cs.id === showcaseId)
    if (!targetShowcase) return

    const exists = targetShowcase.productIds.includes(productId)
    if (exists) {
      updateCategoryShowcase(showcaseId, {
        productIds: targetShowcase.productIds.filter((id) => id !== productId),
      })
    } else {
      if (targetShowcase.productIds.length >= 4) {
        alert('Maximum 4 products can be chosen for this category showcase section.')
        return
      }
      updateCategoryShowcase(showcaseId, {
        productIds: [...targetShowcase.productIds, productId],
      })
    }
  }

  const showSaved = (msg) => {
    setSaveSuccessMsg(msg)
    setTimeout(() => setSaveSuccessMsg(''), 3000)
  }

  // Helper to fetch full product objects from ID
  const getProductById = (id) => allProductsList.find((p) => p.id === id)

  return (
    <div className="space-y-6 max-w-6xl pb-20">
      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal text-[#1F1713]">
            Home CMS Management
          </h1>
   
        </div>

        {saveSuccessMsg && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-none animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div className="flex items-center gap-2 border-b border-[#EDE4D8] overflow-x-auto scrollbar-none pb-0 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('banners')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'banners'
              ? 'border-[#6D021B] text-[#6D021B] bg-white font-bold'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>Hero Banners</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('moods')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'moods'
              ? 'border-[#6D021B] text-[#6D021B] bg-white font-bold'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>Fashion For Every Mood </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'categories'
              ? 'border-[#6D021B] text-[#6D021B] bg-white font-bold'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >

          <span>Shop by Category </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('arrivals')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'arrivals'
              ? 'border-[#6D021B] text-[#6D021B] bg-white font-bold'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >

          <span>New Arrivals</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('showcase')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'showcase'
              ? 'border-[#6D021B] text-[#6D021B] bg-white font-bold'
              : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>Category Showcases </span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 0. TAB: HERO BANNERS (Homepage Slider)                        */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#EDE4D8] p-5 sm:p-6 shadow-2xs space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#EDE4D8]">
              <div>
                <h2 className="text-base font-bold text-[#1F1713]">
                  Hero Banner Slider ({(cmsData.heroBanners || []).length} active/configured)
                </h2>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Manage the full-width rotating hero slider displayed at the very top of your homepage.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddBanner}
                className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-none cursor-pointer flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Add New Banner</span>
              </button>
            </div>

            {/* Banners Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(cmsData.heroBanners || []).map((banner, index) => (
                <div
                  key={banner.id}
                  className="bg-[#FAF7F2] border border-[#EDE4D8] rounded-none overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Banner Image Preview */}
                    <div className="relative aspect-[16/9] w-full bg-stone-100 overflow-hidden border-b border-[#EDE4D8]">
                      {banner.image ? (
                        <img
                          src={banner.image}
                          alt={banner.buttonText || 'Hero Banner'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleBannerActive(banner.id)}
                        className={`absolute top-2 right-2 px-2.5 py-0.5 text-[10px] font-bold shadow-xs cursor-pointer rounded-none ${
                          banner.active !== false
                            ? 'bg-emerald-600 text-white'
                            : 'bg-black/60 text-white backdrop-blur-xs'
                        }`}
                      >
                        {banner.active !== false ? 'Active' : 'Disabled'}
                      </button>

                      <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-none">
                        Slide #{index + 1}
                      </span>
                    </div>

                    {/* Banner Info */}
                    <div className="p-4 space-y-2">
                      {banner.title && (
                        <div>
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                            Title / Caption
                          </label>
                          <p className="text-xs font-bold text-stone-900 truncate mt-0.5">
                            {banner.title}
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                          Button Text
                        </label>
                        <p className="text-xs font-bold text-[#6D021B] mt-0.5">
                          {banner.buttonText || 'SHOP NOW'}
                        </p>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                          Target URL Link
                        </label>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-700 bg-white px-2.5 py-1.5 border border-[#EDE4D8] truncate">
                          <ExternalLink className="w-3.5 h-3.5 text-[#6D021B] shrink-0" />
                          <span className="truncate">{banner.buttonLink || '/collections'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3 border-t border-[#EDE4D8] bg-white flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditBanner(banner)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold cursor-pointer rounded-none transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold cursor-pointer rounded-none transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 1. TAB: FASHION FOR EVERY MOOD (3 Cards + BG Image + URLs)   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'moods' && (
        <div className="space-y-6">
          {/* Form Card */}
          <form onSubmit={handleSaveStyleDirection} className="bg-white border border-[#EDE4D8] p-5 sm:p-6 shadow-2xs space-y-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE4D8]">
              <div>
              
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-none cursor-pointer flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Check className="w-4 h-4 text-white" />
                <span>Save</span>
              </button>
            </div>

            {/* A. Background Image Upload & Text Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: Background Image Picker */}
              <div className="lg:col-span-5 space-y-3">
                <label className="block font-bold text-stone-800">
                  Full-Width Banner Background Image
                </label>
                <div className="relative aspect-[16/9] border border-stone-200 bg-stone-900 overflow-hidden flex items-center justify-center group">
                  {styleDirectionForm.backgroundImage ? (
                    <img
                      src={styleDirectionForm.backgroundImage}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-stone-400 text-center p-4">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span>No background image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-stone-900 font-bold px-3 py-1.5 text-xs rounded-none flex items-center gap-1 shadow-md">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Change Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBgImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

               
              </div>

              {/* Right Column: Left Banner Content */}
              <div className="lg:col-span-7 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Main Title
                    </label>
                    <input
                      type="text"
                      value={styleDirectionForm.title}
                      onChange={(e) =>
                        setStyleDirectionForm({ ...styleDirectionForm, title: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Italic Highlight Title
                    </label>
                    <input
                      type="text"
                      value={styleDirectionForm.highlightTitle}
                      onChange={(e) =>
                        setStyleDirectionForm({ ...styleDirectionForm, highlightTitle: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none focus:outline-none focus:bg-white font-serif italic text-[#DEA53B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Description Text
                  </label>
                  <textarea
                    rows={2}
                    value={styleDirectionForm.description}
                    onChange={(e) =>
                      setStyleDirectionForm({ ...styleDirectionForm, description: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={styleDirectionForm.buttonText}
                      onChange={(e) =>
                        setStyleDirectionForm({ ...styleDirectionForm, buttonText: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Button Target URL
                    </label>
                    <input
                      type="text"
                      value={styleDirectionForm.buttonUrl}
                      onChange={(e) =>
                        setStyleDirectionForm({ ...styleDirectionForm, buttonUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* B. Exactly 3 Mood Cards Editor */}
            <div className="pt-4 border-t border-[#EDE4D8] space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 text-sm">
                  3 Curated Mood / Occasion Cards
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  Configured: {styleDirectionForm.moods.length} / 3 cards
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {styleDirectionForm.moods.map((mood, idx) => (
                  <div key={mood.id || idx} className="bg-[#FAF7F2] p-4 border border-[#EDE4D8] rounded-none space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-[#6D021B] text-[11px]">
                        Card #{idx + 1}
                      </span>
                      <span className="text-[10px] text-stone-400 uppercase font-mono">
                        Slot {idx + 1}
                      </span>
                    </div>

                    {/* Mood Card Image Preview & Upload */}
                    <div className="relative aspect-[3/4] bg-stone-900 overflow-hidden border border-stone-200 group">
                      <img
                        src={mood.image}
                        alt={mood.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                        <label className="cursor-pointer bg-white text-stone-900 font-bold px-3 py-1 text-xs rounded-none flex items-center gap-1 shadow">
                          <Upload className="w-3 h-3" />
                          <span>Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleMoodCardImageUpload(idx, e)}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                  

                    {/* Card Title */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                        Card Title (e.g. CASUAL, FORMAL, PARTY)
                      </label>
                      <input
                        type="text"
                        value={mood.title}
                        onChange={(e) => handleMoodCardChange(idx, 'title', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EDE4D8] rounded-none text-xs font-bold uppercase focus:outline-none"
                      />
                    </div>

                    {/* Card Subtitle */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-0.5">
                        Tagline / Subtitle
                      </label>
                      <input
                        type="text"
                        value={mood.subtitle}
                        onChange={(e) => handleMoodCardChange(idx, 'subtitle', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EDE4D8] rounded-none text-xs focus:outline-none"
                      />
                    </div>

                    {/* Card Target URL */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-0.5 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3 text-[#6D021B]" />
                        <span>Card Target URL</span>
                      </label>
                      <input
                        type="text"
                        value={mood.url}
                        onChange={(e) => handleMoodCardChange(idx, 'url', e.target.value)}
                        placeholder="/collections?category=..."
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EDE4D8] rounded-none text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* ─── LIVE INTERACTIVE PREVIEW FOR MOODS ─── */}
          <div className="bg-white border border-[#EDE4D8] p-5 sm:p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EDE4D8]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#6D021B]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
                  Live Visual Preview
                </h3>
              </div>
              <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 font-bold">
                Live Rendering
              </span>
            </div>

            {/* Rendered Live Replica */}
            <div className="relative w-full min-h-[380px] sm:min-h-[460px] flex items-center overflow-hidden border border-stone-200">
              <img
                src={styleDirectionForm.backgroundImage}
                alt="Banner Preview"
                className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

              <div className="w-full max-w-6xl mx-auto px-4 py-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-5 text-left text-white space-y-2">
                    <h2 className="font-serif text-2xl sm:text-3xl text-[#FFF8ED]">
                      {styleDirectionForm.title} <span className="text-[#DEA53B] italic">{styleDirectionForm.highlightTitle}</span>
                    </h2>
                    <p className="text-xs text-[#E0D2C7] leading-relaxed max-w-sm">
                      {styleDirectionForm.description}
                    </p>
                    <div className="pt-2">
                      <span className="inline-block bg-[#DEA53B] text-stone-900 font-bold px-4 py-2 text-xs uppercase tracking-wider shadow">
                        {styleDirectionForm.buttonText} →
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-7">
                    <div className="grid grid-cols-3 gap-3">
                      {styleDirectionForm.moods.map((mood, idx) => (
                        <div key={idx} className="bg-[#181014]/90 border border-[#DEA53B]/40 text-left overflow-hidden">
                          <div className="aspect-[3/4] bg-stone-900 overflow-hidden">
                            <img src={mood.image} alt={mood.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-2 sm:p-3 bg-black/80">
                            <h4 className="text-white font-bold text-xs uppercase tracking-wider">{mood.title}</h4>
                            <p className="text-[10px] text-stone-400 truncate">{mood.subtitle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 2. TAB: SHOP BY CATEGORY (Max 6 Categories)                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveShopByCategory} className="bg-white border border-[#EDE4D8] p-5 sm:p-6 shadow-2xs space-y-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE4D8]">
              <div>
              

              </div>

              <div className="flex items-center gap-2">
                {categoryForm.selectedCategories.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddCategorySlot}
                    className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-none cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Slot</span>
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-none cursor-pointer flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Header Titles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Section Title</label>
                <input
                  type="text"
                  value={categoryForm.title}
                  onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none focus:outline-none focus:bg-white text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Highlight Word</label>
                <input
                  type="text"
                  value={categoryForm.highlightTitle}
                  onChange={(e) => setCategoryForm({ ...categoryForm, highlightTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none focus:outline-none focus:bg-white text-xs font-serif italic text-[#6D021B]"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none focus:outline-none focus:bg-white text-xs"
                />
              </div>
            </div>

            {/* 6 Category Slots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryForm.selectedCategories.map((cat, idx) => {
                const currentCategory = cat.categoryName || 'Banarasi'
                const categoryProducts = allProductsList.filter(
                  (p) => p.category.toLowerCase() === currentCategory.toLowerCase()
                )

                return (
                  <div key={cat.id || idx} className="bg-[#FAF7F2] p-3.5 border border-[#EDE4D8] rounded-none space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#6D021B] text-xs">Slot #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategorySlot(idx)}
                        className="text-stone-400 hover:text-red-700 cursor-pointer p-1"
                        title="Remove Slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Category Selection Dropdown */}
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Select Category:
                      </label>
                      <select
                        value={currentCategory}
                        onChange={(e) => handleSelectCategoryDropdown(idx, e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EDE4D8] rounded-none text-xs font-bold text-[#6D021B] focus:outline-none cursor-pointer"
                      >
                        {categoryDropdownOptions.map((cName) => (
                          <option key={cName} value={cName}>
                            {cName} Sarees
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Saree Card Photo Preview with "Select Particular Product" Button */}
                    <div className="relative aspect-[4/5] bg-stone-900 overflow-hidden border border-stone-200">
                      <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />

                      {/* Floating overlay to pick particular product from this category */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3 text-center">
                        <span className="text-white text-[11px] font-medium leading-tight">
                          {cat.itemTitle ? `Featured: ${cat.itemTitle}` : 'Click to choose which saree to showcase'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCategoryPickerSlotIndex(idx)}
                          className="px-3 py-1.5 bg-[#DEA53B] hover:bg-white text-stone-900 font-bold text-xs rounded-none flex items-center gap-1 shadow cursor-pointer transition-colors"
                        >
                          <Search className="w-3 h-3" />
                          <span>Select Product ({categoryProducts.length} available)</span>
                        </button>
                      </div>

                      {/* Category Badge on thumbnail */}
                      <span className="absolute top-2 left-2 bg-[#6D021B] text-white text-[9px] font-bold px-1.5 py-0.5 pointer-events-none">
                        {currentCategory}
                      </span>
                    </div>

                    {/* Quick Button to Select Saree if not hovering */}
                  

                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-0.5">Display Title</label>
                      <input
                        type="text"
                        value={cat.title}
                        onChange={(e) => handleUpdateCategoryCard(idx, 'title', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EDE4D8] rounded-none text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Item Count Subtitle</label>
                      <input
                        type="text"
                        value={cat.itemCount}
                        onChange={(e) => handleUpdateCategoryCard(idx, 'itemCount', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-[#EDE4D8] rounded-none text-xs focus:outline-none"
                      />
                    </div>

                    
                
                  </div>
                )
              })}
            </div>
          </form>

          {/* Live Preview for Shop By Category */}
          <div className="bg-white border border-[#EDE4D8] p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EDE4D8]">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#6D021B]" />
                <span>Live Preview: Shop by Category</span>
              </span>
              <span className="text-[11px] text-stone-500 font-semibold">{categoryForm.selectedCategories.length} cards rendered</span>
            </div>

            <div className="bg-[#F2E9DE] p-6 text-left">
              <h2 className="font-serif text-2xl text-stone-900 mb-1">
                {categoryForm.title} <span className="italic text-[#6D021B]">{categoryForm.highlightTitle}</span>
              </h2>
              <p className="text-xs text-stone-600 mb-6 max-w-md">{categoryForm.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                {categoryForm.selectedCategories.map((cat, idx) => (
                  <div key={idx} className="bg-white border border-stone-200 overflow-hidden text-left shadow-xs">
                    <div className="aspect-[3/4] bg-stone-100 overflow-hidden">
                      <img src={cat.image} alt={cat.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2.5">
                      <h4 className="font-bold text-xs text-stone-900 truncate">{cat.title}</h4>
                      <p className="text-[10px] text-stone-500">{cat.itemCount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 3. TAB: NEW ARRIVALS (Max 4 Products)                         */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'arrivals' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#EDE4D8] p-5 sm:p-6 shadow-2xs space-y-6 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE4D8]">
              <div>
                <h2 className="text-base font-bold text-[#1F1713]">
                  New Arrivals Section ({arrivalsForm.productIds.length} / 4 products chosen)
                </h2>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Products and text changes are saved automatically.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsArrivalProductPickerOpen(true)}
                  className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-none cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <span>Select Products</span>
                </button>
              </div>
            </div>

            {/* Title / Description */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Title</label>
                <input
                  type="text"
                  value={arrivalsForm.title}
                  onChange={(e) => handleArrivalsFieldChange('title', e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none focus:outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Highlight Word</label>
                <input
                  type="text"
                  value={arrivalsForm.highlightTitle}
                  onChange={(e) => handleArrivalsFieldChange('highlightTitle', e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none focus:outline-none focus:bg-white font-serif italic text-[#6D021B]"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={arrivalsForm.description}
                  onChange={(e) => handleArrivalsFieldChange('description', e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            {/* Currently Selected 4 Sarees Cards */}
            <div className="space-y-3">
              <span className="font-bold text-stone-900 block text-xs">
                Featured 4 Sarees in New Arrivals:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {arrivalsForm.productIds.map((id) => {
                  const p = getProductById(id)
                  if (!p) return null

                  return (
                    <div key={id} className="bg-[#FAF7F2] p-3 border border-[#EDE4D8] rounded-none flex flex-col justify-between">
                      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden mb-2">
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 bg-[#6D021B] text-white text-[10px] font-bold px-1.5 py-0.5">
                          NEW
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-stone-900 truncate">{p.title}</h4>
                        <div className="flex justify-between items-center mt-1 text-xs">
                          <span className="text-[#6D021B] font-bold">₹{p.price}</span>
                          <span className="text-stone-400 text-[10px]">{p.category}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleArrivalProduct(id)}
                        className="mt-3 w-full py-1.5 bg-white hover:bg-red-50 text-stone-600 hover:text-red-700 border border-stone-200 text-[11px] font-bold rounded-none transition-colors cursor-pointer"
                      >
                        Remove from Arrivals
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Live Preview New Arrivals */}
          <div className="bg-white border border-[#EDE4D8] p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EDE4D8]">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#6D021B]" />
                <span>Live Preview: New Arrivals Section</span>
              </span>
            </div>

            <div className="bg-[#FAF7F2] p-6 text-center">
              <h2 className="font-serif text-2xl text-stone-900 mb-1">
                {arrivalsForm.title} <span className="italic text-[#6D021B]">{arrivalsForm.highlightTitle}</span>
              </h2>
              <p className="text-xs text-stone-500 mb-6">{arrivalsForm.description}</p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {arrivalsForm.productIds.map((id) => {
                  const p = getProductById(id)
                  if (!p) return null
                  return (
                    <div key={id} className="bg-white border border-stone-200 overflow-hidden text-left shadow-xs">
                      <div className="aspect-[3/4] bg-stone-100 overflow-hidden relative">
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 bg-[#6D021B] text-white text-[10px] font-bold px-1.5 py-0.5">NEW</span>
                      </div>
                      <div className="p-3">
                        <h4 className="font-bold text-xs text-stone-900 truncate">{p.title}</h4>
                        <p className="text-xs font-bold text-[#6D021B] mt-1">₹{p.price}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 4. TAB: CATEGORY SHOWCASES (4 Products Each)                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'showcase' && (
        <div className="space-y-6">
          {/* Header Card with Add Showcase Block */}
          <div className="bg-white border border-[#EDE4D8] p-5 sm:p-6 shadow-2xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDE4D8]">
              <div>
                <h2 className="text-base font-bold text-[#1F1713]">
                  Category Showcase Sections ({cmsData.categoryShowcases.length} sections active)
                </h2>

              </div>

              {/* Add New Category Row Selector */}
              <div className="flex items-center gap-2">
                <p>select category : </p>
                <select
                  value={showcaseCategorySelect}
                  onChange={(e) => setShowcaseCategorySelect(e.target.value)}
                  className="px-3 py-2 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none focus:outline-none font-bold text-stone-800 text-xs cursor-pointer"
                >
                  {categoryDropdownOptions.map((cName) => (
                    <option key={cName} value={cName}>
                      {cName}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleCreateNewShowcase}
                  className="px-4 py-2 bg-[#6D021B] hover:bg-[#520117] text-white font-bold text-xs rounded-none cursor-pointer flex items-center gap-1 transition-colors shrink-0"
                >
                  <span>+ Add Category </span>
                </button>
              </div>
            </div>

            {/* List of active Category Showcase Blocks */}
            <div className="space-y-6">
              {cmsData.categoryShowcases.map((showcase) => (
                <div key={showcase.id} className="bg-[#FAF7F2] border border-[#EDE4D8] p-4.5 rounded-none space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EDE4D8]/80">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#6D021B] text-sm uppercase tracking-wide">
                        {showcase.categoryName} 
                      </span>
                      <span className="text-[10px] bg-white border border-[#EDE4D8] text-stone-700 font-bold px-2 py-0.5">
                        {showcase.productIds.length} / 4 products chosen
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPickerShowcaseId(showcase.id)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 border border-stone-200 text-white font-bold text-xs rounded-none flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Add Products </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => removeCategoryShowcase(showcase.id)}
                        className="p-1.5 text-stone-400 hover:text-red-700 cursor-pointer transition-colors"
                        title="Delete this section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Editable titles and description for this showcase */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Section Title</label>
                      <input
                        type="text"
                        value={showcase.title}
                        onChange={(e) => updateCategoryShowcase(showcase.id, { title: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EDE4D8] rounded-none text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Highlight Title</label>
                      <input
                        type="text"
                        value={showcase.highlightTitle}
                        onChange={(e) => updateCategoryShowcase(showcase.id, { highlightTitle: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EDE4D8] rounded-none text-xs font-serif italic text-[#6D021B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-0.5">Section Description</label>
                      <input
                        type="text"
                        value={showcase.description || ''}
                        onChange={(e) => updateCategoryShowcase(showcase.id, { description: e.target.value })}
                        placeholder="e.g. Handcrafted pure weaves capturing timeless royal elegance..."
                        className="w-full px-2.5 py-1.5 bg-white border border-[#EDE4D8] rounded-none text-xs focus:outline-none"
                      />
                    </div>
                    
                  </div>

                  {/* 4 Products Preview Cards for this Showcase */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {showcase.productIds.length === 0 ? (
                      <div className="col-span-full py-6 text-center bg-white border border-dashed border-stone-300 p-4 text-stone-500">
                        <span>No sarees chosen yet. Click "Curate Products" to select up to 4 sarees from {showcase.categoryName}.</span>
                      </div>
                    ) : (
                      showcase.productIds.map((id) => {
                        const p = getProductById(id)
                        if (!p) return null
                        return (
                          <div key={id} className="bg-white border border-stone-200 p-2 overflow-hidden shadow-2xs relative group">
                            <div className="aspect-[3/4] bg-stone-100 overflow-hidden mb-1.5">
                              <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                            </div>
                            <h5 className="font-bold text-xs text-stone-900 truncate">{p.title}</h5>
                            <span className="text-xs font-bold text-[#6D021B]">₹{p.price}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleShowcaseProduct(showcase.id, id)}
                              className="absolute top-3 right-3 p-1 bg-white/90 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                              title="Remove saree"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL 0: PRODUCT PICKER FOR SHOP BY CATEGORY SLOT             */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {categoryPickerSlotIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          {(() => {
            const currentSlot = categoryForm.selectedCategories[categoryPickerSlotIndex]
            if (!currentSlot) return null

            const slotCategory = currentSlot.categoryName || 'Banarasi'
            const matchingProducts = allProductsList.filter(
              (p) => p.category.toLowerCase() === slotCategory.toLowerCase()
            )

            return (
              <div className="bg-white w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-stone-300">
                <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF7F2]">
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">
                      Choose Featured Saree for Slot #{categoryPickerSlotIndex + 1} ({slotCategory} Category)
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Showing sarees from "{slotCategory}". Click any saree to set it as the cover photo for this category.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCategoryPickerSlotIndex(null)}
                    className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {matchingProducts.length === 0 ? (
                    <div className="col-span-full py-8 text-center text-stone-500">
                      No sarees found in catalog under "{slotCategory}".
                    </div>
                  ) : (
                    matchingProducts.map((p) => {
                      const isSelected =
                        currentSlot.featuredProductId === p.id ||
                        currentSlot.image === p.image

                      return (
                        <div
                          key={p.id}
                          onClick={() => handlePickProductForCategorySlot(categoryPickerSlotIndex, p)}
                          className={`p-2.5 border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#6D021B] ring-2 ring-[#6D021B]/30 bg-[#FAF7F2] shadow-sm'
                              : 'border-stone-200 bg-white hover:border-stone-400'
                          }`}
                        >
                          <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden mb-2">
                            <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-[#6D021B] text-white p-1 shadow">
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                          <h4 className="font-bold text-xs text-stone-900 truncate">{p.title}</h4>
                          <p className="text-[11px] text-[#6D021B] font-bold mt-0.5">₹{p.price}</p>
                          <span className="text-[10px] text-stone-400 mt-1 block">
                            Click to select
                          </span>
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="p-3 border-t border-stone-200 bg-[#FAF7F2] flex justify-between items-center text-xs">
                  <span className="text-stone-600 font-medium">
                    {matchingProducts.length} sarees available in {slotCategory}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCategoryPickerSlotIndex(null)}
                    className="px-5 py-2 bg-[#6D021B] text-white font-bold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL 1: PRODUCT PICKER FOR NEW ARRIVALS                      */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isArrivalProductPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-stone-300">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF7F2]">
              <div>
                <h3 className="font-bold text-sm text-stone-900">
                  Select New Arrivals Products ({arrivalsForm.productIds.length}/4 selected)
                </h3>
                <p className="text-[11px] text-stone-500">
                  Check up to 4 sarees to feature on the homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsArrivalProductPickerOpen(false)}
                className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-stone-100 bg-white">
              <input
                type="text"
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                placeholder="Search saree title or fabric..."
                className="w-full px-3 py-2 bg-[#FAF7F2] border border-stone-200 text-xs focus:outline-none"
              />
            </div>

            {/* Sarees Grid */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {allProductsList
                .filter(
                  (p) =>
                    p.title.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                    p.category.toLowerCase().includes(productSearchTerm.toLowerCase())
                )
                .map((p) => {
                  const isChecked = arrivalsForm.productIds.includes(p.id)
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleToggleArrivalProduct(p.id)}
                      className={`p-2.5 border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#6D021B] bg-[#FAF7F2] shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden mb-2">
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                        <div
                          className={`absolute top-2 right-2 w-5 h-5 flex items-center justify-center ${
                            isChecked ? 'bg-[#6D021B] text-white' : 'bg-white/80 text-stone-400'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <h4 className="font-bold text-xs text-stone-900 truncate">{p.title}</h4>
                      <p className="text-[11px] text-[#6D021B] font-bold mt-0.5">₹{p.price}</p>
                    </div>
                  )
                })}
            </div>

            <div className="p-3 border-t border-stone-200 bg-[#FAF7F2] flex justify-between items-center text-xs">
              <span className="text-stone-600 font-medium">
                {arrivalsForm.productIds.length} of 4 sarees selected
              </span>
              <button
                type="button"
                onClick={() => setIsArrivalProductPickerOpen(false)}
                className="px-5 py-2 bg-[#6D021B] text-white font-bold cursor-pointer"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL 2: PRODUCT PICKER FOR CATEGORY SHOWCASE (UP TO 4)       */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {pickerShowcaseId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          {(() => {
            const currentShowcase = cmsData.categoryShowcases.find((cs) => cs.id === pickerShowcaseId)
            if (!currentShowcase) return null

            // Sarees belonging to this category
            const categoryProducts = allProductsList.filter(
              (p) => p.category.toLowerCase() === currentShowcase.categoryName.toLowerCase()
            )

            return (
              <div className="bg-white w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl border border-stone-300">
                <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-[#FAF7F2]">
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">
                      Select {currentShowcase.categoryName} Products ({currentShowcase.productIds.length}/4 selected)
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Only sarees from the "{currentShowcase.categoryName}" category are listed below. Pick up to 4.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPickerShowcaseId(null)}
                    className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold cursor-pointer"
                  >
                    Done
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {categoryProducts.length === 0 ? (
                    <div className="col-span-full py-8 text-center text-stone-500">
                      No sarees currently in category "{currentShowcase.categoryName}".
                    </div>
                  ) : (
                    categoryProducts.map((p) => {
                      const isChecked = currentShowcase.productIds.includes(p.id)
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleToggleShowcaseProduct(currentShowcase.id, p.id)}
                          className={`p-2.5 border cursor-pointer transition-all ${
                            isChecked
                              ? 'border-[#6D021B] bg-[#FAF7F2] shadow-xs'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden mb-2">
                            <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                            <div
                              className={`absolute top-2 right-2 w-5 h-5 flex items-center justify-center ${
                                isChecked ? 'bg-[#6D021B] text-white' : 'bg-white/80 text-stone-400'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          </div>
                          <h4 className="font-bold text-xs text-stone-900 truncate">{p.title}</h4>
                          <p className="text-[11px] text-[#6D021B] font-bold mt-0.5">₹{p.price}</p>
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="p-3 border-t border-stone-200 bg-[#FAF7F2] flex justify-between items-center text-xs">
                  <span className="text-stone-600 font-medium">
                    {currentShowcase.productIds.length} of 4 sarees selected
                  </span>
                  <button
                    type="button"
                    onClick={() => setPickerShowcaseId(null)}
                    className="px-5 py-2 bg-[#6D021B] text-white font-bold cursor-pointer"
                  >
                    Confirm Selection
                  </button>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL 3: ADD / EDIT HERO BANNER (Full Responsive + Labtop & Mobile View) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white border border-[#EDE4D8] w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden rounded-none my-auto">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#EDE4D8] bg-[#FAF7F2] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#6D021B]" />
                <h3 className="font-bold text-sm sm:text-base text-[#1F1713]">
                  {editingBanner ? 'Edit Hero Banner' : 'Add New Hero Banner'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-200 transition-colors cursor-pointer rounded-none"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable & Responsive 2 Columns) */}
            <form onSubmit={handleSaveBannerModal} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
              {/* Dual Upload Section: Laptop (Desktop) View & Mobile View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-[#FAF7F2] border border-[#EDE4D8]">
                {/* 1. Desktop / Laptop View Upload */}
                <div className="space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                        <Laptop className="w-4 h-4 text-[#6D021B]" />
                        <span>Desktop / Laptop View</span>
                        <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-stone-500 font-medium">1024 × 438 px</span>
                    </div>

                    <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-dashed border-[#DEA53B] hover:border-[#6D021B] bg-white hover:bg-stone-50 text-stone-800 cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-[#6D021B]" />
                      <span className="font-bold text-[11px]">
                        {bannerFormData.image ? 'Change Laptop Photo' : 'Upload Laptop Photo'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleBannerImageUpload('image', e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Laptop Preview Frame */}
                  <div className="mt-2">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block mb-1">
                      Laptop Live Preview
                    </span>
                    <div className="relative aspect-[1024/438] w-full border border-stone-300 bg-stone-900 overflow-hidden flex items-center justify-center shadow-inner">
                      {bannerFormData.image ? (
                        <>
                          <img
                            src={bannerFormData.image}
                            alt="Desktop Banner Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                           
                          </div>
                        </>
                      ) : (
                        <div className="text-stone-400 flex flex-col items-center p-3 text-center">
                          <Laptop className="w-6 h-6 mb-1 opacity-50" />
                          <span className="text-[11px]">No laptop photo selected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {bannerErrors.image && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1">⚠ {bannerErrors.image}</p>
                  )}
                </div>

                {/* 2. Mobile View Upload */}
                <div className="space-y-2 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#EDE4D8] pt-4 md:pt-0 md:pl-5">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                        <Smartphone className="w-4 h-4 text-[#6D021B]" />
                        <span>Mobile Portrait View</span>
                      </label>
                      <span className="text-[10px] text-stone-500 font-medium">Portrait / 9:16</span>
                    </div>

                    <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-dashed border-[#DEA53B] hover:border-[#6D021B] bg-white hover:bg-stone-50 text-stone-800 cursor-pointer transition-colors shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-[#6D021B]" />
                      <span className="font-bold text-[11px]">
                        {bannerFormData.mobileImage ? 'Change Mobile Photo' : 'Upload Mobile Photo'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleBannerImageUpload('mobileImage', e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Mobile Preview Frame */}
                  <div className="mt-2 flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block mb-1 self-start">
                      Mobile Live Preview
                    </span>
                    <div className="relative h-36 w-24 border border-stone-300 bg-stone-900 overflow-hidden flex items-center justify-center shadow-inner">
                      {bannerFormData.mobileImage || bannerFormData.image ? (
                        <>
                          <img
                            src={bannerFormData.mobileImage || bannerFormData.image}
                            alt="Mobile Banner Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2">
                           
                          </div>
                        </>
                      ) : (
                        <div className="text-stone-400 flex flex-col items-center p-2 text-center">
                          <Smartphone className="w-5 h-5 mb-1 opacity-50" />
                          <span className="text-[9px]">No mobile photo</span>
                        </div>
                      )}
                    </div>
                    {!bannerFormData.mobileImage && bannerFormData.image && (
                      <span className="text-[10px] text-stone-500 mt-1 italic text-center">
                        (Using laptop photo as responsive fallback)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Text Fields: Title, Button, Link */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {/* Title / Caption */}
                <div className="sm:col-span-3">
                  <label className="block font-bold text-stone-700 mb-1">
                    Banner Title / Headline
                  </label>
                  <input
                    type="text"
                    value={bannerFormData.title}
                    onChange={(e) => setBannerFormData({ ...bannerFormData, title: e.target.value })}
                    placeholder="e.g. Festival Collection - Pure Katan Banarasi"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none focus:outline-none focus:bg-white text-xs"
                  />
                </div>

                {/* Button Text */}
                <div className="sm:col-span-1">
                  <label className="block font-bold text-stone-700 mb-1">
                    Button Text Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bannerFormData.buttonText}
                    onChange={(e) => {
                      setBannerFormData({ ...bannerFormData, buttonText: e.target.value })
                      if (bannerErrors.buttonText) setBannerErrors((p) => ({ ...p, buttonText: null }))
                    }}
                    placeholder="e.g. SHOP NOW"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none focus:outline-none focus:bg-white uppercase font-bold text-xs"
                  />
                  {bannerErrors.buttonText && (
                    <p className="mt-1 text-[11px] text-red-600 font-semibold">⚠ {bannerErrors.buttonText}</p>
                  )}
                </div>

                {/* Target Link */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">
                    Button URL Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bannerFormData.buttonLink}
                    onChange={(e) => {
                      setBannerFormData({ ...bannerFormData, buttonLink: e.target.value })
                      if (bannerErrors.buttonLink) setBannerErrors((p) => ({ ...p, buttonLink: null }))
                    }}
                    placeholder="e.g. /collections or /collections?category=Banarasi"
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none focus:outline-none focus:bg-white text-xs font-mono"
                  />
                  {bannerErrors.buttonLink && (
                    <p className="mt-1 text-[11px] text-red-600 font-semibold">⚠ {bannerErrors.buttonLink}</p>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#EDE4D8] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-none cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-none cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>{editingBanner ? 'Update Banner' : 'Save Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
