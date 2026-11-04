import { useState } from 'react'
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  X,
  Upload,
  Check,
  Tag,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react'
import { allProductsList } from '../user/collections'
import {
  AdminEditButton,
  AdminDeleteButton,
  AdminSaveButton,
  AdminCancelButton,
  AdminPagination,
} from '../../components/admin/AdminUI'

// Curated Color Suggestions dictionary for instant auto-complete
const PRESET_COLOR_SUGGESTIONS = [
  { name: 'Red', hex: '#DC2626' },
  { name: 'Ruby Red', hex: '#9B111E' },
  { name: 'Scarlet', hex: '#FF2400' },
  { name: 'Crimson', hex: '#8A1828' },
  { name: 'Maroon', hex: '#6D021B' },
  { name: 'Deep Maroon', hex: '#520117' },
  { name: 'Wine', hex: '#5B0E2D' },
  { name: 'Burgundy', hex: '#800020' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Rose Pink', hex: '#FB7185' },
  { name: 'Pink', hex: '#D01E69' },
  { name: 'Baby Pink', hex: '#F472B6' },
  { name: 'Hot Pink', hex: '#EC4899' },
  { name: 'Magenta', hex: '#C026D3' },
  { name: 'Fuchsia', hex: '#D946EF' },
  { name: 'Purple', hex: '#7E22CE' },
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Lavender', hex: '#A855F7' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Royal Blue', hex: '#1D4ED8' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Sky Blue', hex: '#38BDF8' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Teal', hex: '#0D9488' },
  { name: 'Turquoise', hex: '#14B8A6' },
  { name: 'Green', hex: '#1B4D3E' },
  { name: 'Bottle Green', hex: '#0F382A' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Olive Green', hex: '#556B2F' },
  { name: 'Mint Green', hex: '#6EE7B7' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Bright Yellow', hex: '#FACC15' },
  { name: 'Mustard Yellow', hex: '#CA8A04' },
  { name: 'Gold', hex: '#DEA53B' },
  { name: 'Antique Gold', hex: '#D4AF37' },
  { name: 'Orange', hex: '#EA580C' },
  { name: 'Peach', hex: '#FB923C' },
  { name: 'Rust', hex: '#C2410C' },
  { name: 'Copper', hex: '#B45309' },
  { name: 'Bronze', hex: '#CD7F32' },
  { name: 'Brown', hex: '#78350F' },
  { name: 'Coffee Brown', hex: '#4A2C11' },
  { name: 'Cream', hex: '#F5EFE6' },
  { name: 'Beige', hex: '#D4C5B9' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Off White', hex: '#FAF9F6' },
  { name: 'Silver', hex: '#9CA3AF' },
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Charcoal', hex: '#374151' },
  { name: 'Black', hex: '#1F1713' },
]

export default function AdminProducts() {
  const [products, setProducts] = useState(allProductsList)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [errors, setErrors] = useState({})

  // Form State for Add / Edit with all comprehensive saree fields
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    sku: '',
    fabric: '',
    weight: '800', // weight in grams
    design: '',
    availableColors: [],
    color: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: '',
    lowStockAlert: '',
    badge: '',
    status: 'Active', // 'Active' | 'Draft' | 'Out of Stock'
    image: '',
    additionalImages: [],
  })

  const [activeTab, setActiveTab] = useState('inventory') // 'inventory' | 'categories' | 'attributes'
  const [currentPage, setCurrentPage] = useState(1)
  const PRODUCTS_PER_PAGE = 8

  // Dynamic Categories that Admin can create & delete
  const [categoryList, setCategoryList] = useState(() => {
    try {
      const saved = localStorage.getItem('vastraa_admin_categories')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    return [
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
  })
  const [newCategoryInput, setNewCategoryInput] = useState('')

  const handleAddCategory = (e) => {
    e.preventDefault()
    if (!newCategoryInput.trim()) return
    const val = newCategoryInput.trim()
    if (!categoryList.some((c) => c.toLowerCase() === val.toLowerCase())) {
      const next = [...categoryList, val]
      setCategoryList(next)
      try {
        localStorage.setItem('vastraa_admin_categories', JSON.stringify(next))
      } catch (err) {
        console.error(err)
      }
    }
    setNewCategoryInput('')
  }

  const handleRemoveCategory = (cat) => {
    if (categoryList.length <= 1) {
      alert('You must have at least one category')
      return
    }
    const next = categoryList.filter((c) => c !== cat)
    setCategoryList(next)
    try {
      localStorage.setItem('vastraa_admin_categories', JSON.stringify(next))
    } catch (err) {
      console.error(err)
    }
  }

  // Dynamic Lists that Admin can create & delete
  const [fabricList, setFabricList] = useState([
    'Pure Katan Silk',
    'Pure Mulberry Silk',
    'Tussar Silk',
    'Tissue Organza',
    'Chanderi Silk Cotton',
    'Georgette Silk',
    'Yeola Paithani Silk',
    'Matka Handloom',
  ])
  const [newFabricInput, setNewFabricInput] = useState('')

  const [designList, setDesignList] = useState([
    'Zari Woven',
    'Temple Border',
    'Brocade Work',
    'Floral Motifs',
    'Heavy Zardozi',
    'Peacock Pallu',
    'Scalloped Border',
    'Traditional Ikat',
  ])
  const [newDesignInput, setNewDesignInput] = useState('')

  const [colorList, setColorList] = useState([
    { name: 'Maroon', hex: '#6D021B' },
    { name: 'Gold', hex: '#DEA53B' },
    { name: 'Green', hex: '#1B4D3E' },
    { name: 'Crimson', hex: '#8A1828' },
    { name: 'Pink', hex: '#D01E69' },
    { name: 'Cream', hex: '#F5EFE6' },
    { name: 'Navy', hex: '#1E3A8A' },
    { name: 'Purple', hex: '#581C87' },
  ])
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#6D021B')
  const [showColorSuggestions, setShowColorSuggestions] = useState(false)

  const handleAddFabric = (e) => {
    e.preventDefault()
    if (!newFabricInput.trim()) return
    const val = newFabricInput.trim()
    if (!fabricList.includes(val)) {
      setFabricList((prev) => [...prev, val])
    }
    setNewFabricInput('')
  }

  const handleRemoveFabric = (fabric) => {
    setFabricList((prev) => prev.filter((f) => f !== fabric))
  }

  const handleAddDesign = (e) => {
    e.preventDefault()
    if (!newDesignInput.trim()) return
    const val = newDesignInput.trim()
    if (!designList.includes(val)) {
      setDesignList((prev) => [...prev, val])
    }
    setNewDesignInput('')
  }

  const handleRemoveDesign = (design) => {
    setDesignList((prev) => prev.filter((d) => d !== design))
  }

  const getColorHex = (input) => {
    if (!input) return null
    const clean = input.trim().toLowerCase()

    const colorMap = {
      yellow: '#EAB308',
      'bright yellow': '#FACC15',
      'mustard yellow': '#CA8A04',
      mustard: '#CA8A04',
      gold: '#DEA53B',
      golden: '#DEA53B',
      'antique gold': '#D4AF37',
      maroon: '#6D021B',
      'deep maroon': '#520117',
      crimson: '#8A1828',
      red: '#DC2626',
      'ruby red': '#9B111E',
      scarlet: '#FF2400',
      green: '#1B4D3E',
      'bottle green': '#0F382A',
      emerald: '#059669',
      'emerald green': '#059669',
      'olive green': '#556B2F',
      olive: '#556B2F',
      mint: '#6EE7B7',
      'mint green': '#6EE7B7',
      pink: '#D01E69',
      'baby pink': '#F472B6',
      'hot pink': '#EC4899',
      magenta: '#C026D3',
      fuchsia: '#D946EF',
      rose: '#F43F5E',
      'rose pink': '#FB7185',
      blue: '#2563EB',
      'royal blue': '#1D4ED8',
      navy: '#1E3A8A',
      'navy blue': '#1E3A8A',
      sky: '#38BDF8',
      'sky blue': '#38BDF8',
      cyan: '#06B6D4',
      teal: '#0D9488',
      turquoise: '#14B8A6',
      purple: '#7E22CE',
      violet: '#8B5CF6',
      lavender: '#A855F7',
      orange: '#EA580C',
      peach: '#FB923C',
      rust: '#C2410C',
      copper: '#B45309',
      bronze: '#CD7F32',
      cream: '#F5EFE6',
      beige: '#D4C5B9',
      ivory: '#FFFFF0',
      white: '#FFFFFF',
      offwhite: '#FAF9F6',
      'off white': '#FAF9F6',
      black: '#1F1713',
      grey: '#6B7280',
      gray: '#6B7280',
      silver: '#9CA3AF',
      brown: '#78350F',
      wine: '#5B0E2D',
    }

    if (colorMap[clean]) return colorMap[clean]

    if (/^#([0-9A-F]{3}){1,2}$/i.test(clean)) {
      if (clean.length === 4) {
        return '#' + clean[1] + clean[1] + clean[2] + clean[2] + clean[3] + clean[3]
      }
      return clean
    }

    try {
      const s = new Option().style
      s.color = clean
      if (s.color) {
        const ctx = document.createElement('canvas').getContext('2d')
        ctx.fillStyle = clean
        const hex = ctx.fillStyle
        if (hex && hex.startsWith('#')) return hex
      }
    } catch (e) { }

    return null
  }

  const handleColorNameChange = (val) => {
    setNewColorName(val)
    setShowColorSuggestions(true)
    const detected = getColorHex(val)
    if (detected) {
      setNewColorHex(detected)
    }
  }

  const handleSelectColorSuggestion = (item) => {
    setNewColorName(item.name)
    setNewColorHex(item.hex)
    setShowColorSuggestions(false)
  }

  const handleAddColor = (e) => {
    e.preventDefault()
    if (!newColorName.trim()) return
    const name = newColorName.trim()
    const finalHex = getColorHex(name) || newColorHex
    if (!colorList.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setColorList((prev) => [...prev, { name, hex: finalHex }])
    }
    setNewColorName('')
    setNewColorHex('#6D021B')
    setShowColorSuggestions(false)
  }

  const handleRemoveColor = (colorName) => {
    setColorList((prev) => prev.filter((c) => c.name !== colorName))
  }

  const categories = ['All', ...categoryList]

  // Filtered products list
  const filtered = products.filter((p) => {
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory
    const matchSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchSearch
  })

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE) || 1
  const paginatedProducts = filtered.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  )

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum)
  }

  const generateSku = (category = 'Banarasi', title = '') => {
    const catCode = category ? category.substring(0, 3).toUpperCase() : 'VAS'
    const cleanTitle = title ? title.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() : 'SAR'
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    return `VAS-${catCode}-${cleanTitle || 'SAR'}-${randomNum}`
  }

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setErrors({})
    setFormData({
      title: '',
      category: '',
      sku: '',
      fabric: '',
      weight: '800',
      design: '',
      availableColors: [],
      color: '',
      description: '',
      price: '',
      originalPrice: '',
      stock: '',
      lowStockAlert: '',
      badge: '',
      status: 'Active',
      image: '',
      additionalImages: [],
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (p) => {
    setEditingProduct(p)
    setErrors({})
    setFormData({
      title: p.title || '',
      category: p.category || 'Banarasi',
      sku: p.sku || generateSku(p.category, p.title),
      fabric: p.fabric || 'Pure Silk',
      weight: p.weight?.toString() || '800',
      design: p.design || 'Zari Woven',
      availableColors: p.availableColors || ['Maroon', 'Gold', 'Green'],
      color: p.color || 'Maroon',



      description: p.description || 'A handcrafted luxury saree woven with master artisan precision.',
      price: p.price ? p.price.toString() : '',
      originalPrice: p.originalPrice ? p.originalPrice.toString() : (p.price ? (p.price * 1.3).toFixed(0) : ''),
      stock: p.stock?.toString() || '12',
      lowStockAlert: p.lowStockAlert?.toString() || '3',
      badge: p.badge || '',
      status: p.status || 'Active',
      image: p.image || '',
      additionalImages: p.additionalImages || [],
    })
    setIsModalOpen(true)
  }

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      files.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            additionalImages: [...prev.additionalImages, reader.result].slice(0, 4),
          }))
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const toggleOccasion = (occ) => {
    setFormData((prev) => {
      const exists = prev.occasions.includes(occ)
      const next = exists ? prev.occasions.filter((o) => o !== occ) : [...prev.occasions, occ]
      return { ...prev, occasions: next.length > 0 ? next : [occ] }
    })
  }

  const toggleColor = (colorName) => {
    setFormData((prev) => {
      const exists = prev.availableColors.includes(colorName)
      const newColors = exists
        ? prev.availableColors.filter((c) => c !== colorName)
        : [...prev.availableColors, colorName]
      return {
        ...prev,
        availableColors: newColors.length > 0 ? newColors : [colorName],
        color: newColors[0] || prev.color,
      }
    })
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this saree from inventory?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const handleSave = (e, customStatus) => {
    if (e && e.preventDefault) e.preventDefault()

    // Comprehensive validation for all mandatory fields
    const validationErrors = {}
    if (!formData.title?.trim()) validationErrors.title = 'Saree title is required'
    if (!formData.category?.trim()) validationErrors.category = 'Please select a category'
    if (!formData.fabric?.trim()) validationErrors.fabric = 'Please select a fabric / material'
    if (!formData.availableColors || formData.availableColors.length === 0) validationErrors.availableColors = 'Please select at least one available color'
    if (!formData.description?.trim()) validationErrors.description = 'Product description is required'
    if (!formData.price || Number(formData.price) <= 0) validationErrors.price = 'Please enter a valid selling price (> 0)'
    if (formData.stock === '' || formData.stock === null || isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      validationErrors.stock = 'Please enter valid stock quantity (≥ 0)'
    }
    if (!formData.lowStockAlert || isNaN(Number(formData.lowStockAlert)) || Number(formData.lowStockAlert) < 1) {
      validationErrors.lowStockAlert = 'Please enter a low stock threshold (≥ 1)'
    }
    if (!formData.image && !editingProduct?.image) {
      validationErrors.image = 'Main product image is required'
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      // Order of field priority to smoothly scroll to the first invalid field
      const fieldOrder = ['title', 'category', 'fabric', 'availableColors', 'description', 'price', 'stock', 'lowStockAlert', 'image']
      const firstInvalidField = fieldOrder.find((f) => validationErrors[f])
      if (firstInvalidField) {
        setTimeout(() => {
          const el = document.getElementById(`field-${firstInvalidField}`)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            if (el.focus && typeof el.focus === 'function') {
              el.focus()
            }
          }
        }, 50)
      }
      return
    }

    setErrors({})

    const finalStatus = customStatus || formData.status || 'Active'
    const finalSku = formData.sku || generateSku(formData.category, formData.title)

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
              ...p,
              title: formData.title,
              category: formData.category,
              sku: finalSku,
              fabric: formData.fabric,
              weight: Number(formData.weight) || 800,
              design: formData.design,
              availableColors: formData.availableColors,
              color: formData.availableColors[0] || formData.color,

              description: formData.description,
              price: Number(formData.price),
              originalPrice: Number(formData.originalPrice || formData.price),
              stock: Number(formData.stock || 0),
              lowStockAlert: Number(formData.lowStockAlert || 3),
              badge: formData.badge,
              status: finalStatus,
              image: formData.image || p.image,
              additionalImages: formData.additionalImages || [],
            }
            : p
        )
      )
    } else {
      const newProduct = {
        id: Date.now(),
        title: formData.title,
        category: formData.category,
        sku: finalSku,
        fabric: formData.fabric,
        weight: Number(formData.weight) || 800,
        design: formData.design,
        availableColors: formData.availableColors,
        color: formData.availableColors[0] || formData.color,

        description: formData.description,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice || formData.price),
        stock: Number(formData.stock || 0),
        lowStockAlert: Number(formData.lowStockAlert || 3),
        badge: formData.badge,
        status: finalStatus,
        rating: 5,
        ratingCount: 1,
        image:
          formData.image ||
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        additionalImages: formData.additionalImages || [],
      }
      setProducts((prev) => [newProduct, ...prev])
    }
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* ─── Page Title & Header Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-normal text-2xl sm:text-3xl font-bold text-[#1F1713]">
            Create Product And Manage Attributes
          </h1>

        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#6D021B] text-white rounded-none-xl text-xs font-semibold shadow-xs hover:bg-[#580115] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#DEA53B]" />
          <span>Add New Saree</span>
        </button>
      </div>

      {/* ─── Top Switcher: Saree Inventory vs Categories vs Attributes Creator ─── */}
      <div className="flex items-center gap-2 border-b border-[#EDE4D8] pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all cursor-pointer rounded-none ${activeTab === 'inventory'
            ? 'bg-[#6D021B] text-white shadow-2xs'
            : 'text-[#73655B] hover:text-[#1F1713] hover:bg-[#FAF7F2]'
            }`}
        >
          <span>Product Inventory</span>
          <span
            className={`text-[10px] px-2 py-0.5 ${activeTab === 'inventory' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
              }`}
          >
            {products.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all cursor-pointer rounded-none ${activeTab === 'categories'
            ? 'bg-[#6D021B] text-white shadow-2xs'
            : 'text-[#73655B] hover:text-[#1F1713] hover:bg-[#FAF7F2]'
            }`}
        >
          <span>Manage Categories</span>
          <span
            className={`text-[10px] px-2 py-0.5 ${activeTab === 'categories' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
              }`}
          >
            {categoryList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attributes')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all cursor-pointer rounded-none ${activeTab === 'attributes'
            ? 'bg-[#6D021B] text-white shadow-2xs'
            : 'text-[#73655B] hover:text-[#1F1713] hover:bg-[#FAF7F2]'
            }`}
        >
          <span>Manage Attributes</span>
        </button>
      </div>

      {/* ─── TAB 1: Saree Inventory Table ─── */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Search & Filters Bar */}
          <div className="bg-white border border-[#EDE4D8] rounded-none-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search by title or category..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B] focus:bg-white text-stone-800"
              />
            </div>

            {/* Category Filter Pills / Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-4 h-4 text-stone-400 shrink-0 hidden sm:block" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EDE4D8] rounded-none-xl text-stone-700 font-medium focus:outline-none focus:border-[#6D021B]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    Category: {c}
                  </option>
                ))}
              </select>

              <span className="text-xs text-stone-500 whitespace-nowrap px-2">
                Showing <strong className="text-stone-800">{filtered.length}</strong> items
              </span>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white border border-[#EDE4D8] rounded-none-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#EDE4D8] text-[#73655B] uppercase font-bold tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Saree Product</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Fabric</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Stock Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDE4D8]/60">
                  {paginatedProducts.map((product) => {
                    const stock = product.stock ?? 12
                    return (
                      <tr key={product.id} className="hover:bg-[#FFFDF9] transition-colors">
                        {/* Saree Image & Title */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-12 h-14 rounded-none-lg object-cover shrink-0 border border-[#EDE4D8] shadow-2xs"
                            />
                            <div className="min-w-0 max-w-xs">
                              <p className="font-bold text-[#1F1713] truncate">{product.title}</p>
                              {product.badge && (
                                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-none-full bg-[#6D021B]/10 text-[#6D021B]">
                                  {product.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-none-lg bg-stone-100 text-stone-700 font-medium">
                            {product.category}
                          </span>
                        </td>

                        {/* Fabric */}
                        <td className="py-3 px-4 text-stone-600 font-light">
                          {product.fabric || 'Pure Handloom Silk'}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4">
                          <div className="font-sans">
                            <span className="font-bold text-[#1F1713]">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {product.originalPrice && (
                              <span className="block text-[10px] text-stone-400 line-through">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Stock Status */}
                        <td className="py-3 px-4">
                          {stock <= 3 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                              Low Stock ({stock})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none-full text-[11px] font-medium bg-emerald-500 text-white ">
                              In Stock ({stock})
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <AdminEditButton
                              onClick={() => handleOpenEdit(product)}
                              title="Edit Saree"
                            />
                            <AdminDeleteButton
                              onClick={() => handleDelete(product.id)}
                              title="Delete Saree"
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-stone-500">
                        <AlertCircle className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                        <p className="font-semibold">No sarees found matching your query.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Matching Site Consistency */}
            <AdminPagination
              currentPage={currentPage}
              totalCount={filtered.length}
              pageSize={PRODUCTS_PER_PAGE}
              onPageChange={handlePageChange}
              itemName="sarees"
            />
          </div>
        </div>
      )}



      {/* ─── TAB 2: Manage Categories (Name Only, Live Reflect in Products) ─── */}
      {activeTab === 'categories' && (
        <div className="bg-white border border-[#EDE4D8] p-6 shadow-2xs space-y-5 rounded-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#EDE4D8]">
            <div>
              <h2 className="font-normal text-lg font-bold text-[#1F1713]">
                Product Categories 
              </h2>

            </div>
            <div className="text-xs font-semibold text-stone-600 bg-[#FAF7F2] px-3 py-1.5 border border-[#EDE4D8]">
              Total Categories: <strong className="text-[#6D021B]">{categoryList.length}</strong>
            </div>
          </div>

          {/* Add Category Form (Only Name, No Description Needed) */}
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
            <div className="flex-1">
              <input
                type="text"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                placeholder="Enter new category name (e.g. Georgette, Bandhani, Tissue)..."
                className="w-full px-4 py-2.5 text-xs border border-[#EDE4D8] focus:outline-none focus:border-[#6D021B] bg-[#FAF7F2] font-medium rounded-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#6D021B] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#580115] cursor-pointer transition-colors shrink-0 shadow-xs rounded-none"
            >
              + Add Category
            </button>
          </form>

          {/* Category Chips List */}
          <div className="pt-4 border-t border-[#EDE4D8]/70">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Active Category Names ({categoryList.length})
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {categoryList.map((cat) => {
                const assignedCount = products.filter((p) => p.category === cat).length

                return (
                  <div
                    key={cat}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#FAF7F2] border border-[#EDE4D8] text-xs font-semibold text-stone-800 rounded-none group hover:border-[#6D021B] transition-colors"
                  >
                    <span>{cat}</span>
                    <span className="text-[10px] text-stone-400 bg-white px-1.5 py-0.2 border border-stone-200">
                      {assignedCount} items
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer ml-1"
                      title={`Remove ${cat} category`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: Dynamic Attribute Creator (Fabrics, Designs, Colors) ─── */}
      {activeTab === 'attributes' && (
        <div className="space-y-6">


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* 1. Fabric / Material Creator Card */}
            <div className="bg-white border border-[#EDE4D8] rounded-none-2xl p-5 shadow-2xs space-y-4">
              <div>

                <h3 className="font-normal text-base font-bold text-[#1F1713]">
                  Material
                </h3>
                <p className="text-xs text-[#73655B] mt-0.5">
                  Weave and thread materials ({fabricList.length} total)
                </p>
              </div>

              {/* Add Fabric Form */}
              <form onSubmit={handleAddFabric} className="flex gap-2">
                <input
                  type="text"
                  value={newFabricInput}
                  onChange={(e) => setNewFabricInput(e.target.value)}
                  placeholder="e.g. Pure Muga Silk"
                  className="flex-1 px-3 py-1.5 text-xs border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B] bg-[#FAF7F2]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#6D021B] text-white rounded-none-xl text-xs font-semibold hover:bg-[#580115] shrink-0 cursor-pointer"
                >
                  Add
                </button>
              </form>

              {/* Fabric List Chips */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EDE4D8]/60 max-h-60 overflow-y-auto">
                {fabricList.map((fabric) => (
                  <span
                    key={fabric}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none-xl text-xs font-medium bg-[#FAF7F2] border border-[#EDE4D8] text-stone-800 group"
                  >
                    <span>{fabric}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFabric(fabric)}
                      className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove fabric"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 2. Design / Border Style Creator Card */}
            <div className="bg-white border border-[#EDE4D8] rounded-none-2xl p-5 shadow-2xs space-y-4">
              <div>

                <h3 className="font-normal text-base font-bold text-[#1F1713]">
                  Design
                </h3>
                <p className="text-xs text-[#73655B] mt-0.5">
                  Pallu, border, and zari patterns ({designList.length} total)
                </p>
              </div>

              {/* Add Design Form */}
              <form onSubmit={handleAddDesign} className="flex gap-2">
                <input
                  type="text"
                  value={newDesignInput}
                  onChange={(e) => setNewDesignInput(e.target.value)}
                  placeholder="e.g. Lotus Weave Motif"
                  className="flex-1 px-3 py-1.5 text-xs border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B] bg-[#FAF7F2]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#6D021B] text-white rounded-none-xl text-xs font-semibold hover:bg-[#580115] shrink-0 cursor-pointer"
                >
                  Add
                </button>
              </form>

              {/* Design List Chips */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EDE4D8]/60 max-h-60 overflow-y-auto">
                {designList.map((design) => (
                  <span
                    key={design}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none-xl text-xs font-medium bg-[#FAF7F2] border border-[#EDE4D8] text-stone-800"
                  >
                    <span>{design}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDesign(design)}
                      className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove design"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Available Colors Creator Card with Auto Color Recognition */}
            <div className="bg-white border border-[#EDE4D8] rounded-none-2xl p-5 shadow-2xs space-y-4">
              <div>

                <h3 className="font-normal text-base font-bold text-[#1F1713]">
                  Available Colors
                </h3>
                <p className="text-xs text-[#73655B] mt-0.5">
                  Color palette swatches ({colorList.length} total)
                </p>
              </div>

              {/* Add Color Form */}
              <form onSubmit={handleAddColor} className="space-y-2 relative">
                <div className="flex items-center gap-2">
                  {/* Dynamic Color Box / Picker */}
                  <div className="relative shrink-0">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => {
                        setNewColorHex(e.target.value)
                        setShowColorSuggestions(false)
                      }}
                      className="w-10 h-8 rounded-none-lg cursor-pointer border border-[#EDE4D8] p-0.5 bg-white shadow-2xs"
                      title="Pick color or type name to auto-detect"
                    />
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      required
                      value={newColorName}
                      onChange={(e) => handleColorNameChange(e.target.value)}
                      onFocus={() => {
                        if (newColorName.trim()) setShowColorSuggestions(true)
                      }}
                      placeholder="Type color (e.g. yellow, pink, gold)..."
                      className="w-full px-3 py-1.5 text-xs border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B] bg-[#FAF7F2]"
                    />

                    {/* Auto-suggest dropdown when typing */}
                    {showColorSuggestions && newColorName.trim() && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-none-xl shadow-xl border border-[#EDE4D8] overflow-hidden z-30 max-h-48 overflow-y-auto divide-y divide-stone-100">
                        {PRESET_COLOR_SUGGESTIONS.filter((c) =>
                          c.name.toLowerCase().includes(newColorName.trim().toLowerCase())
                        ).length > 0 ? (
                          PRESET_COLOR_SUGGESTIONS.filter((c) =>
                            c.name.toLowerCase().includes(newColorName.trim().toLowerCase())
                          ).map((item) => (
                            <button
                              key={item.name}
                              type="button"
                              onClick={() => handleSelectColorSuggestion(item)}
                              className="w-full px-3 py-1.5 text-left flex items-center justify-between text-xs hover:bg-[#FAF4EC] transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3.5 h-3.5 rounded-none-full border border-black/15 shadow-2xs shrink-0"
                                  style={{ backgroundColor: item.hex }}
                                />
                                <span className="font-medium text-stone-800 group-hover:text-[#6D021B]">
                                  {item.name}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-stone-400 uppercase">
                                {item.hex}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-center text-[11px] text-stone-400">
                            Custom color: will use {newColorHex}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#6D021B] text-white rounded-none-xl text-xs font-semibold hover:bg-[#580115] shrink-0 cursor-pointer shadow-2xs"
                  >
                    Add
                  </button>
                </div>
                <p className="text-[10px] text-stone-400">
                  Tip: Typing any color (yellow, pink, green, cyan) automatically suggests matching shades and auto-detects the color!
                </p>
              </form>

              {/* Colors List Chips */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EDE4D8]/60 max-h-60 overflow-y-auto">
                {colorList.map((col) => (
                  <span
                    key={col.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-none-xl text-xs font-medium bg-[#FAF7F2] border border-[#EDE4D8] text-stone-800"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-none-full border border-black/10 shrink-0"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span>{col.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(col.name)}
                      className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer ml-1"
                      title="Remove color"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-none-2xl border border-[#EDE4D8] w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-fade-in">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EDE4D8] flex items-center justify-between bg-[#FAF7F2] shrink-0">
              <div className="flex items-center gap-3">

                <div>
                  <h2 className="font-normal text-lg font-bold text-[#1F1713]">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    Fields marked with <span className="text-red-500 font-bold">*</span> are mandatory.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-none-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Left Form (Scrollable) + Right Live Preview */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#EDE4D8]">
              {/* LEFT COLUMN: 6 Product Information Sections (lg:col-span-7 xl:col-span-8) */}
              <form onSubmit={handleSave} className="lg:col-span-7 xl:col-span-8 p-5 sm:p-6 space-y-6 text-xs">
                {/* 1. Basic Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-[#EDE4D8]">
                    <h3 className="font-normal text-sm font-bold text-[#1F1713] uppercase tracking-wider">
                      Basic Information
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* Saree Title */}
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        1. Saree Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="field-title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => {
                          const val = e.target.value
                          setFormData((prev) => ({
                            ...prev,
                            title: val,
                            sku: prev.sku || generateSku(prev.category, val),
                          }))
                          if (errors.title) setErrors((prev) => ({ ...prev, title: null }))
                        }}
                        placeholder="e.g. Royal Maroon Katan Silk Banarasi Saree"
                        className={`w-full px-3 py-2 border rounded-none-xl focus:outline-none bg-white font-medium transition-colors ${errors.title ? 'border-red-500 ring-2 ring-red-100 bg-red-50/20' : 'border-[#EDE4D8] focus:border-[#6D021B]'
                          }`}
                      />
                      {errors.title && (
                        <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                          ⚠ {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Category & SKU */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">
                          2. Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="field-category"
                          value={formData.category}
                          onChange={(e) => {
                            const cat = e.target.value
                            setFormData((prev) => ({
                              ...prev,
                              category: cat,
                              sku: cat ? generateSku(cat, prev.title) : '',
                            }))
                            if (errors.category) setErrors((prev) => ({ ...prev, category: null }))
                          }}
                          className={`w-full px-3 py-2 border rounded-none-xl focus:outline-none bg-white font-medium transition-colors ${errors.category ? 'border-red-500 ring-2 ring-red-100 bg-red-50/20' : 'border-[#EDE4D8] focus:border-[#6D021B]'
                            }`}
                        >
                          <option value="">Select Category</option>
                          {categories.filter((c) => c !== 'All').map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        {errors.category && (
                          <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                            ⚠ {errors.category}
                          </p>
                        )}
                      </div>


                    </div>
                  </div>
                </div>

                {/* 2. Saree Specifications */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-[#EDE4D8]">
                    <h3 className="font-normal text-sm font-bold text-[#1F1713] uppercase tracking-wider">
                      Saree Specifications
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Fabric */}
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Fabric / Material <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="field-fabric"
                        value={formData.fabric}
                        onChange={(e) => {
                          setFormData({ ...formData, fabric: e.target.value })
                          if (errors.fabric) setErrors((prev) => ({ ...prev, fabric: null }))
                        }}
                        className={`w-full px-3 py-2 border rounded-none-xl focus:outline-none bg-white transition-colors ${errors.fabric ? 'border-red-500 ring-2 ring-red-100 bg-red-50/20' : 'border-[#EDE4D8] focus:border-[#6D021B]'
                          }`}
                      >
                        <option value="">Select Fabric</option>
                        {fabricList.map((fab) => (
                          <option key={fab} value={fab}>{fab}</option>
                        ))}
                      </select>
                      {errors.fabric && (
                        <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                          ⚠ {errors.fabric}
                        </p>
                      )}
                    </div>

                    {/* Design */}
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Design
                      </label>
                      <select
                        value={formData.design}
                        onChange={(e) => setFormData({ ...formData, design: e.target.value })}
                        className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B] bg-white"
                      >
                        <option value="">Select Design</option>
                        {designList.map((dsg) => (
                          <option key={dsg} value={dsg}>{dsg}</option>
                        ))}
                      </select>
                    </div>



                  </div>

                  {/* 6. Available Colors (Multi-Select) */}
                  <div className="pt-1" id="field-availableColors" tabIndex="-1">
                    <label className="block font-bold text-stone-700 mb-1">
                      Available Colors <span className="text-red-500">*</span> ({formData.availableColors.length} selected)
                    </label>
                    <div className={`flex items-center gap-2 pt-1 pb-1 flex-wrap rounded-none-xl transition-all ${errors.availableColors ? 'p-2 border border-red-500 bg-red-50/20' : ''
                      }`}>
                      {colorList.map((col) => {
                        const isSelected = formData.availableColors.includes(col.name)
                        return (
                          <button
                            key={col.name}
                            type="button"
                            onClick={() => {
                              toggleColor(col.name)
                              if (errors.availableColors) setErrors((prev) => ({ ...prev, availableColors: null }))
                            }}
                            title={`${col.name} ${isSelected ? '(Selected)' : ''}`}
                            className={`relative px-2.5 py-1 rounded-none-lg border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${isSelected
                              ? 'border-[#6D021B] bg-[#6D021B]/5 text-[#6D021B] font-bold shadow-2xs'
                              : 'border-[#EDE4D8] bg-[#FAF7F2] text-stone-600 hover:border-stone-400'
                              }`}
                          >
                            <span
                              className="w-3 h-3 rounded-none-full border border-black/15 shadow-2xs shrink-0"
                              style={{ backgroundColor: col.hex }}
                            />
                            <span>{col.name}</span>
                            {isSelected && <span className="text-[#6D021B] text-[10px]">✓</span>}
                          </button>
                        )
                      })}
                    </div>
                    {errors.availableColors && (
                      <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                        ⚠ {errors.availableColors}
                      </p>
                    )}
                  </div>


                </div>

                {/* 3. Product Description */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-[#EDE4D8]">
                    <h3 className="font-normal text-sm font-bold text-[#1F1713] uppercase tracking-wider">
                      Product Description
                    </h3>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      Product Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="field-description"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value })
                        if (errors.description) setErrors((prev) => ({ ...prev, description: null }))
                      }}
                      placeholder="Tell customers about the weave, zari quality, motifs, styling suggestions..."
                      className={`w-full px-3 py-2 border rounded-none-xl focus:outline-none bg-white leading-relaxed transition-colors ${errors.description ? 'border-red-500 ring-2 ring-red-100 bg-red-50/20' : 'border-[#EDE4D8] focus:border-[#6D021B]'
                        }`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                        ⚠ {errors.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* 4. Pricing Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-[#EDE4D8]">
                    <h3 className="font-normal text-sm font-bold text-[#1F1713] uppercase tracking-wider">
                      Pricing Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Selling Price */}
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Selling Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="field-price"
                        type="number"
                        min="1"
                        value={formData.price}
                        onChange={(e) => {
                          setFormData({ ...formData, price: e.target.value })
                          if (errors.price) setErrors((prev) => ({ ...prev, price: null }))
                        }}
                        placeholder="7499"
                        className={`w-full px-3 py-2 border rounded-none-xl focus:outline-none bg-white font-bold text-stone-800 transition-colors ${errors.price ? 'border-red-500 ring-2 ring-red-100 bg-red-50/20' : 'border-[#EDE4D8] focus:border-[#6D021B]'
                          }`}
                      />
                      {errors.price && (
                        <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                          ⚠ {errors.price}
                        </p>
                      )}
                    </div>

                    {/* Original Price */}
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Original Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        placeholder="9999"
                        className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B] bg-white"
                      />
                    </div>

                    {/* Discount (Auto-calculated) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-stone-700">
                          Discount %
                        </label>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase bg-emerald-50 px-1.5 py-0.5 rounded-none">
                          Auto-calculated
                        </span>
                      </div>
                      <div className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl bg-[#FAF7F2] font-bold text-emerald-700 flex items-center justify-between">
                        <span>
                          {formData.price && formData.originalPrice && Number(formData.originalPrice) > Number(formData.price)
                            ? `${Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)}% OFF`
                            : 'No Discount'}
                        </span>
                        {formData.price && formData.originalPrice && Number(formData.originalPrice) > Number(formData.price) && (
                          <span className="text-[10px] font-normal text-stone-500">
                            Save ₹{Number(formData.originalPrice) - Number(formData.price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Inventory Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-[#EDE4D8]">
                    <h3 className="font-normal text-sm font-bold text-[#1F1713] uppercase tracking-wider">
                      Inventory Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Stock Units */}
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Stock Units <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="field-stock"
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={(e) => {
                          setFormData({ ...formData, stock: e.target.value })
                          if (errors.stock) setErrors((prev) => ({ ...prev, stock: null }))
                        }}
                        placeholder="15"
                        className={`w-full px-3 py-2 border rounded-none-xl focus:outline-none bg-white font-medium transition-colors ${errors.stock ? 'border-red-500 ring-2 ring-red-100 bg-red-50/20' : 'border-[#EDE4D8] focus:border-[#6D021B]'
                          }`}
                      />
                      {errors.stock && (
                        <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                          ⚠ {errors.stock}
                        </p>
                      )}
                    </div>

                    {/* Low Stock Alert */}
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Low Stock Alert <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="field-lowStockAlert"
                        type="number"
                        min="1"
                        value={formData.lowStockAlert}
                        onChange={(e) => {
                          setFormData({ ...formData, lowStockAlert: e.target.value })
                          if (errors.lowStockAlert) setErrors((prev) => ({ ...prev, lowStockAlert: null }))
                        }}
                        placeholder="3"
                        className={`w-full px-3 py-2 border rounded-none-xl focus:outline-none bg-white transition-colors ${errors.lowStockAlert ? 'border-red-500 ring-2 ring-red-100 bg-red-50/20' : 'border-[#EDE4D8] focus:border-[#6D021B]'
                          }`}
                      />
                      {errors.lowStockAlert && (
                        <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                          ⚠ {errors.lowStockAlert}
                        </p>
                      )}
                    </div>

                    {/* Product Weight (in grams) for Shipping Cost Calculation */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-stone-700">
                          Weight (in grams) <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] text-stone-400">
                          {formData.weight ? `${(Number(formData.weight) / 1000).toFixed(2)} kg` : ''}
                        </span>
                      </div>
                      <input
                        id="field-weight"
                        type="number"
                        min="50"
                        step="50"
                        value={formData.weight}
                        onChange={(e) => {
                          setFormData({ ...formData, weight: e.target.value })
                        }}
                        placeholder="800"
                        className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B] bg-white font-medium"
                      />
                      <span className="text-[10px] text-stone-400 mt-0.5 block">
                        Used for weight-based shipping calculation
                      </span>
                    </div>



                    {/* Status */}
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Product Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B] bg-white font-medium"
                      >
                        <option value="Active">Active</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 6. Product Images */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-[#EDE4D8]">
                    <h3 className="font-normal text-sm font-bold text-[#1F1713] uppercase tracking-wider">
                      Product Images
                    </h3>
                  </div>

                  {/* 18. Main Image & 20. URL */}
                  <div id="field-image" tabIndex="-1" className={`p-3 bg-[#FAF7F2] border rounded-none-xl space-y-2.5 transition-all ${errors.image ? 'border-red-500 ring-2 ring-red-100 bg-red-50/20' : 'border-[#EDE4D8]'
                    }`}>
                    <label className="block font-bold text-stone-700">
                      Main Product Image <span className="text-red-500">*</span>
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <label className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 border border-dashed border-[#DEA53B] hover:border-[#6D021B] rounded-none-xl bg-white hover:bg-[#FFFDF9] text-[#6D021B] cursor-pointer transition-all shadow-2xs shrink-0">
                        <Upload className="w-4 h-4 text-[#DEA53B]" />
                        <span className="font-bold text-xs">{formData.image ? 'Change Main Image' : 'Upload Main Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            handleImageFileChange(e)
                            if (errors.image) setErrors((prev) => ({ ...prev, image: null }))
                          }}
                          className="hidden"
                        />
                      </label>

                      {formData.image && (
                        <div className="relative w-16 h-20 rounded-none-lg border border-[#EDE4D8] overflow-hidden group shadow-2xs shrink-0">
                          <img
                            src={formData.image}
                            alt="Main preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                            title="Remove image"
                            className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-none-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                    {errors.image && (
                      <p className="mt-1 text-[11px] text-red-600 font-semibold flex items-center gap-1">
                        ⚠ {errors.image}
                      </p>
                    )}
                  </div>

                  {/* 19. Additional Product Images */}
                  <div className="p-3 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-stone-700">
                        Additional Product Images
                      </label>
                      <span className="text-[10px] text-stone-400">Up to 4 extra photos</span>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {formData.additionalImages.map((imgUrl, i) => (
                        <div key={i} className="relative w-16 h-20 rounded-none-lg border border-[#EDE4D8] overflow-hidden group shadow-2xs">
                          <img src={imgUrl} alt={`angle-${i}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                additionalImages: prev.additionalImages.filter((_, idx) => idx !== i),
                              }))
                            }
                            className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-none-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      {formData.additionalImages.length < 4 && (
                        <label className="w-16 h-20 rounded-none-lg border border-dashed border-[#DEA53B] hover:border-[#6D021B] bg-white flex flex-col items-center justify-center text-stone-400 hover:text-[#6D021B] cursor-pointer transition-colors shadow-2xs">
                          <Plus className="w-4 h-4 text-[#DEA53B]" />
                          <span className="text-[9px] mt-0.5 font-semibold">+ Add</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleAdditionalImagesChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </form>

              {/* RIGHT COLUMN: 7. Live Product Preview Card (lg:col-span-5 xl:col-span-4) */}
              <div className="lg:col-span-5 xl:col-span-4 p-5 sm:p-6 bg-[#FAF7F2]/60 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 pb-2 border-b border-[#EDE4D8] mb-4">
                    <h3 className="font-normal text-sm font-bold text-[#1F1713] uppercase tracking-wider">
                      Live Product Preview
                    </h3>
                  </div>

                  {/* Interactive Saree Card Preview matching storefront */}
                  <div className="bg-white border border-[#E8DDCE] rounded-none-none overflow-hidden shadow-lg mx-auto max-w-[280px]">
                    {/* 21. Saree Image Preview */}
                    <div className="relative aspect-[3/4] w-full bg-[#F5EFE6] overflow-hidden">
                      {formData.image ? (
                        <img
                          src={formData.image}
                          alt={formData.title || 'Preview'}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
                          <ImageIcon className="w-10 h-10 mb-1" />
                          <span className="text-xs">No image selected</span>
                        </div>
                      )}


                      {formData.badge && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="bg-[#6D021B] text-[#DEA53B] text-[9px] tracking-widest uppercase font-bold px-2 py-0.5 shadow-sm border border-[#DEA53B]/50">
                            {formData.badge}
                          </span>
                        </div>
                      )}

                      {/* 30. Stock Status badge */}
                      <div className="absolute top-2 right-2 z-10">
                        <span
                          className={`text-[8.5px] uppercase font-bold px-1.5 py-0.5 rounded-none shadow-sm ${formData.status === 'Draft'
                            ? 'bg-amber-100 text-amber-800'
                            : Number(formData.stock) <= 0
                              ? 'bg-red-600 text-white'
                              : Number(formData.stock) <= Number(formData.lowStockAlert || 3)
                                ? 'bg-orange-500 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                        >
                          {formData.status === 'Draft'
                            ? 'Draft'
                            : Number(formData.stock) <= 0
                              ? 'Out of Stock'
                              : Number(formData.stock) <= Number(formData.lowStockAlert || 3)
                                ? `Low (${formData.stock})`
                                : `In Stock (${formData.stock})`}
                        </span>
                      </div>
                    </div>

                    {/* Card Content Details */}
                    <div className="p-3.5 space-y-2">
                      {/* 23. Category & 24. Fabric */}
                      <div className="flex items-center justify-between text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                        <span>{formData.category || 'Category'}</span>
                        <span className="text-[#6D021B]">{formData.fabric || 'Fabric'}</span>
                      </div>

                      {/* 22. Saree Title */}
                      <h4 className="font-normal text-sm font-bold text-[#1F1713] line-clamp-1 leading-snug">
                        {formData.title || 'Untitled Royal Saree'}
                      </h4>

                      {/* 25. Available Colors */}
                      <div className="flex items-center gap-1 pt-0.5">
                        <span className="text-[10px] text-stone-400 mr-1">Colors:</span>
                        {formData.availableColors.slice(0, 5).map((cName) => {
                          const colObj = colorList.find((c) => c.name === cName)
                          return (
                            <span
                              key={cName}
                              title={cName}
                              className="w-3 h-3 rounded-none-full border border-black/15 shadow-2xs inline-block"
                              style={{ backgroundColor: colObj?.hex || '#6D021B' }}
                            />
                          )
                        })}
                        {formData.availableColors.length > 5 && (
                          <span className="text-[9px] text-stone-400">+{formData.availableColors.length - 5}</span>
                        )}
                      </div>

                      {/* 26. Price, 27. Original Price, 28. Discount */}
                      <div className="flex items-baseline gap-2 pt-1 border-t border-stone-100">
                        <span className="font-bold text-sm text-[#6D021B]">
                          ₹{formData.price ? Number(formData.price).toLocaleString() : '0'}
                        </span>
                        {formData.originalPrice && Number(formData.originalPrice) > Number(formData.price) && (
                          <>
                            <span className="text-[11px] text-stone-400 line-through">
                              ₹{Number(formData.originalPrice).toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600">
                              {Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)}% OFF
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>



              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="px-6 py-3.5 border-t border-[#EDE4D8] bg-[#FAF7F2] flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                {/* Cancel Button */}
                <AdminCancelButton onClick={() => setIsModalOpen(false)} />

                {/* Save / Update Product */}
                <AdminSaveButton onClick={(e) => handleSave(e, 'Active')}>
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </AdminSaveButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

