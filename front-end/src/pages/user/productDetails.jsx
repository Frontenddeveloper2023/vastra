import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { RotateCcw, Share2, Check, Copy } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { useSettings } from '../../context/SettingsContext'
import productService from '../../services/productService'
import { getCmsImageUrl } from '../../utils/imageHelper'
import { getSocket } from '../../services/socket'
import notify from '../../utils/toast'

// Fallback Asset Imports in case DB product has no images
import arrival1 from '../../assets/products/arrival-1.jpg'
import arrival2 from '../../assets/products/arrival-2.jpg'
import arrival3 from '../../assets/products/arrival-3.jpg'
import arrival4 from '../../assets/products/arrival-4.jpg'
import banarasi1 from '../../assets/featured/banarasi-1.jpg'
import banarasi2 from '../../assets/featured/banarasi-2.jpg'
import banarasi3 from '../../assets/featured/banarasi-3.jpg'
import banarasi4 from '../../assets/featured/banarasi-4.jpg'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cartItems, addToCart } = useCart()
  const { isAuthenticated, openAuthModal } = useCustomerAuth()
  const { settings } = useSettings()

  // Return policy toggle and days
  const isReturnsEnabled = settings?.returnPolicy?.enabled !== false
  const globalReturnDays = settings?.returnPolicy?.returnWindowDays || 7

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [activeImage, setActiveImage] = useState('')
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedDesign, setSelectedDesign] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [addedAnimation, setAddedAnimation] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Social sharing handlers (Max 4: WhatsApp, Facebook, X/Twitter, Copy Link)
  const handleShare = (platform) => {
    const currentUrl = window.location.href
    const title = product?.name || 'Exclusive Luxury Saree from Vastraa'
    const text = `Check out this gorgeous saree: ${title}`

    if (platform === 'whatsapp') {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + currentUrl)}`
      window.open(waUrl, '_blank', 'noopener,noreferrer')
    } else if (platform === 'facebook') {
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
      window.open(fbUrl, '_blank', 'noopener,noreferrer,width=600,height=500')
    } else if (platform === 'instagram') {
      // Instagram doesn't provide a public direct share URL; copy link and redirect to Instagram
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(currentUrl).catch(() => {})
      }
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    } else if (platform === 'twitter') {
      const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(text)}`
      window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=600,height=500')
    } else if (platform === 'copy') {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(currentUrl).then(() => {
          setCopiedLink(true)
          setTimeout(() => setCopiedLink(false), 2500)
        }).catch(() => {
          fallbackCopyText(currentUrl)
        })
      } else {
        fallbackCopyText(currentUrl)
      }
    }
  }

  const fallbackCopyText = (text) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2500)
    } catch {
      // ignore
    }
    document.body.removeChild(textArea)
  }

  // Fetch real product by ID from MongoDB
  const fetchProduct = useCallback((isInitial = false) => {
    if (isInitial) setLoading(true)
    return productService
      .getById(id)
      .then((data) => {
        setProduct(data)
        if (isInitial) {
          // If variants exist, default to first variant's attributes
          if (data?.variants && data.variants.length > 0) {
            const v0 = data.variants[0]
            setSelectedVariantIndex(0)
            setSelectedColor(v0.color || '')
            setSelectedDesign(v0.design || '')
            setSelectedMaterial(v0.material || '')
            const v0Imgs = (v0.images && v0.images.length > 0) ? v0.images : (v0.image ? [v0.image] : [])
            const firstImg = v0Imgs[0] || data.image || arrival1
            setActiveImage(getCmsImageUrl(firstImg))
          } else {
            setActiveImage(getCmsImageUrl(data?.image || arrival1))
          }

          // Fetch related products in the same category
          if (data?.category) {
            productService
              .getAll({ category: data.category, limit: 5, status: 'Active' })
              .then((relData) => {
                const list = Array.isArray(relData) ? relData : relData?.products || []
                setRelatedProducts(list.filter((p) => String(p._id || p.id) !== String(id)).slice(0, 4))
              })
              .catch(() => {})
          }
        }
      })
      .catch((err) => {
        console.error('Failed to fetch product details:', err)
      })
      .finally(() => {
        if (isInitial) setLoading(false)
      })
  }, [id])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    fetchProduct(true)

    // Listen to real-time stock updates via WebSocket
    const socket = getSocket()
    const handleStockUpdate = (payload) => {
      // If current product ID is affected, or general stock update
      const affected = payload?.items?.some(
        (it) => String(it.productId || it.id) === String(id)
      ) || String(payload?.productId) === String(id) || payload?.updatedProducts?.some((p) => String(p._id || p.id) === String(id))

      if (affected || !payload?.productId) {
        fetchProduct(false)
      }
    }

    socket.on('stock:updated', handleStockUpdate)

    return () => {
      socket.off('stock:updated', handleStockUpdate)
    }
  }, [id, fetchProduct])

  // Current active variant
  const currentVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null
    return product.variants[selectedVariantIndex] || product.variants[0]
  }, [product, selectedVariantIndex])

  // Current available stock for this variant / product
  const maxStock = useMemo(() => {
    if (!product) return 0
    if (currentVariant && currentVariant.stock !== undefined) {
      return Math.max(0, Number(currentVariant.stock))
    }
    return Math.max(0, Number(product.totalStock || 0))
  }, [product, currentVariant])

  // Ensure selected quantity never exceeds max available stock
  useEffect(() => {
    if (maxStock > 0 && quantity > maxStock) {
      setQuantity(maxStock)
    } else if (maxStock === 0) {
      setQuantity(1)
    }
  }, [maxStock, quantity])

  // Build gallery for current variant (up to 4 images) or product fallback
  const gallery = useMemo(() => {
    if (!product) return [arrival1]
    let imgs = []

    if (currentVariant?.images && currentVariant.images.length > 0) {
      imgs = currentVariant.images.filter(Boolean)
    } else if (currentVariant?.image) {
      imgs = [currentVariant.image]
    } else if (product.image) {
      imgs = [product.image]
    }

    if (imgs.length === 0) {
      return [arrival1, arrival2, arrival3, arrival4]
    }

    return imgs.map((src) => getCmsImageUrl(src))
  }, [product, currentVariant])

  // When variant changes or gallery updates, ensure active image is valid
  useEffect(() => {
    if (gallery.length > 0) {
      setActiveImage(gallery[0])
    }
  }, [gallery])

  // Extract available colors, designs, and materials from all variants
  const availableColors = useMemo(() => {
    if (!product?.variants) return []
    const seen = new Set()
    const result = []
    product.variants.forEach((v, idx) => {
      if (v.color && !seen.has(v.color.toLowerCase())) {
        seen.add(v.color.toLowerCase())
        result.push({ name: v.color, hex: v.hex || '#6D021B', variantIndex: idx })
      }
    })
    return result
  }, [product])

  const availableDesigns = useMemo(() => {
    if (!product?.variants) return []
    const seen = new Set()
    product.variants.forEach((v) => {
      if (v.design) seen.add(v.design)
    })
    return Array.from(seen)
  }, [product])

  const availableMaterials = useMemo(() => {
    if (!product?.variants) return []
    const seen = new Set()
    product.variants.forEach((v) => {
      if (v.material) seen.add(v.material)
    })
    return Array.from(seen)
  }, [product])

  // Handle color selection -> switch to corresponding variant
  const handleSelectColor = (colObj) => {
    setSelectedColor(colObj.name)
    setSelectedVariantIndex(colObj.variantIndex)
    const newVariant = product?.variants?.[colObj.variantIndex]
    if (newVariant) {
      if (newVariant.design) setSelectedDesign(newVariant.design)
      if (newVariant.material) setSelectedMaterial(newVariant.material)
      const vImgs = (newVariant.images && newVariant.images.length > 0)
        ? newVariant.images
        : (newVariant.image ? [newVariant.image] : [])
      if (vImgs.length > 0) {
        setActiveImage(getCmsImageUrl(vImgs[0]))
      }
    }
  }

  // Handle design selection -> switch to matching variant and update color, material, image
  const handleSelectDesign = (dsg) => {
    setSelectedDesign(dsg)
    if (!product?.variants) return
    const matchedIdx = product.variants.findIndex(
      (v) => (v.design || '').toLowerCase() === dsg.toLowerCase()
    )
    if (matchedIdx !== -1) {
      setSelectedVariantIndex(matchedIdx)
      const matched = product.variants[matchedIdx]
      if (matched.color) setSelectedColor(matched.color)
      if (matched.material) setSelectedMaterial(matched.material)
      const vImgs = (matched.images && matched.images.length > 0)
        ? matched.images
        : (matched.image ? [matched.image] : [])
      if (vImgs.length > 0) {
        setActiveImage(getCmsImageUrl(vImgs[0]))
      }
    }
  }

  // Handle material selection -> switch to matching variant and update color, design, image
  const handleSelectMaterial = (mat) => {
    setSelectedMaterial(mat)
    if (!product?.variants) return
    const matchedIdx = product.variants.findIndex(
      (v) => (v.material || '').toLowerCase() === mat.toLowerCase()
    )
    if (matchedIdx !== -1) {
      setSelectedVariantIndex(matchedIdx)
      const matched = product.variants[matchedIdx]
      if (matched.color) setSelectedColor(matched.color)
      if (matched.design) setSelectedDesign(matched.design)
      const vImgs = (matched.images && matched.images.length > 0)
        ? matched.images
        : (matched.image ? [matched.image] : [])
      if (vImgs.length > 0) {
        setActiveImage(getCmsImageUrl(vImgs[0]))
      }
    }
  }

  // Effective pricing for current variant (fallback to product level)
  const currentPrice = useMemo(() => {
    if (!product) return 0
    if (currentVariant?.price !== undefined && Number(currentVariant.price) > 0) {
      return Number(currentVariant.price)
    }
    return Number(product.price || 0)
  }, [product, currentVariant])

  const currentOriginalPrice = useMemo(() => {
    if (!product) return 0
    if (currentVariant?.originalPrice !== undefined && Number(currentVariant.originalPrice) > 0) {
      return Number(currentVariant.originalPrice)
    }
    return Number(product.originalPrice || product.price || 0)
  }, [product, currentVariant])

  // Discount percentage based on active variant
  const discountPercent = useMemo(() => {
    if (!product) return 0
    const orig = currentOriginalPrice
    const cur = currentPrice
    if (orig <= cur || orig === 0) return 0
    return Math.round(((orig - cur) / orig) * 100)
  }, [currentOriginalPrice, currentPrice])

  // Handle Add to Cart with real product & variant selection
  const handleAddToCart = () => {
    if (!product) return

    // If user is not logged in, prompt friendly login modal to buy product
    if (!isAuthenticated) {
      openAuthModal()
      return
    }

    if (maxStock <= 0) {
      notify.error('Sorry, this variant is currently out of stock.', { id: 'stock-alert' })
      return
    }

    const qtyToAdd = Math.min(quantity, maxStock)
    if (qtyToAdd <= 0) {
      notify.error('Please select at least 1 item.', { id: 'stock-alert' })
      return
    }

    const mainImg = gallery[0] || getCmsImageUrl(product.image)
    // Extract real weight from selected variant or product level
    const variantWeight = currentVariant?.weight !== undefined ? currentVariant.weight : product.weight
    const variantId = currentVariant?._id || currentVariant?.id
    addToCart(
      {
        id: product._id || product.id,
        _id: product._id || product.id,
        productId: product._id || product.id,
        variantId: variantId,
        variantIndex: selectedVariantIndex,
        title: product.title,
        price: currentPrice,
        originalPrice: currentOriginalPrice || currentPrice,
        image: mainImg,
        category: product.category,
        color: selectedColor || currentVariant?.color || '',
        design: selectedDesign || currentVariant?.design || '',
        material: selectedMaterial || currentVariant?.material || '',
        weight: Number(variantWeight) || 850,
        stock: maxStock,
        size: 'Free Size',
      },
      true,
      qtyToAdd
    )
    setAddedAnimation(true)
    setTimeout(() => setAddedAnimation(false), 2000)
  }

  if (loading) {
    return (
      <div className="w-full bg-[#FAF7F2] min-h-screen pt-[76px] sm:pt-[84px] md:pt-[136px] lg:pt-[144px] pb-20 px-3 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Skeleton */}
          <div className="mb-6 flex items-center gap-2">
            <div className="h-3.5 bg-[#EAE1D5] rounded-none w-12" />
            <span className="text-[#8B7C72]">/</span>
            <div className="h-3.5 bg-[#EAE1D5] rounded-none w-18" />
            <span className="text-[#8B7C72]">/</span>
            <div className="h-3.5 bg-[#EAE1D5] rounded-none w-20" />
            <span className="text-[#8B7C72]">/</span>
            <div className="h-3.5 bg-[#EAE1D5] rounded-none w-32" />
          </div>

          {/* Main 2-Column Product Layout Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* LEFT COLUMN: Gallery Skeleton */}
            <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 lg:gap-5">
              {/* Vertical Thumbnails Skeleton */}
              <div className="flex sm:flex-col gap-2.5 sm:gap-3 shrink-0">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-16 h-20 sm:w-18 sm:h-24 lg:w-20 lg:h-26 bg-[#E8DDCE]/80 border border-[#EDE4D8] shrink-0"
                  />
                ))}
              </div>

              {/* Main Big Image Box Skeleton */}
              <div className="relative flex-1 aspect-[3/4] sm:aspect-[4/5] max-h-[620px] w-full bg-[#E8DDCE]/70 border border-[#EDE4D8] overflow-hidden">
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-16 h-6 bg-[#D8CCBA]/80" />
              </div>
            </div>

            {/* RIGHT COLUMN: Product Information Skeleton */}
            <div className="lg:col-span-5 flex flex-col space-y-4">
              {/* Category tag */}
              <div className="h-3.5 bg-[#EAE1D5] rounded-none w-48" />

              {/* Title lines */}
              <div className="space-y-2 pt-1">
                <div className="h-7 sm:h-9 bg-[#E8DDCE] rounded-none w-11/12" />
                <div className="h-7 sm:h-9 bg-[#E8DDCE] rounded-none w-3/4" />
              </div>

              {/* Price row */}
              <div className="flex items-baseline gap-3 pt-2">
                <div className="h-8 bg-[#EAE1D5] rounded-none w-28" />
                <div className="h-5 bg-[#EAE1D5] rounded-none w-20" />
                <div className="h-5 bg-[#EAE1D5] rounded-none w-16" />
              </div>

              {/* Stock Alert Badge Skeleton */}
              <div className="h-7 bg-[#EAE1D5]/70 rounded-none w-60" />

              {/* Description Paragraph Skeleton */}
              <div className="space-y-2 pt-2">
                <div className="h-3.5 bg-[#EAE1D5] rounded-none w-full" />
                <div className="h-3.5 bg-[#EAE1D5] rounded-none w-full" />
                <div className="h-3.5 bg-[#EAE1D5] rounded-none w-4/5" />
              </div>

              {/* Return Policy Line Skeleton */}
              <div className="h-5 bg-[#EAE1D5]/70 rounded-none w-52 pt-1" />

              <div className="my-2 border-t border-[#EDE4D8]" />

              {/* Color Swatches Skeleton */}
              <div className="space-y-2 pt-1">
                <div className="h-3.5 bg-[#EAE1D5] rounded-none w-24" />
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#E8DDCE] border border-black/10" />
                  <div className="w-8 h-8 rounded-full bg-[#E8DDCE] border border-black/10" />
                  <div className="w-8 h-8 rounded-full bg-[#E8DDCE] border border-black/10" />
                </div>
              </div>

              {/* Design Chips Skeleton */}
              <div className="space-y-2 pt-2">
                <div className="h-3.5 bg-[#EAE1D5] rounded-none w-24" />
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="h-8 bg-[#E8DDCE] rounded-none w-28" />
                  <div className="h-8 bg-[#E8DDCE] rounded-none w-32" />
                </div>
              </div>

              {/* Add to Cart Button Skeleton */}
              <div className="pt-4">
                <div className="h-12 sm:h-13 bg-[#D8CCBA] rounded-none w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="w-full bg-[#FAF7F2] min-h-screen pt-[140px] pb-20 px-4 flex items-center justify-center text-center">
        <div className="max-w-md bg-white p-8 rounded-none-2xl border border-[#EDE4D8] shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-[#1F1713] mb-2">Product Not Found</h2>
          <p className="text-sm text-[#73655B] mb-6">
            The saree you are looking for does not exist or has been removed.
          </p>
          <Link
            to="/collections"
            className="inline-block px-6 py-2.5 bg-primary text-white text-xs font-semibold tracking-wider uppercase rounded-none-lg hover:bg-primary-dark transition-colors"
          >
            Explore Collections
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen pt-[76px] sm:pt-[84px] md:pt-[136px] lg:pt-[144px] pb-20 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* ─── Breadcrumb ─── */}
        <div className="mb-6 flex items-center gap-2 text-xs text-[#8B7C72]">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/collections" className="hover:text-primary transition-colors">Collections</Link>
          <span>/</span>
          <Link to={`/collections?category=${encodeURIComponent(product.category || '')}`} className="hover:text-primary transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-[#1F1713] font-medium truncate max-w-[200px] sm:max-w-xs">{product.title}</span>
        </div>

        {/* ─── Product Details Main Section (Matching Reference Layout) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ══════════ LEFT COLUMN: Gallery with Vertical Thumbnails ══════════ */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 lg:gap-5">

            {/* 1. Vertical Thumbnail Strip (Far Left) */}
            <div className="flex sm:flex-col gap-2.5 sm:gap-3 overflow-x-auto sm:overflow-y-auto shrink-0 pb-2 sm:pb-0 scrollbar-none sm:max-h-[620px]">
              {gallery.map((img, idx) => {
                const isActive = activeImage === img
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    onMouseEnter={() => setActiveImage(img)}
                    className={`relative w-16 h-20 sm:w-18 sm:h-24 lg:w-20 lg:h-26 rounded-none-xl overflow-hidden border-2 transition-all cursor-pointer bg-[#F2ECE2] shrink-0 ${isActive
                        ? 'border-primary shadow-md ring-2 ring-primary/20 scale-[1.02]'
                        : 'border-[#EAE1D5] hover:border-secondary opacity-75 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                )
              })}
            </div>

            {/* 2. Main Large Featured Image Frame */}
            <div className="relative flex-1 aspect-[3/4] sm:aspect-[4/5] max-h-[620px] w-full bg-[#F2ECE2] rounded-none-2xl sm:rounded-none-3xl overflow-hidden border border-[#EDE4D8] shadow-lg group">
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Discount Tag (Top-Left) */}
              {discountPercent > 0 && (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 bg-[#6D021B] text-[#FFF] text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-none-md shadow-xs">
                  {discountPercent}% OFF
                </div>
              )}
            </div>

          </div>

          {/* ══════════ RIGHT COLUMN: Product Information & Add to Cart ══════════ */}
          <div className="lg:col-span-5 flex flex-col">

            {/* Category / Collection Tag */}
            <span className="text-xs uppercase tracking-widest font-semibold text-secondary">
              {product.category} • The House of Sarees
            </span>

            {/* Product Title */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F1713] mt-1.5 leading-tight">
              {product.title}
            </h1>

            {/* Price Row: Bold Price, Strikethrough Original, Red Discount % */}
            <div className="mt-4 flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold text-[#1F1713]">
                ₹{Number(currentPrice || 0).toLocaleString('en-IN')}
              </span>
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <span className="text-base sm:text-lg text-stone-400 line-through">
                  ₹{Number(currentOriginalPrice).toLocaleString('en-IN')}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-sm sm:text-base font-bold text-[#EF4444]">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Stock Alert - Amazon-style Dynamic Trigger */}
            {(() => {
              const currentStock = currentVariant?.stock !== undefined ? Number(currentVariant.stock) : Number(product.totalStock || 0)
              const alertLimit = Number(currentVariant?.lowStockAlert || product.lowStockAlert || 3)

              if (currentStock === 0) {
                return (
                  <div className="mt-3.5 inline-flex items-center gap-2.5 px-3.5 py-2 bg-red-50 border border-red-200 rounded-none-lg text-red-700 text-xs font-bold shadow-2xs">
                    <span>Currently unavailable.</span>
                  </div>
                )
              }
              if (currentStock <= alertLimit) {
                return (
                  <div className="mt-3.5 inline-flex items-center gap-2.5 px-3.5 py-2 bg-[#FEF2F2] border border-[#FECACA] rounded-none-lg text-[#991B1B] text-xs font-bold shadow-2xs">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
                    </span>
                    <span>Only {currentStock} {currentStock === 1 ? 'item' : 'items'} left in stock — order soon!</span>
                  </div>
                )
              }
              return (
                <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1 rounded-none text-emerald-800 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                  <span>In Stock</span>
                </div>
              )
            })()}

            {/* Product Short Description */}
            <p className="mt-4 text-xs sm:text-sm text-[#73655B] leading-relaxed">
              {product.description ||
                'A handcrafted luxury saree woven with master artisan precision, featuring authentic zari borders, pure woven fabric, and a regal pallu. Lightweight, fluid, and perfect for celebratory and ceremonial occasions.'}
            </p>

             {isReturnsEnabled && product.isReturnable !== false && (
              <div className="mt-4 p-3  flex items-center gap-2.5 text-stone-700">
                <RotateCcw className="w-4 h-4 text-[#6D021B] shrink-0" />
                <span className="text-xs">
                  <strong className="text-stone-900 font-semibold">
                    {product.returnWindowDays || globalReturnDays} Days Return &amp; Refund 
                  </strong>
            
                  {/* <span>Doorstep pickup available</span> */}
                </span>
              </div>
            )}

            <div className="my-6 border-t border-[#EDE4D8]" />

            {/* 1. VARIANT: COLOR */}
            {availableColors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1F1713]">
                    COLOR: <span className="font-semibold text-primary capitalize ml-1">{selectedColor}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {availableColors.map((colObj) => {
                    const isSelected = selectedColor.toLowerCase() === colObj.name.toLowerCase()
                    return (
                      <button
                        key={colObj.name}
                        type="button"
                        onClick={() => handleSelectColor(colObj)}
                        title={colObj.name}
                        className={`relative w-8 h-8 rounded-none-full transition-transform cursor-pointer border border-black/10 ${isSelected ? 'scale-110 ring-2 ring-primary ring-offset-2' : 'hover:scale-105'
                          }`}
                        style={{ backgroundColor: colObj.hex }}
                      >
                        {isSelected && (
                          <span className="absolute inset-0 flex items-center justify-center text-white text-xs drop-shadow-sm font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 2. VARIANT: DESIGN */}
            {availableDesigns.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1F1713]">
                    DESIGN: <span className="font-semibold text-primary ml-1">{selectedDesign}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {availableDesigns.map((dsg) => {
                    const isSelected = selectedDesign === dsg
                    return (
                      <button
                        key={dsg}
                        type="button"
                        onClick={() => handleSelectDesign(dsg)}
                        className={`px-4 py-2 rounded-none-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${isSelected
                            ? 'bg-[#1F1713] text-white border-[#1F1713] shadow-xs'
                            : 'bg-white text-[#40342C] border-[#EDE4D8] hover:border-primary hover:text-primary'
                          }`}
                      >
                        {dsg}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 3. VARIANT: MATERIAL */}
            {availableMaterials.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1F1713]">
                    MATERIAL: <span className="font-semibold text-primary ml-1">{selectedMaterial}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {availableMaterials.map((mat) => {
                    const isSelected = selectedMaterial === mat
                    return (
                      <button
                        key={mat}
                        type="button"
                        onClick={() => handleSelectMaterial(mat)}
                        className={`px-4 py-2 rounded-none-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${isSelected
                            ? 'bg-[#1F1713] text-white border-[#1F1713] shadow-xs'
                            : 'bg-white text-[#40342C] border-[#EDE4D8] hover:border-primary hover:text-primary'
                          }`}
                      >
                        {mat}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F1713]">
                  Quantity:
                </span>
                {maxStock > 0 && (
                  <span className="text-xs font-medium text-stone-500">
                    Stock available: <strong className="text-primary font-bold">{maxStock}</strong>
                  </span>
                )}
              </div>
              <div className="inline-flex items-center bg-white border border-[#EDE4D8] rounded-none-xl shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1 || maxStock <= 0}
                  className="w-10 h-10 flex items-center justify-center text-stone-600 hover:text-primary disabled:text-stone-300 disabled:cursor-not-allowed cursor-pointer text-lg font-medium transition-colors"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-12 text-center text-sm font-bold text-[#1F1713] select-none">
                  {maxStock <= 0 ? 0 : quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.min(maxStock, prev + 1))}
                  disabled={quantity >= maxStock || maxStock <= 0}
                  className="w-10 h-10 flex items-center justify-center text-stone-600 hover:text-primary disabled:text-stone-300 disabled:cursor-not-allowed cursor-pointer text-lg font-medium transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* ONLY "Add to Cart" Button */}
            <div className="mt-8">
              {maxStock <= 0 ? (
                <button
                  type="button"
                  disabled
                  className="w-full py-3.5 sm:py-4 px-6 rounded-none-xl sm:rounded-none-2xl font-semibold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2.5 bg-stone-300 text-stone-500 cursor-not-allowed shadow-none"
                >
                  <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  <span>Out of Stock</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`w-full py-3.5 sm:py-4 px-6 rounded-none-xl sm:rounded-none-2xl font-semibold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2.5 cursor-pointer shadow-md transition-all duration-200 active:scale-98 ${addedAnimation
                      ? 'bg-[#15803D] text-white shadow-lg'
                      : 'bg-[#6D021B] hover:bg-[#580015] text-white'
                    }`}
                >
                  {addedAnimation ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                      <span>Add to Cart • ₹{(Number(currentPrice || 0) * quantity).toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Return Policy Badge (Shows when Returns are ON, hidden when OFF) */}
           

            {/* Social Media Product Share (Requirement: Max 4 Websites - WhatsApp, Facebook, Instagram, X/Twitter, Copy Link) */}
            <div className="mt-6 pt-5 border-t border-[#EDE4D8] flex flex-wrap items-center gap-x-3 gap-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1F1713] shrink-0">
                <Share2 className="w-3.5 h-3.5 text-[#6D021B]" />
                <span>Share this saree:</span>
              </div>

              {/* Only Icons Bar (Same Row) */}
              <div className="flex items-center gap-1">
                {/* 1. WhatsApp */}
                <button
                  type="button"
                  onClick={() => handleShare('whatsapp')}
                  title="Share on WhatsApp"
                  aria-label="Share on WhatsApp"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#25D366] hover:scale-115 transition-transform duration-200 cursor-pointer active:scale-95"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.301-.15-1.782-.879-2.058-.98-.276-.1-.476-.15-.677.15-.2.302-.777.98-.952 1.181-.176.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.896-.799-1.5-1.787-1.676-2.088-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.3.301-.501.1-.2.05-.376-.025-.526-.075-.15-.677-1.631-.927-2.233-.244-.587-.492-.507-.677-.517-.175-.01-.376-.01-.577-.01-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.509 0 1.48 1.078 2.91 1.228 3.111.15.2 2.122 3.24 5.141 4.544.718.311 1.279.497 1.716.636.722.23 1.378.197 1.9.119.58-.088 1.782-.728 2.032-1.431.25-.702.25-1.304.175-1.431-.075-.126-.275-.201-.576-.352zM12.04 2C6.52 2 2.036 6.484 2.036 12.005c0 1.97.574 3.805 1.572 5.353L2 22l4.821-1.545c1.486.88 3.21 1.385 5.048 1.385 5.52 0 10.005-4.484 10.005-10.005C21.874 6.484 17.56 2 12.04 2zm0 18.258c-1.666 0-3.21-.497-4.512-1.353l-.323-.213-3.324 1.065 1.088-3.242-.234-.344c-.958-1.411-1.464-3.078-1.464-4.811 0-4.568 3.717-8.285 8.285-8.285 4.568 0 8.285 3.717 8.285 8.285 0 4.568-3.717 8.285-8.285 8.285z" />
                  </svg>
                </button>

                {/* 2. Facebook */}
                <button
                  type="button"
                  onClick={() => handleShare('facebook')}
                  title="Share on Facebook"
                  aria-label="Share on Facebook"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#1877F2] hover:scale-115 transition-transform duration-200 cursor-pointer active:scale-95"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>

                {/* 3. Instagram */}
                <button
                  type="button"
                  onClick={() => handleShare('instagram')}
                  title="Share on Instagram (copies link & opens Instagram)"
                  aria-label="Share on Instagram"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#E4405F] hover:scale-115 transition-transform duration-200 cursor-pointer active:scale-95"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </button>

                {/* 4. Twitter / X */}
                <button
                  type="button"
                  onClick={() => handleShare('twitter')}
                  title="Share on X (Twitter)"
                  aria-label="Share on X (Twitter)"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#0f1419] hover:scale-115 transition-transform duration-200 cursor-pointer active:scale-95"
                >
                  <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>

                {/* 5. Copy Link */}
                <button
                  type="button"
                  onClick={() => handleShare('copy')}
                  title="Copy product link"
                  aria-label="Copy product link"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#6D021B] hover:scale-115 transition-transform duration-200 cursor-pointer active:scale-95"
                >
                  {copiedLink ? (
                    <Check className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Copy className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>

              {copiedLink && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200 animate-fade-in flex items-center gap-1">
                  <Check className="w-3 h-3" /> Link copied!
                </span>
              )}
            </div>

          </div>

        </div>



      </div>
    </div>
  )
}

