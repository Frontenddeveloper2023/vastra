import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import productService from '../../services/productService'
import { getCmsImageUrl } from '../../utils/imageHelper'
import { getSocket } from '../../services/socket'

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
  const { addToCart } = useCart()
  const { isAuthenticated, openAuthModal } = useCustomerAuth()

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

  // Discount percentage
  const discountPercent = useMemo(() => {
    if (!product) return 0
    const orig = product.originalPrice || product.price || 0
    const cur = product.price || 0
    if (orig <= cur || orig === 0) return 0
    return Math.round(((orig - cur) / orig) * 100)
  }, [product])

  // Handle Add to Cart with real product & variant selection
  const handleAddToCart = () => {
    if (!product) return

    // If user is not logged in, prompt friendly login modal to buy product
    if (!isAuthenticated) {
      openAuthModal()
      return
    }

    const mainImg = gallery[0] || getCmsImageUrl(product.image)
    // Extract real weight from selected variant or product level
    const variantWeight = currentVariant?.weight !== undefined ? currentVariant.weight : product.weight
    addToCart(
      {
        id: product._id || product.id,
        _id: product._id || product.id,
        title: product.title,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        image: mainImg,
        category: product.category,
        color: selectedColor || currentVariant?.color || '',
        design: selectedDesign || currentVariant?.design || '',
        material: selectedMaterial || currentVariant?.material || '',
        weight: Number(variantWeight) || 850,
        size: 'Free Size',
      },
      true,
      quantity
    )
    setAddedAnimation(true)
    setTimeout(() => setAddedAnimation(false), 2000)
  }

  if (loading) {
    return (
      <div className="w-full bg-[#FAF7F2] min-h-screen pt-[140px] pb-20 px-4 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-none-full animate-spin" />
          <p className="text-sm font-medium text-[#73655B]">Loading saree details...</p>
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
                ₹{Number(product.price || 0).toLocaleString('en-IN')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-base sm:text-lg text-stone-400 line-through">
                  ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-sm sm:text-base font-bold text-[#EF4444]">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Low Stock Alert - Dynamic Trigger */}
            {(() => {
              const currentStock = currentVariant?.stock !== undefined ? Number(currentVariant.stock) : Number(product.totalStock || 0)
              if (currentStock > 0 && currentStock <= 5) {
                return (
                  <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 bg-[#FEF2F2] border border-[#FECACA] rounded-none-lg text-[#991B1B] text-xs font-semibold animate-pulse">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                    </span>
                    <span>Only {currentStock} {currentStock === 1 ? 'piece' : 'pieces'} left in stock — order soon!</span>
                  </div>
                )
              }
              if (currentStock === 0) {
                return (
                  <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 border border-stone-200 text-stone-600 text-xs font-medium">
                    <span>Sold Out in this variant</span>
                  </div>
                )
              }
              return null
            })()}

            {/* Product Short Description */}
            <p className="mt-4 text-xs sm:text-sm text-[#73655B] leading-relaxed">
              {product.description ||
                'A handcrafted luxury saree woven with master artisan precision, featuring authentic zari borders, pure woven fabric, and a regal pallu. Lightweight, fluid, and perfect for celebratory and ceremonial occasions.'}
            </p>

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
                    Max available: <strong className="text-primary font-bold">{maxStock}</strong>
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
                      <span>Add to Cart • ₹{(Number(product.price || 0) * quantity).toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              )}
            </div>

       

          </div>

        </div>



      </div>
    </div>
  )
}

