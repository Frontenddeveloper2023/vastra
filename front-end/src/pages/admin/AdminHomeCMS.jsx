import { useState, useMemo,useEffect } from 'react'
import notify from '../../utils/toast'
import { useConfirm } from '../../context/ConfirmModalContext'
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
import productService from '../../services/productService'
import homeCmsService from '../../services/homeCmsService'
import { getCmsImageUrl } from '../../utils/imageHelper'
import { AdminSaveButton, AdminCancelButton } from '../../components/admin/AdminUI'

export default function AdminHomeCMS() {
  const confirm = useConfirm()
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

  // Live products fetched directly from MongoDB
  const [dbProducts, setDbProducts] = useState([])
  useEffect(() => {
    productService
      .getAll({ limit: 100 })
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.products || []
        setDbProducts(list)
      })
      .catch((err) => console.error('Failed to load products from DB:', err))
  }, [])

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

  const handleDeleteBanner = async (id) => {
    if ((cmsData.heroBanners || []).length <= 1) {
      notify.error('You must keep at least 1 banner for the hero slider.')
      return
    }

    const isConfirmed = await confirm({
      title: 'Delete Hero Banner',
      message: 'Are you sure you want to delete this banner from the hero slider?',
      confirmText: 'Delete Banner',
      cancelText: 'Cancel',
      type: 'danger',
    })

    if (isConfirmed) {
      removeHeroBanner(id)
      showSaved('Banner removed successfully!')
      notify.success('Banner removed successfully!')
    }
  }

  const handleBannerImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const toastId = notify.loading?.('Uploading desktop banner photo...')
    try {
      const uploadedPath = await homeCmsService.uploadImage(file, 'banner')
      if (toastId) notify.dismiss?.(toastId)
      if (uploadedPath) {
        setBannerFormData((prev) => ({ ...prev, image: uploadedPath }))
        if (bannerErrors.image) setBannerErrors((prev) => ({ ...prev, image: null }))
        notify.success('Desktop banner image uploaded')
      }
    } catch (err) {
      if (toastId) notify.dismiss?.(toastId)
      console.error('Banner upload error:', err)
      notify.error('Failed to upload banner image')
    }
  }

  const handleMobileBannerImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const toastId = notify.loading?.('Uploading mobile screen banner photo...')
    try {
      const uploadedPath = await homeCmsService.uploadImage(file, 'banner-mobile')
      if (toastId) notify.dismiss?.(toastId)
      if (uploadedPath) {
        setBannerFormData((prev) => ({ ...prev, mobileImage: uploadedPath }))
        notify.success('Mobile screen banner image uploaded')
      }
    } catch (err) {
      if (toastId) notify.dismiss?.(toastId)
      console.error('Mobile banner upload error:', err)
      notify.error('Failed to upload mobile banner image')
    }
  }

  const handleSaveBannerModal = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!bannerFormData.image) errs.image = 'Banner image is required'
    if (!bannerFormData.buttonText?.trim()) errs.buttonText = 'Button text is required'
    if (!bannerFormData.buttonLink?.trim()) errs.buttonLink = 'Target link is required'

    if (Object.keys(errs).length > 0) {
      setBannerErrors(errs)
      return
    }

    try {
      if (editingBanner) {
        await updateSingleHeroBanner(editingBanner.id || editingBanner._id, {
          ...bannerFormData,
        })
        showSaved('Banner updated successfully!')
        notify.success('Banner updated successfully!')
      } else {
        await addHeroBanner(bannerFormData)
        showSaved('New banner added to homepage slider!')
        notify.success('New banner added!')
      }
      setIsBannerModalOpen(false)
    } catch (err) {
      notify.error('Failed to save banner')
    }
  }

  // -------------------------------------------------------------
  // TAB 1: Fashion For Every Mood State
  // -------------------------------------------------------------
  const [styleDirectionForm, setStyleDirectionForm] = useState(() => ({
    title: cmsData.styleDirection?.title || 'Fashion For',
    highlightTitle: cmsData.styleDirection?.highlightTitle || 'Every Mood',
    description: cmsData.styleDirection?.description || '',
    buttonText: cmsData.styleDirection?.buttonText || 'Shop All Moods',
    buttonUrl: cmsData.styleDirection?.buttonUrl || '/collections',
    backgroundImage: cmsData.styleDirection?.backgroundImage || '',
    moods: JSON.parse(JSON.stringify(cmsData.styleDirection?.moods || [])),
  }))

  // Keep local form in sync whenever cmsData loads from backend
  useEffect(() => {
    if (cmsData.styleDirection) {
      setStyleDirectionForm({
        title: cmsData.styleDirection.title || 'Fashion For',
        highlightTitle: cmsData.styleDirection.highlightTitle || 'Every Mood',
        description: cmsData.styleDirection.description || '',
        buttonText: cmsData.styleDirection.buttonText || 'Shop All Moods',
        buttonUrl: cmsData.styleDirection.buttonUrl || '/collections',
        backgroundImage: cmsData.styleDirection.backgroundImage || '',
        moods: JSON.parse(JSON.stringify(cmsData.styleDirection.moods || [])),
      })
    }
  }, [cmsData.styleDirection])

  // If moods is empty (e.g. first load), ensure default 3 cards are present
  useEffect(() => {
    if (!styleDirectionForm.moods || styleDirectionForm.moods.length === 0) {
      setStyleDirectionForm((prev) => ({
        ...prev,
        moods: [
          { id: '1', title: 'CASUAL', subtitle: 'Effortless Everyday Drapes', image: '', url: '/collections?category=Bandhani' },
          { id: '2', title: 'FORMAL', subtitle: 'Classic Pure Handlooms', image: '', url: '/collections?category=Georgette' },
          { id: '3', title: 'PARTY', subtitle: 'Grand Zari & Shimmer Silks', image: '', url: '/collections?category=Bandhani' },
        ],
      }))
    }
  }, [styleDirectionForm.moods])

  const [styleErrors, setStyleErrors] = useState({})

  // Background image file upload
  const handleBgImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const toastId = notify.loading?.('Uploading background image...')
    try {
      const uploadedPath = await homeCmsService.uploadImage(file, 'mood-bg')
      if (toastId) notify.dismiss?.(toastId)
      if (uploadedPath) {
        setStyleDirectionForm((prev) => ({ ...prev, backgroundImage: uploadedPath }))
        notify.success('Background image uploaded')
      }
    } catch (err) {
      if (toastId) notify.dismiss?.(toastId)
      notify.error('Failed to upload background image')
    }
  }

  // Mood card image upload
  const handleMoodCardImageUpload = async (index, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const toastId = notify.loading?.('Uploading mood photo...')
    try {
      const uploadedPath = await homeCmsService.uploadImage(file, `mood-${index}`)
      if (toastId) notify.dismiss?.(toastId)
      if (uploadedPath) {
        const updated = [...styleDirectionForm.moods]
        updated[index] = { ...updated[index], image: uploadedPath }
        setStyleDirectionForm((prev) => ({ ...prev, moods: updated }))
        notify.success('Mood card image uploaded')
      }
    } catch (err) {
      if (toastId) notify.dismiss?.(toastId)
      notify.error('Failed to upload card image')
    }
  }

  // Update specific mood card fields
  const handleMoodCardChange = (index, field, value) => {
    const updated = [...styleDirectionForm.moods]
    updated[index] = { ...updated[index], [field]: value }
    setStyleDirectionForm((prev) => ({ ...prev, moods: updated }))
  }

  // Save Style Direction
  const handleSaveStyleDirection = async (e) => {
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
    try {
      await updateStyleDirection(styleDirectionForm)
      showSaved('Fashion For Every Mood updated successfully!')
      notify.success('Fashion For Every Mood saved to database!')
    } catch (err) {
      notify.error('Failed to save to database')
    }
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

  // Keep categoryForm in sync when backend cmsData finishes loading
  useEffect(() => {
    if (cmsData?.shopByCategory) {
      setCategoryForm({
        title: cmsData.shopByCategory.title || 'Shop by',
        highlightTitle: cmsData.shopByCategory.highlightTitle || 'Category',
        description: cmsData.shopByCategory.description || '',
        selectedCategories: JSON.parse(JSON.stringify(cmsData.shopByCategory.selectedCategories || [])),
      })
    }
  }, [cmsData.shopByCategory])

  const [categoryPickerSlotIndex, setCategoryPickerSlotIndex] = useState(null)

  // Dynamic category options combining products from DB + admin presets
  const categoryDropdownOptions = useMemo(() => {
    let savedCategories = []
    try {
      const saved = localStorage.getItem('vastraa_admin_categories')
      if (saved) savedCategories = JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }

    const fromDbProducts = dbProducts.map((p) => p.category).filter(Boolean)
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
      'Georgette',
    ]

    // Unique combination of all categories
    return Array.from(new Set([...fromDbProducts, ...savedCategories, ...baseDefaults]))
  }, [dbProducts])

  // When admin selects a category from dropdown, update categoryName, auto-set itemCount, title, href, and auto-open product picker
  const handleSelectCategoryDropdown = (index, chosenCategory) => {
    const matchingProducts = dbProducts.filter(
      (p) => (p.category || '').toLowerCase() === chosenCategory.toLowerCase()
    )
    const featuredProduct = matchingProducts[0]
    const count = matchingProducts.length

    const updated = [...categoryForm.selectedCategories]
    updated[index] = {
      ...updated[index],
      categoryName: chosenCategory,
      title: `${chosenCategory} Sarees`,
      itemCount: `${count > 0 ? count : 12} Items`,
      image: featuredProduct ? (featuredProduct.image || featuredProduct.variants?.[0]?.image) : (updated[index].image || ''),
      featuredProductId: featuredProduct ? (featuredProduct._id || featuredProduct.id) : null,
      href: `/collections?category=${encodeURIComponent(chosenCategory)}`,
    }
    const newForm = { ...categoryForm, selectedCategories: updated }
    setCategoryForm(newForm)
    updateShopByCategory(newForm)

    // Automatically open the product picker modal so admin can pick the specific saree from this category
    setCategoryPickerSlotIndex(index)
  }

  // When admin chooses a specific product inside the category product picker modal
  const handlePickProductForCategorySlot = (slotIndex, product) => {
    const pId = product._id || product.id
    const pImg = product.image || product.variants?.[0]?.image || ''
    const prodCategory = product.category || categoryForm.selectedCategories[slotIndex]?.categoryName || 'Banarasi'
    const matchingProducts = dbProducts.filter(
      (p) => (p.category || '').toLowerCase() === prodCategory.toLowerCase()
    )
    const count = matchingProducts.length

    const updated = [...categoryForm.selectedCategories]
    updated[slotIndex] = {
      ...updated[slotIndex],
      categoryName: prodCategory,
      title: `${prodCategory} Sarees`,
      itemCount: `${count > 0 ? count : 12} Items`,
      image: pImg,
      featuredProductId: pId,
      itemTitle: product.title,
      href: `/collections?category=${encodeURIComponent(prodCategory)}`,
    }
    const newForm = { ...categoryForm, selectedCategories: updated }
    setCategoryForm(newForm)
    updateShopByCategory(newForm)
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
    const matchingProducts = dbProducts.filter(
      (p) => (p.category || '').toLowerCase() === defaultCat.toLowerCase()
    )
    const featuredProduct = matchingProducts[0]
    const count = matchingProducts.length

    const defaultNew = {
      id: Date.now(),
      title: `${defaultCat} Sarees`,
      categoryName: defaultCat,
      itemCount: `${count > 0 ? count : 80} Items`,
      image: featuredProduct ? (featuredProduct.image || featuredProduct.variants?.[0]?.image) : '',
      featuredProductId: featuredProduct ? (featuredProduct._id || featuredProduct.id) : null,
      href: `/collections?category=${encodeURIComponent(defaultCat)}`,
    }
    // Prepend newly added slot at the beginning (Slot #1)
    const newForm = {
      ...categoryForm,
      selectedCategories: [defaultNew, ...categoryForm.selectedCategories],
    }
    setCategoryForm(newForm)
    updateShopByCategory(newForm)
    // Automatically open the product picker for the newly added first slot
    setCategoryPickerSlotIndex(0)
  }

  const handleRemoveCategorySlot = (index) => {
    const nextCategories = categoryForm.selectedCategories.filter((_, idx) => idx !== index)
    const newForm = {
      ...categoryForm,
      selectedCategories: nextCategories,
    }
    setCategoryForm(newForm)
    updateShopByCategory(newForm)
  }

  const handleSaveShopByCategory = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    updateShopByCategory(categoryForm)
    showSaved('Shop By Category updated successfully!')
  }

  // -------------------------------------------------------------
  // TAB 3: New Arrivals (Max 4 Products) State
  // -------------------------------------------------------------
  const [arrivalsForm, setArrivalsForm] = useState(() => ({
    title: cmsData.newArrivals?.title || 'New',
    highlightTitle: cmsData.newArrivals?.highlightTitle || 'Arrivals',
    description: cmsData.newArrivals?.description || '',
    productIds: [...(cmsData.newArrivals?.productIds || [])],
  }))

  // Keep arrivalsForm in sync when backend cmsData finishes loading
  useEffect(() => {
    if (cmsData?.newArrivals) {
      setArrivalsForm({
        title: cmsData.newArrivals.title || 'New',
        highlightTitle: cmsData.newArrivals.highlightTitle || 'Arrivals',
        description: cmsData.newArrivals.description || '',
        productIds: [...(cmsData.newArrivals.productIds || [])],
      })
    }
  }, [cmsData.newArrivals])

  const [isArrivalProductPickerOpen, setIsArrivalProductPickerOpen] = useState(false)
  const [productSearchTerm, setProductSearchTerm] = useState('')

  const handleToggleArrivalProduct = async (productId) => {
    const sId = String(productId)
    const exists = arrivalsForm.productIds.some((id) => String(id) === sId)

    if (exists) {
      if (arrivalsForm.productIds.length <= 1) {
        notify.error('You must keep at least 1 product selected for New Arrivals.')
        return
      }
      const nextProductIds = arrivalsForm.productIds.filter((id) => String(id) !== sId)
      const updated = { ...arrivalsForm, productIds: nextProductIds }
      setArrivalsForm(updated)
      try {
        await updateNewArrivals(updated)
        notify.success('New Arrivals updated successfully!')
      } catch (err) {
        notify.error('Failed to save to database')
      }
      return
    }

    if (arrivalsForm.productIds.length >= 4) {
      notify.error('Maximum 4 products allowed in the New Arrivals section.')
      return
    }

    const nextProductIds = [...arrivalsForm.productIds, sId]
    const updated = { ...arrivalsForm, productIds: nextProductIds }
    setArrivalsForm(updated)
    try {
      await updateNewArrivals(updated)
      notify.success('Product added to New Arrivals!')
    } catch (err) {
      notify.error('Failed to save to database')
    }
  }

  const handleArrivalsFieldChange = (field, value) => {
    const updated = { ...arrivalsForm, [field]: value }
    setArrivalsForm(updated)
  }

  const handleSaveNewArrivals = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    try {
      await updateNewArrivals(arrivalsForm)
      notify.success('New Arrivals section saved to database!')
      showSaved('New Arrivals section updated successfully!')
    } catch (err) {
      notify.error('Failed to save New Arrivals to database')
    }
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

    const sProductId = String(productId)
    const exists = (targetShowcase.productIds || []).some((id) => String(id) === sProductId)

    if (exists) {
      updateCategoryShowcase(showcaseId, {
        productIds: targetShowcase.productIds.filter((id) => String(id) !== sProductId),
      })
    } else {
      if ((targetShowcase.productIds || []).length >= 4) {
        notify.error('Maximum 4 products can be chosen for this category showcase section.')
        return
      }
      updateCategoryShowcase(showcaseId, {
        productIds: [...(targetShowcase.productIds || []), sProductId],
      })
    }
  }

  const showSaved = (msg) => {
    setSaveSuccessMsg(msg)
    setTimeout(() => setSaveSuccessMsg(''), 3000)
  }

  // Helper to fetch full product objects from ID (checking MongoDB products first, then fallback)
  const getProductById = (id) => {
    const sId = String(id)
    return dbProducts.find((p) => String(p._id || p.id) === sId)
  }

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
                  Hero Banner Slider 
                </h2>
               
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
                    {/* Banner Image Previews: Laptop Screen + Mobile Screen */}
                    <div className="p-3 bg-stone-100 border-b border-[#EDE4D8] grid grid-cols-12 gap-2">
                      {/* Laptop Screen Thumbnail */}
                      <div className="col-span-8 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-stone-500 font-bold uppercase">
                          <span className="flex items-center gap-1">
                            <Laptop className="w-3 h-3 text-[#6D021B]" /> Laptop
                          </span>
                          <span>16:9</span>
                        </div>
                        <div className="relative aspect-[16/9] w-full bg-stone-200 overflow-hidden border border-stone-300">
                          {banner.image ? (
                            <img
                              src={getCmsImageUrl(banner.image)}
                              alt="Laptop Banner"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                          <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.2">
                            Slide #{index + 1}
                          </span>
                        </div>
                      </div>

                      {/* Mobile Screen Thumbnail */}
                      <div className="col-span-4 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-stone-500 font-bold uppercase">
                          <span className="flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-[#6D021B]" /> Mobile
                          </span>
                          <span>Portrait</span>
                        </div>
                        <div className="relative aspect-[9/16] w-full bg-stone-200 overflow-hidden border border-stone-300">
                          {banner.mobileImage ? (
                            <img
                              src={getCmsImageUrl(banner.mobileImage)}
                              alt="Mobile Banner"
                              className="w-full h-full object-cover"
                            />
                          ) : banner.image ? (
                            <div className="relative w-full h-full">
                              <img
                                src={getCmsImageUrl(banner.image)}
                                alt="Mobile Banner Fallback"
                                className="w-full h-full object-cover opacity-60"
                              />
                              <span className="absolute inset-0 flex items-center justify-center text-[9px] text-stone-900 bg-white/70 font-bold text-center px-1">
                                Auto-fit
                              </span>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400">
                              <Smartphone className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Banner Info */}
                    <div className="p-4 space-y-2">
                    

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
                      src={getCmsImageUrl(styleDirectionForm.backgroundImage)}
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

                {/* Direct Visible Upload Button */}
                <label className="flex items-center justify-center gap-2 w-full px-3 py-2 border border-dashed border-[#DEA53B] hover:border-[#6D021B] bg-[#FAF7F2] hover:bg-stone-50 text-stone-800 cursor-pointer transition-colors text-xs font-bold shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-[#6D021B]" />
                  <span>{styleDirectionForm.backgroundImage ? 'Upload / Replace Background Photo' : 'Upload Background Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBgImageUpload}
                    className="hidden"
                  />
                </label>

               
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
                        src={getCmsImageUrl(mood.image)}
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
                src={getCmsImageUrl(styleDirectionForm.backgroundImage)}
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
                            <img src={getCmsImageUrl(mood.image)} alt={mood.title} className="w-full h-full object-cover" />
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
            {categoryForm.selectedCategories.length === 0 ? (
              <div className="py-12 px-4 border-2 border-dashed border-[#EDE4D8] bg-[#FAF7F2] text-center space-y-3">
                <p className="text-sm font-semibold text-stone-600">
                  No category cards currently configured.
                </p>
                <p className="text-xs text-stone-400">
                  You can leave this section empty, or click "+ Add Slot" above anytime to feature categories on the homepage.
                </p>
                <button
                  type="button"
                  onClick={handleAddCategorySlot}
                  className="px-4 py-2 bg-[#6D021B] hover:bg-[#580115] text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Category Slot</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoryForm.selectedCategories.map((cat, idx) => {
                const currentCategory = cat.categoryName || 'Banarasi'
                const categoryProducts = dbProducts.filter(
                  (p) => (p.category || '').toLowerCase() === currentCategory.toLowerCase()
                )

                return (
                  <div key={cat.id || idx} className="bg-white p-4 border-2 border-[#EDE4D8] hover:border-[#6D021B]/40 shadow-xs space-y-3.5 relative transition-all">
                    {/* Header: Slot Badge & Remove */}
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white bg-[#6D021B] px-2 py-0.5 text-[11px] tracking-wide">
                          SLOT #{idx + 1}
                        </span>
                        <span className="text-[11px] font-semibold text-stone-500">
                          {cat.title || `${currentCategory} Sarees`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategorySlot(idx)}
                        className="text-stone-400 hover:text-red-700 cursor-pointer p-1 transition-colors"
                        title="Remove Slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

               

                    {/* STEP 2: Choose Representative Product Image */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                          2. Representative Saree Photo
                        </span>
                        <span className="text-[10px] text-stone-500 font-medium">
                          {cat.itemTitle ? 'Product Selected' : 'Auto-defaulted'}
                        </span>
                      </div>

                      {/* Photo preview container */}
                      <div className="relative aspect-[4/5] bg-stone-900 overflow-hidden border border-stone-200 group">
                        <img
                          src={getCmsImageUrl(cat.image)}
                          alt={cat.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3 text-center">
                          <span className="text-white text-xs font-medium line-clamp-2">
                            {cat.itemTitle || cat.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => setCategoryPickerSlotIndex(idx)}
                            className="px-3.5 py-1.5 bg-[#DEA53B] hover:bg-white text-stone-900 font-bold text-xs rounded-none flex items-center gap-1.5 shadow cursor-pointer transition-colors"
                          >
                            <Search className="w-3.5 h-3.5" />
                            <span>Browse & Pick Saree</span>
                          </button>
                        </div>

                        {/* Top Category Badge */}
                        <span className="absolute top-2 left-2 bg-[#6D021B] text-white text-[10px] font-bold px-2 py-0.5 tracking-wide shadow-sm pointer-events-none">
                          {currentCategory}
                        </span>

                        {/* Bottom Info Ribbon */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 text-left pointer-events-none">
                          <p className="text-white font-serif text-xs font-bold truncate">{cat.title}</p>
                          <p className="text-[#DEA53B] text-[10px] font-semibold">{cat.itemCount}</p>
                        </div>
                      </div>

                    
                    </div>

                    {/* In-Card Live Product Thumbnails Selector (Quick 1-Click Pick) */}
                    {categoryProducts.length > 0 && (
                      <div className="pt-2 border-t border-stone-100">
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                          Quick Pick from {currentCategory} ({categoryProducts.length}):
                        </span>
                        <div className="grid grid-cols-4 gap-1.5 max-h-24 overflow-y-auto p-1 bg-[#FAF7F2] border border-stone-200">
                          {categoryProducts.map((prod) => {
                            const pImg = prod.image || prod.variants?.[0]?.image || ''
                            const isPicked =
                              cat.featuredProductId === (prod._id || prod.id) || cat.image === pImg
                            return (
                              <button
                                key={prod._id || prod.id}
                                type="button"
                                onClick={() => handlePickProductForCategorySlot(idx, prod)}
                                title={prod.title}
                                className={`relative aspect-[3/4] overflow-hidden border cursor-pointer transition-all ${
                                  isPicked
                                    ? 'border-[#6D021B] ring-2 ring-[#6D021B] scale-95 shadow-sm'
                                    : 'border-stone-300 hover:border-stone-500 opacity-75 hover:opacity-100'
                                }`}
                              >
                                <img
                                  src={getCmsImageUrl(pImg)}
                                  alt={prod.title}
                                  className="w-full h-full object-cover"
                                />
                                {isPicked && (
                                  <div className="absolute inset-0 bg-[#6D021B]/40 flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Auto-filled Category Name & Real Count (Read-only badges, no manual edit) */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                      <div className="bg-[#FAF7F2] p-2 border border-[#EDE4D8]">
                        <span className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider">
                          Category Title
                        </span>
                        <span className="block text-xs font-bold text-[#6D021B] mt-0.5 truncate" title={cat.title}>
                          {cat.title || `${currentCategory} Sarees`}
                        </span>
                      </div>
                      <div className="bg-[#FAF7F2] p-2 border border-[#EDE4D8]">
                        <span className="block text-[9px] font-bold text-stone-500 uppercase tracking-wider">
                          Item Count
                        </span>
                        <span className="block text-xs font-bold text-emerald-800 mt-0.5">
                          {cat.itemCount || `${categoryProducts.length} Items`}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            )}
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

            <div className="bg-[#F2E9DE] bg-gradient-to-b from-[#F5EEE4] via-[#F2E9DE] to-[#EAE0D3] p-6 sm:p-8 text-left border border-[#DFD1BF] relative overflow-hidden">
              {/* Subtle Warm Grid Pattern */}
              <div
                className="absolute inset-0 opacity-[0.035] pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#6D021B 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              <div className="relative z-10 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#1F1713] leading-tight">
                    {categoryForm.title || 'Shop by'}{' '}
                    <span className="italic text-[#6D021B] font-serif">
                      {categoryForm.highlightTitle || 'Category'}
                    </span>
                  </h2>
                  <p className="text-xs text-[#6F5F53] mt-1 max-w-lg">
                    {categoryForm.description || 'Discover curated collections tailored to celebrate timeless grace & Indian heritage'}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6D021B] uppercase tracking-wider">
                  <span>See all categories</span>
                  <span>→</span>
                </div>
              </div>

              {categoryForm.selectedCategories.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs font-medium">
                  No category cards to preview.
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 relative z-10">
                  {categoryForm.selectedCategories.map((cat, idx) => (
                    <div
                      key={cat.id || idx}
                      className="group relative flex flex-col w-full overflow-hidden bg-white border border-[#DFD1BF] shadow-sm transition-all duration-300"
                    >
                      {/* Edge-to-Edge Image Frame */}
                      <div className="relative aspect-[3/4] lg:aspect-[4/5] w-full overflow-hidden bg-[#18212C]">
                        <img
                          src={getCmsImageUrl(cat.image)}
                          alt={cat.title}
                          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                        />

                        {/* Subtle bottom vignette for text readability */}
                        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/45 to-transparent pointer-events-none z-10" />

                        {/* Bottom Text Drawer with Golden Arrow Button */}
                        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 z-20 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1 text-left">
                            <h3 className="font-serif text-xs sm:text-sm md:text-base font-semibold text-[#FFF8ED] leading-tight truncate">
                              {cat.title || `${cat.categoryName || 'Banarasi'} Sarees`}
                            </h3>
                            <p className="text-[10px] sm:text-xs text-[#E1D1C3] mt-0.5 font-normal tracking-wide truncate">
                              {cat.itemCount || '0 Items'}
                            </p>
                          </div>

                          {/* Golden Arrow Button identical to user design */}
                          <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-[#DEA53B] text-[#1F1713] flex items-center justify-center shrink-0 border border-white/20 shadow-md">
                            <svg
                              className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                <button
                  type="button"
                  onClick={handleSaveNewArrivals}
                  className="px-4 py-2 bg-[#6D021B] hover:bg-[#580115] text-white font-bold text-xs rounded-none cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span>Save Changes</span>
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
                        <img src={getCmsImageUrl(p.image || p.variants?.[0]?.image)} alt={p.title} className="w-full h-full object-cover" />
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
                  const pImg = p.image || p.variants?.[0]?.images?.[0] || p.variants?.[0]?.image || ''
                  return (
                    <div key={id} className="bg-white border border-stone-200 overflow-hidden text-left shadow-xs">
                      <div className="aspect-[3/4] bg-stone-100 overflow-hidden relative">
                        <img
                          src={getCmsImageUrl(p.image || p.variants?.[0]?.image)} alt={p.title}
                          className="w-full h-full object-cover"
                        />
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
                              <img src={getCmsImageUrl(p.image || p.variants?.[0]?.image)} alt={p.title} className="w-full h-full object-cover" />
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
            const matchingProducts = dbProducts.filter(
              (p) => (p.category || '').toLowerCase() === slotCategory.toLowerCase()
            )

            return (
              <div className="bg-white w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl border border-stone-300">
                <div className="p-4 border-b border-stone-200 bg-[#FAF7F2] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">
                        Choose Featured Saree for Slot #{categoryPickerSlotIndex + 1}
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Select a category from the dropdown to view its sarees, then click any saree to feature it on the homepage.
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

                  {/* Category Dropdown inside Modal */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs font-bold text-[#6D021B] whitespace-nowrap">Filter by Category:</span>
                    <select
                      value={slotCategory}
                      onChange={(e) => {
                        const newCat = e.target.value
                        handleSelectCategoryDropdown(categoryPickerSlotIndex, newCat)
                      }}
                      className="flex-1 max-w-xs px-3 py-1.5 bg-white border border-[#EDE4D8] text-xs font-bold text-stone-900 focus:outline-none focus:border-[#6D021B] cursor-pointer"
                    >
                      {categoryDropdownOptions.map((cName) => {
                        const count = dbProducts.filter(
                          (p) => (p.category || '').toLowerCase() === cName.toLowerCase()
                        ).length
                        return (
                          <option key={cName} value={cName}>
                            {cName} Sarees ({count} items in stock)
                          </option>
                        )
                      })}
                    </select>
                    <span className="text-xs text-stone-500 font-semibold ml-2">
                      ({matchingProducts.length} sarees available)
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {matchingProducts.length === 0 ? (
                    <div className="col-span-full py-8 text-center text-stone-500">
                      No sarees found in database under "{slotCategory}".
                    </div>
                  ) : (
                    matchingProducts.map((p) => {
                      const pId = p._id || p.id
                      const pImg = p.image || p.variants?.[0]?.image || ''
                      const isSelected =
                        String(currentSlot.featuredProductId) === String(pId) ||
                        currentSlot.image === pImg

                      return (
                        <div
                          key={pId}
                          onClick={() => handlePickProductForCategorySlot(categoryPickerSlotIndex, p)}
                          className={`p-2.5 border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#6D021B] ring-2 ring-[#6D021B]/30 bg-[#FAF7F2] shadow-sm'
                              : 'border-stone-200 bg-white hover:border-stone-400'
                          }`}
                        >
                          <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden mb-2">
                            <img src={getCmsImageUrl(pImg)} alt={p.title} className="w-full h-full object-cover" />
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
              {dbProducts
                .filter(
                  (p) =>
                    (p.title || '').toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                    (p.category || '').toLowerCase().includes(productSearchTerm.toLowerCase())
                )
                .map((p) => {
                  const pId = p._id || p.id
                  const isChecked = arrivalsForm.productIds.some((id) => String(id) === String(pId))
                  return (
                    <div
                      key={pId}
                      onClick={() => handleToggleArrivalProduct(pId)}
                      className={`p-2.5 border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-[#6D021B] bg-[#FAF7F2] shadow-xs'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden mb-2">
                        <img src={getCmsImageUrl(p.image || p.variants?.[0]?.image)} alt={p.title} className="w-full h-full object-cover" />
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

            // Sarees belonging to this category from MongoDB
            const categoryProducts = dbProducts.filter(
              (p) => (p.category || '').toLowerCase() === currentShowcase.categoryName.toLowerCase()
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
                      const pId = p._id || p.id
                      const isChecked = currentShowcase.productIds.some((id) => String(id) === String(pId))
                      return (
                        <div
                          key={pId}
                          onClick={() => handleToggleShowcaseProduct(currentShowcase.id, pId)}
                          className={`p-2.5 border cursor-pointer transition-all ${
                            isChecked
                              ? 'border-[#6D021B] bg-[#FAF7F2] shadow-xs'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden mb-2">
                            <img src={getCmsImageUrl(p.image || p.variants?.[0]?.image)} alt={p.title} className="w-full h-full object-cover" />
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

            {/* Modal Body */}
            <form onSubmit={handleSaveBannerModal} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
              {/* Upload Section: Laptop & Mobile Screen Banners */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. LAPTOP / DESKTOP BANNER */}
                <div className="p-4 bg-[#FAF7F2] border border-[#EDE4D8] space-y-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                      <Laptop className="w-4 h-4 text-[#6D021B]" />
                      <span>Laptop Screen Banner</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-stone-500 font-medium">1024 × 438 px</span>
                  </div>

                  <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-dashed border-[#DEA53B] hover:border-[#6D021B] bg-white hover:bg-stone-50 text-stone-800 cursor-pointer transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-[#6D021B]" />
                    <span className="font-bold text-[11px]">
                      {bannerFormData.image ? 'Change Laptop Banner' : 'Upload Laptop Banner'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerImageUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Laptop Banner Preview Frame */}
                  <div className="mt-2">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block mb-1">
                      Laptop Preview
                    </span>
                    <div className="relative aspect-[1024/438] w-full border border-stone-300 bg-stone-900 overflow-hidden flex items-center justify-center shadow-inner">
                      {bannerFormData.image ? (
                        <img
                          src={getCmsImageUrl(bannerFormData.image)}
                          alt="Laptop Banner Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-stone-400 flex flex-col items-center p-3 text-center">
                          <Laptop className="w-6 h-6 mb-1 opacity-50" />
                          <span className="text-[11px]">No laptop banner chosen</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {bannerErrors.image && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1">⚠ {bannerErrors.image}</p>
                  )}
                </div>

                {/* 2. MOBILE SCREEN BANNER */}
                <div className="p-4 bg-[#FAF7F2] border border-[#EDE4D8] space-y-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-stone-800 flex items-center gap-1.5 text-xs">
                      <Smartphone className="w-4 h-4 text-[#6D021B]" />
                      <span>Mobile Screen Banner (Optional)</span>
                    </label>
                    <span className="text-[10px] text-stone-500 font-medium">Portrait (9:16)</span>
                  </div>

                  <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-dashed border-[#DEA53B] hover:border-[#6D021B] bg-white hover:bg-stone-50 text-stone-800 cursor-pointer transition-colors shadow-2xs">
                    <Upload className="w-3.5 h-3.5 text-[#6D021B]" />
                    <span className="font-bold text-[11px]">
                      {bannerFormData.mobileImage ? 'Change Mobile Banner' : 'Upload Mobile Banner'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMobileBannerImageUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Mobile Banner Preview Frame */}
                  <div className="mt-2">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block mb-1">
                      Mobile Preview
                    </span>
                    <div className="relative aspect-[9/16] max-h-48 mx-auto w-auto border border-stone-300 bg-stone-900 overflow-hidden flex items-center justify-center shadow-inner">
                      {bannerFormData.mobileImage ? (
                        <img
                          src={getCmsImageUrl(bannerFormData.mobileImage)}
                          alt="Mobile Banner Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : bannerFormData.image ? (
                        <div className="relative w-full h-full">
                          <img
                            src={getCmsImageUrl(bannerFormData.image)}
                            alt="Mobile Fallback Preview"
                            className="w-full h-full object-cover opacity-60"
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-stone-900 bg-white/70 font-bold text-center px-1">
                            Auto-fit from Laptop Banner
                          </span>
                        </div>
                      ) : (
                        <div className="text-stone-400 flex flex-col items-center p-3 text-center">
                          <Smartphone className="w-6 h-6 mb-1 opacity-50" />
                          <span className="text-[11px]">No mobile banner chosen</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-400">
                    If no mobile banner is uploaded, the laptop banner will automatically be used for mobile devices.
                  </p>
                </div>
              </div>

              {/* Text Fields: Title, Button, Link */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {/* Title / Caption */}
               

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
