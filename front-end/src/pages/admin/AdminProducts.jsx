import { useState, useEffect } from 'react'
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
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import {
  AdminEditButton,
  AdminDeleteButton,
  AdminSaveButton,
  AdminCancelButton,
  AdminPagination,
} from '../../components/admin/AdminUI'
import { getCmsImageUrl } from '../../utils/imageHelper'
import { productService } from '../../services/productService'
import notify from '../../utils/toast'
import getSocket from '../../services/socket'

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
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState('basic') // 'basic' | 'variants'
  const [editingProduct, setEditingProduct] = useState(null)
  const [productToDelete, setProductToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
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

  // Load products directly from MongoDB via productService
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await productService.getAll({ limit: 500 })
      const list = data?.products || (Array.isArray(data) ? data : [])
      setProducts(list)
    } catch (err) {
      console.error('Failed to load products:', err)
      notify.error('Could not load products from database')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Listen to WebSocket stock updates from orders placed by customers or other admins
  useEffect(() => {
    const socket = getSocket()
    socket.emit('join:admin')

    const onStockUpdate = () => {
      fetchProducts()
    }

    socket.on('stock:updated', onStockUpdate)
    socket.on('order:new', onStockUpdate)

    return () => {
      socket.off('stock:updated', onStockUpdate)
      socket.off('order:new', onStockUpdate)
    }
  }, [])

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
    setModalTab('basic')
    setFormData({
      title: '',
      category: '',
      sku: '',
      fabric: fabricList[0] || 'Pure Silk',
      weight: '800',
      design: designList[0] || 'Traditional',
      availableColors: colorList.length > 0 ? [colorList[0].name] : ['Red'],
      color: colorList[0]?.name || 'Red',
      description: '',
      price: '',
      originalPrice: '',
      stock: '10',
      lowStockAlert: '2',
      badge: '',
      status: 'Active',
      image: '',
      additionalImages: [],
      // Amazon/Flipkart Multi-Variant Structure
      variants: [
        {
          id: `var-${Date.now()}-1`,
          color: colorList[0]?.name || 'Red',
          hex: colorList[0]?.hex || '#6D021B',
          design: designList[0] || 'Traditional',
          material: fabricList[0] || 'Pure Silk',
          weight: 800,
          price: 1999,
          originalPrice: 2499,
          status: 'Active',
          stock: 10,
          lowStockAlert: 2,
          image: '',
          additionalImages: [],
        },
      ],
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (p) => {
    setEditingProduct(p)
    setErrors({})
    setModalTab('basic')
    const primaryVariant = p.variants?.[0]
    const currentStock = primaryVariant?.stock ?? p.stock ?? p.totalStock ?? 12
    const currentAlert = primaryVariant?.lowStockAlert ?? p.lowStockAlert ?? 3
    const mainImg = p.image || primaryVariant?.image || primaryVariant?.images?.[0] || ''
    const extraImages = (Array.isArray(p.additionalImages) && p.additionalImages.length > 0)
      ? p.additionalImages
      : (Array.isArray(primaryVariant?.images) ? primaryVariant.images.slice(1) : [])

    // Prepare variants array
    let loadedVariants = []
    if (Array.isArray(p.variants) && p.variants.length > 0) {
      loadedVariants = p.variants.map((v, idx) => {
        const foundColor = colorList.find((c) => c.name.toLowerCase() === (v.color || '').toLowerCase())
        const vMain = v.image || (Array.isArray(v.images) ? v.images[0] : '') || ''
        const vExtras = Array.isArray(v.images) && v.images.length > 1 ? v.images.slice(1) : []
        return {
          id: v._id || v.id || `var-${Date.now()}-${idx}`,
          color: v.color || colorList[0]?.name || 'Red',
          hex: v.hex || foundColor?.hex || '#6D021B',
          design: v.design || p.design || 'Traditional',
          material: v.material || p.fabric || 'Pure Silk',
          weight: v.weight || p.weight || 800,
          price: v.price !== undefined ? v.price : (p.price || 1999),
          originalPrice: v.originalPrice !== undefined ? v.originalPrice : (p.originalPrice || 2499),
          status: v.status || p.status || 'Active',
          stock: v.stock !== undefined ? v.stock : 5,
          lowStockAlert: v.lowStockAlert !== undefined ? v.lowStockAlert : 2,
          image: vMain,
          additionalImages: vExtras,
        }
      })
    } else {
      loadedVariants = [
        {
          id: `var-${Date.now()}-1`,
          color: p.color || colorList[0]?.name || 'Red',
          hex: colorList[0]?.hex || '#6D021B',
          design: p.design || 'Traditional',
          material: p.fabric || 'Pure Silk',
          weight: p.weight || 800,
          price: p.price || 1999,
          originalPrice: p.originalPrice || 2499,
          status: p.status || 'Active',
          stock: currentStock,
          lowStockAlert: currentAlert,
          image: mainImg,
          additionalImages: extraImages,
        },
      ]
    }

    setFormData({
      title: p.title || '',
      category: p.category || 'Banarasi',
      sku: p.sku || generateSku(p.category, p.title),
      fabric: p.fabric || primaryVariant?.material || 'Pure Silk',
      weight: (p.weight || primaryVariant?.weight || 800).toString(),
      design: p.design || primaryVariant?.design || 'Traditional',
      availableColors: p.availableColors || loadedVariants.map((v) => v.color),
      color: p.color || primaryVariant?.color || loadedVariants[0]?.color || 'Red',
      description: p.description || 'A handcrafted luxury saree woven with master artisan precision.',
      price: p.price ? p.price.toString() : '',
      originalPrice: p.originalPrice ? p.originalPrice.toString() : (p.price ? (p.price * 1.3).toFixed(0) : ''),
      stock: currentStock.toString(),
      lowStockAlert: currentAlert.toString(),
      badge: p.badge || '',
      status: p.status || 'Active',
      image: mainImg,
      additionalImages: extraImages,
      variants: loadedVariants,
    })
    setIsModalOpen(true)
  }

  // Variant Helpers
  const handleAddVariant = () => {
    const nextColor = colorList[formData.variants?.length % colorList.length] || colorList[0] || { name: 'Red', hex: '#6D021B' }
    const newVariant = {
      id: `var-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      color: nextColor.name,
      hex: nextColor.hex,
      design: formData.design || designList[0] || 'Traditional',
      material: formData.fabric || fabricList[0] || 'Pure Silk',
      weight: Number(formData.weight) || 800,
      price: Number(formData.variants?.[0]?.price) || Number(formData.price) || 1999,
      originalPrice: Number(formData.variants?.[0]?.originalPrice) || Number(formData.originalPrice) || 2499,
      status: formData.status || 'Active',
      stock: 5,
      lowStockAlert: 2,
      image: '',
      additionalImages: [],
    }
    setFormData((prev) => {
      const updated = [...(prev.variants || []), newVariant]
      return {
        ...prev,
        variants: updated,
        availableColors: Array.from(new Set(updated.map((v) => v.color))),
      }
    })
  }

  const handleRemoveVariant = (index) => {
    if ((formData.variants || []).length <= 1) {
      notify.warning('Product must have at least one variant.')
      return
    }
    setFormData((prev) => {
      const updated = prev.variants.filter((_, idx) => idx !== index)
      return {
        ...prev,
        variants: updated,
        availableColors: Array.from(new Set(updated.map((v) => v.color))),
      }
    })
  }

  const handleUpdateVariant = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...(prev.variants || [])]
      if (!updated[index]) return prev
      updated[index] = { ...updated[index], [field]: value }

      // If color changed, sync its hex automatically
      if (field === 'color') {
        const found = colorList.find((c) => c.name.toLowerCase() === String(value).toLowerCase())
        if (found) updated[index].hex = found.hex
      }

      const allColors = Array.from(new Set(updated.map((v) => v.color)))
      return {
        ...prev,
        variants: updated,
        availableColors: allColors,
        color: updated[0]?.color || prev.color,
      }
    })
  }

  const handleVariantImageUpload = (index, e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        handleUpdateVariant(index, 'image', reader.result)
        // If first variant and main product image is empty, set as main image
        if (index === 0 && !formData.image) {
          setFormData((prev) => ({ ...prev, image: reader.result }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVariantAdditionalImagesUpload = (index, e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => {
          const updated = [...(prev.variants || [])]
          if (!updated[index]) return prev
          const curExtras = Array.isArray(updated[index].additionalImages) ? updated[index].additionalImages : []
          if (curExtras.length >= 4) return prev
          updated[index] = {
            ...updated[index],
            additionalImages: [...curExtras, reader.result].slice(0, 4),
          }
          return { ...prev, variants: updated }
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveVariantAdditionalImage = (variantIndex, imageIndex) => {
    setFormData((prev) => {
      const updated = [...(prev.variants || [])]
      if (!updated[variantIndex]) return prev
      const curExtras = Array.isArray(updated[variantIndex].additionalImages) ? updated[variantIndex].additionalImages : []
      updated[variantIndex] = {
        ...updated[variantIndex],
        additionalImages: curExtras.filter((_, i) => i !== imageIndex),
      }
      return { ...prev, variants: updated }
    })
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

  const handleDelete = (productOrId) => {
    // If passed a product object, use it; otherwise find product from list
    const product = typeof productOrId === 'object'
      ? productOrId
      : products.find((p) => (p._id || p.id) === productOrId)
    setProductToDelete(product || { _id: productOrId, title: 'this saree' })
  }

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return
    const id = productToDelete._id || productToDelete.id
    try {
      setIsDeleting(true)
      await productService.delete(id)
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id))
      notify.success('Product deleted successfully')
      setProductToDelete(null)
    } catch (err) {
      console.error('Failed to delete product:', err)
      notify.error('Could not delete product')
    } finally {
      setIsDeleting(false)
    }
  }

  const validateBasicInfo = () => {
    const basicErrors = {}
    if (!formData.title?.trim()) basicErrors.title = 'Saree title is required'
    if (!formData.category?.trim()) basicErrors.category = 'Please select a category'
    if (!formData.fabric?.trim()) basicErrors.fabric = 'Please select a fabric / material'
    if (!formData.description?.trim()) basicErrors.description = 'Product description is required'
    return basicErrors
  }

  const handleNextToVariants = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    const basicErrors = validateBasicInfo()
    if (Object.keys(basicErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...basicErrors }))
      const fieldOrder = ['title', 'category', 'fabric', 'description', 'price']
      const firstInvalidField = fieldOrder.find((f) => basicErrors[f])
      if (firstInvalidField) {
        setTimeout(() => {
          const el = document.getElementById(`field-${firstInvalidField}`)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            if (el.focus && typeof el.focus === 'function') el.focus()
          }
        }, 50)
      }
      return
    }
    setModalTab('variants')
  }

  const handleSave = (e, customStatus) => {
    if (e && e.preventDefault) e.preventDefault()

    // Comprehensive validation for all mandatory fields
    const validationErrors = {}
    if (!formData.title?.trim()) validationErrors.title = 'Saree title is required'
    if (!formData.category?.trim()) validationErrors.category = 'Please select a category'
    if (!formData.fabric?.trim()) validationErrors.fabric = 'Please select a fabric / material'
    if (!formData.description?.trim()) validationErrors.description = 'Product description is required'

    // Check if any variant is missing required fields
    const variants = formData.variants || []
    if (variants.length === 0) {
      validationErrors.variants = 'Please add at least one variant'
    } else {
      const hasInvalidStock = variants.some((v) => v.stock === '' || v.stock === null || isNaN(Number(v.stock)) || Number(v.stock) < 0)
      if (hasInvalidStock) {
        validationErrors.stock = 'All variants must have valid stock (≥ 0)'
      }
      const hasInvalidPrice = variants.some((v) => v.price === '' || v.price === null || isNaN(Number(v.price)) || Number(v.price) <= 0)
      if (hasInvalidPrice) {
        validationErrors.variantPrice = 'Each variant must have a valid selling price (> 0)'
      }
    }

    // Calculate total stock from variants
    const totalVariantStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
    const primaryVariant = variants[0]
    const mainImg = primaryVariant?.image || formData.image || ''

    if (!mainImg && !editingProduct?.image) {
      validationErrors.image = 'At least one variant image or main product image is required'
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)

      // If errors are on basic fields, switch to basic tab
      const basicErrorFields = ['title', 'category', 'fabric', 'description', 'price']
      const hasBasicError = basicErrorFields.some((f) => validationErrors[f])
      if (hasBasicError) {
        setModalTab('basic')
      } else {
        setModalTab('variants')
      }

      const fieldOrder = ['title', 'category', 'fabric', 'description', 'price', 'stock', 'image']
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

    // Clean payload variants: preserve main image + additional 4 images for each variant
    const payloadVariants = (formData.variants || []).map((v) => {
      const vMain = v.image || mainImg
      const vExtras = Array.isArray(v.additionalImages) ? v.additionalImages.filter(Boolean) : []
      const combinedImages = [vMain, ...vExtras].filter(Boolean)
      const vPrice = Number(v.price) > 0 ? Number(v.price) : (Number(formData.price) || 1999)
      const vOriginalPrice = Number(v.originalPrice) > 0 ? Number(v.originalPrice) : (Number(formData.originalPrice) || vPrice)
      const vStatus = v.status || formData.status || 'Active'
      return {
        color: v.color || 'Red',
        hex: v.hex || '#6D021B',
        design: v.design || formData.design || 'Traditional',
        material: v.material || formData.fabric || 'Pure Silk',
        weight: Number(v.weight) || Number(formData.weight) || 800,
        price: vPrice,
        originalPrice: vOriginalPrice,
        status: vStatus,
        stock: Number(v.stock) >= 0 ? Number(v.stock) : 0,
        lowStockAlert: Number(v.lowStockAlert) >= 1 ? Number(v.lowStockAlert) : 2,
        image: vMain,
        images: combinedImages.length > 0 ? combinedImages : [mainImg].filter(Boolean),
      }
    })

    const primaryPrice = payloadVariants[0]?.price || Number(formData.price) || 1999
    const primaryOriginalPrice = payloadVariants[0]?.originalPrice || Number(formData.originalPrice) || primaryPrice

    if (editingProduct) {
      const targetId = editingProduct._id || editingProduct.id
      setProducts((prev) =>
        prev.map((p) =>
          (p._id === targetId || p.id === targetId)
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
                price: primaryPrice,
                originalPrice: primaryOriginalPrice,
                stock: totalVariantStock,
                totalStock: totalVariantStock,
                lowStockAlert: Number(primaryVariant?.lowStockAlert || 3),
                badge: formData.badge,
                status: finalStatus,
                image: mainImg || p.image,
                additionalImages: formData.additionalImages || [],
                variants: payloadVariants,
              }
            : p
        )
      )

      // Persist stock & product update to backend DB
      if (editingProduct._id) {
        productService
          .update(editingProduct._id, {
            title: formData.title,
            category: formData.category,
            price: primaryPrice,
            originalPrice: primaryOriginalPrice,
            description: formData.description,
            badge: formData.badge,
            status: finalStatus,
            image: mainImg,
            variants: payloadVariants,
            totalStock: totalVariantStock,
          })
          .then(() => {
            notify.success('Product and variants updated successfully')
            window.dispatchEvent(new CustomEvent('vastraa:stock-updated'))
          })
          .catch((err) => {
            console.error('Failed to update product in DB:', err)
            notify.error('Could not save product update to database')
          })
      }
    } else {
      // Create new product via API
      productService
        .create({
          title: formData.title,
          category: formData.category,
          price: primaryPrice,
          originalPrice: primaryOriginalPrice,
          description: formData.description,
          badge: formData.badge,
          status: finalStatus,
          image: mainImg,
          variants: payloadVariants,
          totalStock: totalVariantStock,
        })
        .then((created) => {
          const newP = created || {
            id: Date.now(),
            title: formData.title,
            category: formData.category,
            sku: finalSku,
            price: primaryPrice,
            originalPrice: primaryOriginalPrice,
            stock: totalVariantStock,
            totalStock: totalVariantStock,
            image: mainImg,
            variants: payloadVariants,
          }
          setProducts((prev) => [newP, ...prev])
          notify.success('New product with variants created successfully')
          window.dispatchEvent(new CustomEvent('vastraa:stock-updated'))
        })
        .catch((err) => {
          console.error('Failed to create product in DB:', err)
          notify.error(err?.response?.data?.message || 'Could not create product')
        })
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
          <span>Products</span>
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
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-stone-500">
                        <div className="w-7 h-7 border-2 border-[#6D021B]/20 border-t-[#6D021B] rounded-full animate-spin mx-auto mb-2" />
                        <p className="font-semibold text-xs">Loading products...</p>
                      </td>
                    </tr>
                  ) : paginatedProducts.map((product) => {
                    const productId = product._id || product.id
                    const displayImage = getCmsImageUrl(product.image || product.variants?.[0]?.image || product.variants?.[0]?.images?.[0])
                    const displayFabric = product.fabric || product.variants?.[0]?.material || 'Pure Silk'
                    const stock = product.totalStock ?? product.stock ?? product.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) ?? 0

                    return (
                      <tr key={productId} className="hover:bg-[#FFFDF9] transition-colors">
                        {/* Saree Image & Title */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={displayImage}
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
                          {displayFabric}
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4">
                          <div className="font-sans">
                            <span className="font-bold text-[#1F1713]">
                              ₹{(Number(product.price) || 0).toLocaleString('en-IN')}
                            </span>
                            {product.originalPrice && (
                              <span className="block text-[10px] text-stone-400 line-through">
                                ₹{(Number(product.originalPrice) || 0).toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Stock Status */}
                        <td className="py-3 px-4">
                          {product.variants && product.variants.length > 0 ? (
                            <div className="space-y-1.5 min-w-[130px]">
                              {product.variants.map((v, vIdx) => {
                                const vStock = Number(v.stock) || 0
                                const attrLabel = [v.color, v.design].filter(Boolean).join(' • ') || `Variant ${vIdx + 1}`
                                const isOut = vStock === 0
                                const isLow = !isOut && vStock <= (product.lowStockAlert || 3)
                                return (
                                  <div key={v._id || v.id || vIdx} className="flex items-center justify-between gap-2 text-[11px]">
                                    <span className="text-stone-600 truncate max-w-[90px] font-medium" title={attrLabel}>
                                      {attrLabel}:
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded-none font-bold text-[10px] shrink-0 border ${
                                        isOut
                                          ? 'bg-stone-100 text-stone-600 border-stone-300'
                                          : isLow
                                          ? 'bg-red-50 text-red-700 border-red-200'
                                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      }`}
                                    >
                                      {isOut ? 'Out (0)' : isLow ? `Low (${vStock})` : `${vStock} left`}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div>
                              {stock === 0 ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-300">
                                  Out of Stock (0)
                                </span>
                              ) : stock <= (product.lowStockAlert || 3) ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                                  Low Stock ({stock})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-none text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  In Stock ({stock})
                                </span>
                              )}
                            </div>
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
                              onClick={() => handleDelete(product)}
                              title="Delete Saree"
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-stone-500">
                        <AlertCircle className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                        <p className="font-semibold">No sarees found.</p>
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
          <div className="bg-white rounded-none-2xl border border-[#EDE4D8] w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-3.5 border-b border-[#EDE4D8] flex items-center justify-between bg-[#FAF7F2] shrink-0">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="font-normal text-lg font-bold text-[#1F1713]">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
            
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

            {/* Modal Step Navigation Tabs */}
            <div className="px-6 border-b border-[#EDE4D8] bg-white flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setModalTab('basic')}
                className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  modalTab === 'basic'
                    ? 'border-[#6D021B] text-[#6D021B]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  modalTab === 'basic' ? 'bg-[#6D021B] text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  1
                </span>
                <span>Product Basic Information</span>
                {(errors.title || errors.category || errors.fabric || errors.description || errors.price) && (
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </button>

              <button
                type="button"
                onClick={handleNextToVariants}
                className={`py-3 px-4 font-bold text-xs flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  modalTab === 'variants'
                    ? 'border-[#6D021B] text-[#6D021B]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  modalTab === 'variants' ? 'bg-[#6D021B] text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  2
                </span>
                <span>Product Variants</span>
                {(errors.stock || errors.image || errors.variants) && (
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </button>
            </div>

            {/* Modal Body: Left Form (Scrollable) + Right Live Preview */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#EDE4D8]">
              {/* LEFT COLUMN: Form with Step Tabs */}
              <form onSubmit={handleSave} className="lg:col-span-7 xl:col-span-8 p-5 sm:p-6 space-y-6 text-xs">
                {modalTab === 'basic' ? (
                  <>
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

                    {/* 2. Saree Specifications (Shared Defaults) */}
                    <div className="space-y-3">
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
                              const val = e.target.value
                              setFormData((prev) => ({
                                ...prev,
                                fabric: val,
                                variants: (prev.variants || []).map((v, i) => i === 0 && !v.material ? { ...v, material: val } : v),
                              }))
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
                            onChange={(e) => {
                              const val = e.target.value
                              setFormData((prev) => ({
                                ...prev,
                                design: val,
                                variants: (prev.variants || []).map((v, i) => i === 0 && !v.design ? { ...v, design: val } : v),
                              }))
                            }}
                            className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B] bg-white"
                          >
                            <option value="">Select Design</option>
                            {designList.map((dsg) => (
                              <option key={dsg} value={dsg}>{dsg}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* 3. Product Description */}
                    <div className="space-y-3">
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

                    {/* Step 1 Next Button Banner */}
                    <div className="pt-3 border-t border-[#EDE4D8] flex items-center justify-end">
                  
                      <button
                        type="button"
                        onClick={handleNextToVariants}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6D021B] hover:bg-[#580014] text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <span>Next: Add Variants & Stock</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* 5. TAB 2: PRODUCT VARIATIONS & ATTRIBUTES MANAGER */}
                    <div className="space-y-4">
                      {/* Photo recommendation hint */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#FAF7F2] border border-[#EDE4D8] rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-stone-700">
                          <ImageIcon className="w-4 h-4 text-[#6D021B] shrink-0" />
                          <span>
                            <strong>Photo Guide:</strong> Recommended <strong>800 × 1066 px</strong> (3:4 portrait ratio, max 5 MB). JPG / PNG / WebP.
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddVariant}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6D021B] hover:bg-[#580014] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Another Variant</span>
                        </button>
                      </div>

                      {errors.variants && (
                        <p className="text-xs text-red-600 font-semibold">⚠ {errors.variants}</p>
                      )}
                      {errors.stock && (
                        <p className="text-xs text-red-600 font-semibold">⚠ {errors.stock}</p>
                      )}

                      {/* List of Variant Cards (Amazon style) */}
                      <div className="space-y-3">
                        {(formData.variants || []).map((variant, index) => {
                          const colorObj = colorList.find((c) => c.name.toLowerCase() === (variant.color || '').toLowerCase())
                          return (
                            <div
                              key={variant.id || index}
                              className="p-3.5 bg-white border border-[#EDE4D8] rounded-none-xl shadow-2xs hover:border-[#6D021B]/50 transition-all space-y-3 relative group"
                            >
                              {/* Variant Card Top Row */}
                              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-[#6D021B] text-white text-[10px] font-bold flex items-center justify-center">
                                    {index + 1}
                                  </span>
                                  <span className="font-bold text-stone-800 text-xs">
                                    Variant {index + 1}:
                                  </span>
                                  <span
                                    className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 inline-block"
                                    style={{ backgroundColor: colorObj?.hex || variant.hex || '#6D021B' }}
                                  />
                                  <span className="font-semibold text-stone-700 text-xs">
                                    {variant.color || 'Unassigned'} • {variant.design || 'Default Design'}
                                  </span>
                                </div>

                                {(formData.variants || []).length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVariant(index)}
                                    className="text-stone-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer text-xs flex items-center gap-1"
                                    title="Remove variant"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="text-[11px] font-medium hidden sm:inline">Delete</span>
                                  </button>
                                )}
                              </div>

                              {/* Variant Form: [Color, Design, Material, Stock, Alert Stock] */}
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                                {/* 1. Color */}
                                <div>
                                  <label className="block font-bold text-stone-700 mb-1 text-[11px]">
                                    Color <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    value={variant.color}
                                    onChange={(e) => handleUpdateVariant(index, 'color', e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-[#EDE4D8] rounded-none focus:outline-none focus:border-[#6D021B] bg-white text-xs font-medium"
                                  >
                                    {colorList.map((c) => (
                                      <option key={c.name} value={c.name}>
                                        {c.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* 2. Design */}
                                <div>
                                  <label className="block font-bold text-stone-700 mb-1 text-[11px]">
                                    Design
                                  </label>
                                  <select
                                    value={variant.design}
                                    onChange={(e) => handleUpdateVariant(index, 'design', e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-[#EDE4D8] rounded-none focus:outline-none focus:border-[#6D021B] bg-white text-xs font-medium"
                                  >
                                    {designList.map((d) => (
                                      <option key={d} value={d}>
                                        {d}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* 3. Material */}
                                <div>
                                  <label className="block font-bold text-stone-700 mb-1 text-[11px]">
                                    Material <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    value={variant.material}
                                    onChange={(e) => handleUpdateVariant(index, 'material', e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-[#EDE4D8] rounded-none focus:outline-none focus:border-[#6D021B] bg-white text-xs font-medium"
                                  >
                                    {fabricList.map((f) => (
                                      <option key={f} value={f}>
                                        {f}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* 4. Stock Units */}
                                <div>
                                  <label className="block font-bold text-stone-700 mb-1 text-[11px]">
                                    Stock Units <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={variant.stock !== undefined ? variant.stock : ''}
                                    onChange={(e) => handleUpdateVariant(index, 'stock', Number(e.target.value))}
                                    placeholder="5"
                                    className="w-full px-2.5 py-1.5 border border-[#EDE4D8] rounded-none focus:outline-none focus:border-[#6D021B] bg-white font-bold text-[#1F1713] text-xs"
                                  />
                                </div>

                                {/* 5. Alert Stock */}
                                <div>
                                  <label className="block font-bold text-stone-700 mb-1 text-[11px]">
                                    Alert Stock
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={variant.lowStockAlert !== undefined ? variant.lowStockAlert : 2}
                                    onChange={(e) => handleUpdateVariant(index, 'lowStockAlert', Number(e.target.value))}
                                    placeholder="2"
                                    className="w-full px-2.5 py-1.5 border border-[#EDE4D8] rounded-none focus:outline-none focus:border-[#6D021B] bg-white text-stone-700 text-xs"
                                  />
                                </div>
                              </div>

                              {/* Variant Specific Pricing & Status Row */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-stone-100 bg-[#FAF7F2]/50 p-2.5 rounded-none">
                                {/* Variant Selling Price */}
                                <div>
                                  <label className="block font-bold text-stone-700 mb-1 text-[11px]">
                                    Selling Price (₹) <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={variant.price !== undefined ? variant.price : ''}
                                    onChange={(e) => handleUpdateVariant(index, 'price', e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="1999"
                                    className="w-full px-2.5 py-1.5 border border-[#EDE4D8] rounded-none focus:outline-none focus:border-[#6D021B] bg-white font-bold text-[#6D021B] text-xs"
                                  />
                                </div>

                                {/* Variant Original Price */}
                                <div>
                                  <label className="block font-bold text-stone-700 mb-1 text-[11px]">
                                    Original Price (₹)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    value={variant.originalPrice !== undefined ? variant.originalPrice : ''}
                                    onChange={(e) => handleUpdateVariant(index, 'originalPrice', e.target.value === '' ? '' : Number(e.target.value))}
                                    placeholder="2499"
                                    className="w-full px-2.5 py-1.5 border border-[#EDE4D8] rounded-none focus:outline-none focus:border-[#6D021B] bg-white text-stone-700 text-xs"
                                  />
                                </div>

                                {/* Variant Discount Display */}
                                <div>
                                  <label className="block font-bold text-stone-700 mb-1 text-[11px]">
                                    Discount %
                                  </label>
                                  <div className="w-full px-2.5 py-1.5 border border-[#EDE4D8] rounded-none bg-white font-bold text-emerald-700 text-xs flex items-center justify-between h-[31px]">
                                    <span>
                                      {variant.price && variant.originalPrice && Number(variant.originalPrice) > Number(variant.price)
                                        ? `${Math.round(((Number(variant.originalPrice) - Number(variant.price)) / Number(variant.originalPrice)) * 100)}% OFF`
                                        : 'No Discount'}
                                    </span>
                                  </div>
                                </div>

                                {/* Variant Status */}
                                <div>
                                  <label className="block font-bold text-stone-700 mb-1 text-[11px]">
                                    Variant Status
                                  </label>
                                  <select
                                    value={variant.status || 'Active'}
                                    onChange={(e) => handleUpdateVariant(index, 'status', e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-[#EDE4D8] rounded-none focus:outline-none focus:border-[#6D021B] bg-white font-medium text-xs h-[31px]"
                                  >
                                    <option value="Active">Active</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                  </select>
                                </div>
                              </div>

                              {/* Variant Images: Main Image + Up to 4 Additional Angles */}
                              <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center gap-3">
                                {/* Main Variant Photo */}
                                <div className="flex items-center gap-2">
                                  <div className="relative w-14 h-18 rounded-none border border-[#EDE4D8] bg-[#FAF7F2] overflow-hidden shrink-0 group/img flex items-center justify-center">
                                    {variant.image ? (
                                      <>
                                        <img
                                          src={getCmsImageUrl(variant.image)}
                                          alt={`variant-${index}-main`}
                                          className="w-full h-full object-cover"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateVariant(index, 'image', '')}
                                          className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer shadow-xs"
                                          title="Remove photo"
                                        >
                                          ×
                                        </button>
                                      </>
                                    ) : (
                                      <label className="w-full h-full flex flex-col items-center justify-center text-stone-400 hover:text-[#6D021B] cursor-pointer hover:bg-white transition-all text-center p-1">
                                        <Upload className="w-3.5 h-3.5 text-[#DEA53B] mb-0.5" />
                                        <span className="text-[8.5px] font-bold leading-tight">+ Main</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleVariantImageUpload(index, e)}
                                          className="hidden"
                                        />
                                      </label>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="block text-[11px] font-bold text-stone-700">Main Photo <span className="text-red-500">*</span></span>
                                    <span className="block text-[10px] text-stone-400">Ratio 3:4 • 800×1066</span>
                                  </div>
                                </div>

                                {/* Additional 4 Angle Photos */}
                                <div className="flex-1 sm:border-l sm:border-stone-100 sm:pl-3">
                                  <div className="flex items-baseline justify-between mb-1">
                                    <span className="block text-[11px] font-bold text-stone-700">
                                      Additional Photos ({Array.isArray(variant.additionalImages) ? variant.additionalImages.length : 0}/4)
                                    </span>
                                    <span className="text-[10px] text-stone-400">Max 5 MB each</span>
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {(Array.isArray(variant.additionalImages) ? variant.additionalImages : []).map((imgUrl, extraIdx) => (
                                      <div
                                        key={extraIdx}
                                        className="relative w-12 h-14 rounded-none border border-[#EDE4D8] overflow-hidden group/extra shadow-2xs shrink-0"
                                      >
                                        <img
                                          src={getCmsImageUrl(imgUrl)}
                                          alt={`variant-${index}-angle-${extraIdx}`}
                                          className="w-full h-full object-cover"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveVariantAdditionalImage(index, extraIdx)}
                                          className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-600 text-white rounded-full flex items-center justify-center text-[9px] opacity-0 group-hover/extra:opacity-100 transition-opacity cursor-pointer shadow-xs"
                                          title="Remove angle"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ))}

                                    {(!variant.additionalImages || variant.additionalImages.length < 4) && (
                                      <label className="w-12 h-14 rounded-none border border-dashed border-[#DEA53B] hover:border-[#6D021B] bg-[#FAF7F2] hover:bg-white flex flex-col items-center justify-center text-stone-400 hover:text-[#6D021B] cursor-pointer transition-colors shadow-2xs shrink-0">
                                        <Plus className="w-3.5 h-3.5 text-[#DEA53B]" />
                                        <span className="text-[8px] font-semibold mt-0.5">+ Extra</span>
                                        <input
                                          type="file"
                                          accept="image/*"
                                          multiple
                                          onChange={(e) => handleVariantAdditionalImagesUpload(index, e)}
                                          className="hidden"
                                        />
                                      </label>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Step 2 Back Button */}
                    <div className="pt-3 border-t border-[#EDE4D8] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setModalTab('basic')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] border border-[#EDE4D8] hover:bg-stone-100 text-stone-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back to Basic Info</span>
                      </button>

                      <AdminSaveButton onClick={(e) => handleSave(e, 'Active')}>
                        {editingProduct ? 'Update Product' : 'Save Product'}
                      </AdminSaveButton>
                    </div>
                  </>
                )}
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
                      {(() => {
                        const previewImg = formData.variants?.[0]?.image || formData.image
                        return previewImg ? (
                          <img
                            src={getCmsImageUrl(previewImg)}
                            alt={formData.title || 'Preview'}
                            className="w-full h-full object-cover object-center"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
                            <ImageIcon className="w-10 h-10 mb-1" />
                            <span className="text-xs">No image selected</span>
                          </div>
                        )
                      })()}


                      {formData.badge && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="bg-[#6D021B] text-[#DEA53B] text-[9px] tracking-widest uppercase font-bold px-2 py-0.5 shadow-sm border border-[#DEA53B]/50">
                            {formData.badge}
                          </span>
                        </div>
                      )}


               
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
                        {(() => {
                          const previewPrice = formData.variants?.[0]?.price !== undefined && formData.variants?.[0]?.price !== '' ? Number(formData.variants[0].price) : Number(formData.price || 0)
                          const previewOrig = formData.variants?.[0]?.originalPrice !== undefined && formData.variants?.[0]?.originalPrice !== '' ? Number(formData.variants[0].originalPrice) : Number(formData.originalPrice || 0)
                          return (
                            <>
                              <span className="font-bold text-sm text-[#6D021B]">
                                ₹{previewPrice.toLocaleString()}
                              </span>
                              {previewOrig > previewPrice && (
                                <>
                                  <span className="text-[11px] text-stone-400 line-through">
                                    ₹{previewOrig.toLocaleString()}
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-600">
                                    {Math.round(((previewOrig - previewPrice) / previewOrig) * 100)}% OFF
                                  </span>
                                </>
                              )}
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                </div>



              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="px-6 py-3.5 border-t border-[#EDE4D8] bg-[#FAF7F2] flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2">
                {modalTab === 'variants' && (
                  <button
                    type="button"
                    onClick={() => setModalTab('basic')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back to Basic Info</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                {/* Cancel Button */}
                <AdminCancelButton onClick={() => setIsModalOpen(false)} />

                {/* Save / Update Product Button */}
                <AdminSaveButton onClick={(e) => handleSave(e, 'Active')}>
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </AdminSaveButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Theme-styled modal instead of browser alert) */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-none border border-[#EDE4D8] w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0 text-red-600">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-[#1F1713]">
                  Remove Saree from Inventory?
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Are you sure you want to remove{' '}
                  <strong className="text-[#6D021B] font-semibold">
                    "{productToDelete.title || 'this saree'}"
                  </strong>{' '}
                  from inventory? This action will permanently delete all its variant details and cannot be undone.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#EDE4D8]">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-none transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-none transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Remove</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

