import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import productService from '../../services/productService'
import { getCmsImageUrl } from '../../utils/imageHelper'
import { getSocket } from '../../services/socket'

const PRODUCTS_PER_PAGE = 12

// Export an empty array or fallback for backwards compatibility across legacy imports
export const allProductsList = []

export default function Collections() {
  const { addToCart } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const categoryParam = searchParams.get('category') || 'All'

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [maxPrice, setMaxPrice] = useState(25000)
  const [sortBy, setSortBy] = useState('featured')
  const [addedIds, setAddedIds] = useState([])
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch real products from MongoDB backend
  const loadProducts = useCallback((showSpinner = false) => {
    if (showSpinner) setLoading(true)
    productService
      .getAll({ limit: 200 })
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.products || []
        // Normalize products: map _id to id and compute stock and variant attributes
        const normalized = list.map((p) => {
          const mainImg = p.image || p.variants?.[0]?.image || p.variants?.[0]?.images?.[0] || ''
          const mainFabric = p.variants?.[0]?.material || p.fabric || 'Pure Silk'
          const mainColor = p.variants?.[0]?.color || p.color || ''
          const mainWeight = p.variants?.[0]?.weight !== undefined ? p.variants[0].weight : (p.weight || 850)
          const computedStock = p.totalStock !== undefined
            ? Number(p.totalStock)
            : (p.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) ?? Number(p.stock || 0))
          const isOutOfStock = p.status === 'Out of Stock' || computedStock <= 0

          return {
            ...p,
            id: p._id || p.id,
            image: mainImg,
            fabric: mainFabric,
            color: mainColor,
            weight: Number(mainWeight) || 850,
            originalPrice: p.originalPrice || p.price || 0,
            price: p.price || 0,
            totalStock: computedStock,
            isOutOfStock,
          }
        })
        setProducts(normalized)
      })
      .catch((err) => {
        console.error('Failed to load products from database:', err)
      })
      .finally(() => {
        if (showSpinner) setLoading(false)
      })
  }, [])

  useEffect(() => {
    loadProducts(true)

    // Listen to real-time stock updates so Out-of-Stock state reflects instantly
    const socket = getSocket()
    const handleStockUpdate = () => {
      loadProducts(false)
    }

    socket.on('stock:updated', handleStockUpdate)
    socket.on('order:new', handleStockUpdate)

    return () => {
      socket.off('stock:updated', handleStockUpdate)
      socket.off('order:new', handleStockUpdate)
    }
  }, [loadProducts])

  // Sync category with URL when searchParams change (e.g. from Navbar dropdown navigation)
  useEffect(() => {
    const cat = searchParams.get('category') || 'All'
    setSelectedCategory(cat)
  }, [searchParams])

  // Lock body scroll and handle Escape key for mobile filter drawer
  useEffect(() => {
    if (!mobileFilterOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileFilterOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileFilterOpen])

  // Dynamically compute available categories from real database products
  const categories = useMemo(() => {
    const set = new Set()
    products.forEach((p) => {
      if (p.category) set.add(p.category.trim())
    })
    const list = Array.from(set).map((cat) => ({
      label: `${cat} Sarees`,
      value: cat,
    }))
    return [{ label: 'All Products', value: 'All' }, ...list]
  }, [products])

  const handleCategorySelect = (val) => {
    setSelectedCategory(val)
    const newParams = new URLSearchParams(searchParams)
    if (val === 'All') {
      newParams.delete('category')
    } else {
      newParams.set('category', val)
    }
    setSearchParams(newParams)
  }

  const resetFilters = () => {
    setSelectedCategory('All')
    setMaxPrice(25000)
    setSortBy('featured')
    setCurrentPage(1)
    const newParams = new URLSearchParams()
    setSearchParams(newParams)
  }

  // Filter & Sort Logic against real MongoDB products
  const filteredProducts = useMemo(() => {
    let result = products.filter((item) => {
      const matchCategory =
        selectedCategory === 'All' ||
        (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase())
      const matchPrice = Number(item.price) <= Number(maxPrice)
      const query = searchQuery.trim().toLowerCase()
      const matchSearch =
        !query ||
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query)) ||
        (item.fabric && item.fabric.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.badge && item.badge.toLowerCase().includes(query)) ||
        (item.variants && item.variants.some((v) => (v.color && v.color.toLowerCase().includes(query)) || (v.material && v.material.toLowerCase().includes(query))))
      return matchCategory && matchPrice && matchSearch
    })

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    }

    return result
  }, [products, selectedCategory, maxPrice, sortBy, searchQuery])

  // Reset to page 1 whenever any filter or search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, maxPrice, sortBy, searchQuery])

  // Always scroll to top when Collections page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  // Pagination calculations: 12 products per page
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) || 1

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE)
  }, [filteredProducts, currentPage])

  const handlePageChange = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return
    setCurrentPage(pageNum)
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  // Generate pagination items showing only current window and ellipses (e.g., 1, 2, 3 ... 11)
  const paginationItems = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages = []

    if (currentPage <= 2) {
      // Near start: 1, 2, 3, '...', totalPages
      pages.push(1, 2, 3, '...', totalPages)
    } else if (currentPage >= totalPages - 1) {
      // Near end: 1, '...', totalPages - 2, totalPages - 1, totalPages
      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages)
    } else {
      // In middle: 1, '...', currentPage, '...', totalPages (or currentPage - 1, currentPage, currentPage + 1)
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
    }

    return pages
  }, [totalPages, currentPage])

  const handleAddToCart = (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, true)
    setAddedIds((prev) => (prev.includes(product.id) ? prev : [...prev, product.id]))
    setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product.id))
    }, 2000)
  }

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen pt-[76px] sm:pt-[84px] md:pt-[136px] lg:pt-[104px] pb-16 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* ─── Mobile Filter Backdrop Overlay ─── */}
        {mobileFilterOpen && (
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-2xs z-40 lg:hidden animate-fade-in"
            onClick={() => setMobileFilterOpen(false)}
          />
        )}

        {/* ─── Main Grid: Filter Sidebar & Product Cards In The Exact Same Row ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start pt-2 sm:pt-4 relative">

          {/* ══════════ LEFT FILTER SIDEBAR (Desktop Sticky & Mobile Drawer) ══════════ */}
          <aside
            className={`
              fixed lg:sticky top-0 lg:top-[90px] right-0 z-50 lg:z-30 h-full lg:h-fit max-h-[calc(100vh-110px)]
              w-[280px] sm:w-[320px] lg:w-full bg-[#FCFAF7] lg:bg-white
              p-5 sm:p-6 lg:p-5 border-l lg:border border-[#EDE4D8] rounded-none shadow-none
              transition-transform duration-300 ease-in-out lg:translate-x-0
              ${mobileFilterOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
              lg:col-span-3 shrink-0 overflow-y-auto scrollbar-thin
            `}
          >
            {/* Header: Filters label & Reset */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F0E8DC]">
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm sm:text-base font-bold text-[#1F1713]">
                  Filters
                </span>
                {(selectedCategory !== 'All' || maxPrice < 25000 || searchQuery || sortBy !== 'featured') && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                  >
                    Reset All
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="lg:hidden p-1 text-stone-400 hover:text-primary hover:bg-[#FAF4EC] rounded-none transition-colors cursor-pointer"
                aria-label="Close filters"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 1. Sort By Inside Sidebar */}
            <div className="py-4 border-b border-[#F0E8DC]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F1713] mb-2.5">
                Sort By
              </h4>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E3D7C7] rounded-none px-3 py-2 text-xs font-medium text-[#1F1713] focus:outline-none focus:border-primary cursor-pointer shadow-none"
              >
                <option value="featured">Featured Collection</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {/* 2. Category Radio / Checkbox List */}
            <div className="py-4 border-b border-[#F0E8DC]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F1713] mb-3">
                Category
              </h4>
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                {categories.map((cat) => {
                  const isChecked = selectedCategory === cat.value
                  return (
                    <label
                      key={cat.value}
                      className="flex items-center gap-2.5 text-xs sm:text-sm text-[#40342C] cursor-pointer hover:text-primary transition-colors select-none"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={isChecked}
                        onChange={() => handleCategorySelect(cat.value)}
                        className="w-4 h-4 text-primary accent-primary cursor-pointer rounded-none"
                      />
                      <span className={isChecked ? 'font-semibold text-primary' : ''}>
                        {cat.label}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* 3. Price Range Slider */}
            <div className="py-4 border-b border-[#F0E8DC]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F1713]">
                  Price Range
                </span>
                <span className="text-xs font-bold text-primary">
                  ₹0 - ₹{Number(maxPrice).toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="25000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#8B7C72] mt-1 font-light">
                <span>₹1,000</span>
                <span>₹25,000+</span>
              </div>
            </div>

            {mobileFilterOpen && (
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full mt-4 py-2.5 bg-primary text-white rounded-none text-xs font-semibold cursor-pointer shadow-none active:scale-98 transition-transform"
              >
                Apply Filters
              </button>
            )}
          </aside>

          {/* ══════════ RIGHT PRODUCTS: In Same Top Row As Filter ══════════ */}
          <main className="lg:col-span-9">
            {/* Top Bar on Mobile: Filters Button and Results Count */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 mb-2 lg:mb-3 border-b border-[#EDE4D8]">
              <div className="text-xs sm:text-sm text-[#73655B]">
                Showing <strong className="text-[#1F1713] font-bold">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'saree' : 'sarees'}
              </div>

              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#EDE4D8] rounded-xl text-xs font-semibold text-[#1F1713] shadow-2xs cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h18m-14 7.5h10m-7 7.5h4" />
                </svg>
                <span>Filter &amp; Sort</span>
              </button>
            </div>
            {/* Active Filter Badges */}
            {(searchQuery || selectedCategory !== 'All') && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {selectedCategory !== 'All' && (
                  <div className="inline-flex items-center gap-2 bg-[#FCFAF7] border border-[#E3D7C7] rounded-none-full px-3.5 py-1 text-xs text-[#1F1713] shadow-2xs">
                    <span className="text-[#8B7C72]">Category:</span>
                    <span className="font-semibold text-primary">{selectedCategory}</span>
                    <button
                      type="button"
                      onClick={() => handleCategorySelect('All')}
                      className="text-[#8B7C72] hover:text-primary transition-colors cursor-pointer ml-1 text-sm leading-none"
                      title="Clear category filter"
                    >
                      ×
                    </button>
                  </div>
                )}
                {searchQuery && (
                  <div className="inline-flex items-center gap-2 bg-[#FCFAF7] border border-[#E3D7C7] rounded-none-full px-3.5 py-1 text-xs text-[#1F1713] shadow-2xs">
                    <span className="text-[#8B7C72]">Search:</span>
                    <span className="font-semibold text-primary">"{searchQuery}"</span>
                    <button
                      type="button"
                      onClick={() => {
                        searchParams.delete('search')
                        setSearchParams(searchParams)
                      }}
                      className="text-[#8B7C72] hover:text-primary transition-colors cursor-pointer ml-1 text-sm leading-none"
                      title="Clear search"
                    >
                      ×
                    </button>
                  </div>
                )}
                <span className="text-xs text-[#8B7C72]">({filteredProducts.length} results)</span>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading ? (
              <div className="grid grid-cols-2 min-[700px]:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="bg-white p-3 rounded-none-2xl border border-[#EDE4D8] space-y-3">
                    <div className="aspect-[3/4] bg-stone-200" />
                    <div className="h-4 bg-stone-200 rounded-none w-3/4" />
                    <div className="h-3 bg-stone-200 rounded-none w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-none-3xl border border-[#EDE4D8] p-12 text-center">
                <p className="font-serif text-lg text-[#1F1713]">
                  {searchQuery ? `No products found matching "${searchQuery}"` : 'No sarees match your selected filters'}
                </p>
                <p className="text-xs sm:text-sm text-[#73655B] mt-1">
                  {searchQuery
                    ? 'Try searching with different keywords or clear your search query.'
                    : 'Try adjusting the price range or resetting category filters.'}
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 px-6 py-2.5 rounded-none-full bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div>
                {/* Responsive Grid: 2 per row (<700px), 3 per row (>=700px) */}
                <div className="grid grid-cols-2 min-[700px]:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-6">
                  {paginatedProducts.map((product) => {
                    const isAdded = addedIds.includes(product.id)
                    const discountPercent =
                      product.originalPrice && product.originalPrice > product.price
                        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                        : 0

                    return (
                      <div
                        key={product.id}
                        className="group flex flex-col bg-white border border-[#EAE1D5] rounded-none-xl sm:rounded-none-2xl lg:rounded-none-3xl p-2.5 sm:p-3 lg:p-3.5 transition-all duration-300 hover:shadow-xl hover:border-secondary/40"
                      >
                        {/* Product Image Frame */}
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none-lg sm:rounded-none-xl lg:rounded-none-2xl bg-[#F2ECE2]">
                          <Link to={`/product/${product.id}`} className="block w-full h-full">
                            <img
                              src={getCmsImageUrl(product.image)}
                              alt={product.title}
                              loading="lazy"
                              className={`h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${
                                product.isOutOfStock ? 'grayscale opacity-75' : ''
                              }`}
                            />
                          </Link>

                          {/* Out of Stock Overlay / Badge (Amazon style) */}
                          {product.isOutOfStock ? (
                            <div className="absolute inset-x-0 bottom-0 py-1.5 px-2 bg-stone-900/90 backdrop-blur-xs text-white text-center text-[10px] sm:text-xs font-bold tracking-wider uppercase z-20">
                              Currently Unavailable
                            </div>
                          ) : product.badge ? (
                            <span className="absolute top-2 left-2 z-10 bg-primary text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-none uppercase tracking-wider">
                              {product.badge}
                            </span>
                          ) : null}
                        </div>

                        {/* Product Content Details */}
                        <div className="pt-2.5 sm:pt-3 pb-0.5 px-0.5 sm:px-1 flex flex-col flex-1 justify-between">
                          <div>
                            <Link to={`/product/${product.id}`} className="block">
                              <h3 className="font-serif text-xs sm:text-sm lg:text-base font-semibold text-[#1F1713] group-hover:text-primary transition-colors truncate">
                                {product.title}
                              </h3>
                            </Link>

                            {/* Bold Price + Strikethrough Original Price + Discount Pill */}
                            <div className="mt-1 flex items-baseline gap-1 sm:gap-2 flex-wrap">
                              <span className="text-xs sm:text-sm lg:text-base font-bold text-[#1F1713]">
                                ₹{Number(product.price || 0).toLocaleString('en-IN')}
                              </span>
                              {product.originalPrice > product.price && (
                                <span className="text-[10px] sm:text-xs text-[#9E9189] line-through font-normal">
                                  ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                                </span>
                              )}
                              {discountPercent > 0 && (
                                <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded-none">
                                  {discountPercent}% OFF
                                </span>
                              )}
                            </div>

                            {/* Stock Availability Text - Amazon style */}
                            {product.isOutOfStock ? (
                              <p className="mt-1 text-[11px] font-bold text-red-600">
                                Out of Stock
                              </p>
                            ) : product.totalStock > 0 && product.totalStock <= 3 ? (
                              <p className="mt-1 text-[11px] font-semibold text-[#B45309]">
                                Only {product.totalStock} left in stock - order soon.
                              </p>
                            ) : null}
                          </div>

                          {/* Full-width Action Button */}
                          {product.isOutOfStock ? (
                            <button
                              type="button"
                              disabled
                              className="mt-2.5 sm:mt-3 w-full py-2 sm:py-2.5 lg:py-3 px-2 sm:px-4 rounded-none-lg sm:rounded-none-xl text-[11px] sm:text-xs lg:text-sm font-semibold tracking-wide bg-stone-200 text-stone-500 cursor-not-allowed flex items-center justify-center gap-1 shadow-none"
                            >
                              <span>Out of Stock</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => handleAddToCart(product, e)}
                              className={`mt-2.5 sm:mt-3 w-full py-2 sm:py-2.5 lg:py-3 px-2 sm:px-4 rounded-none-lg sm:rounded-none-xl text-[11px] sm:text-xs lg:text-sm font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer shadow-2xs active:scale-98 ${
                                isAdded
                                  ? 'bg-secondary text-primary-dark font-semibold'
                                  : 'bg-[#F4ECE1] text-[#2B1F19] hover:bg-primary hover:text-white'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                  </svg>
                                  <span>Added</span>
                                </>
                              ) : (
                                <span>+ Add to Cart</span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* ─── Pagination Controls ─── */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-1 sm:gap-2 flex-wrap select-none">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-lg border border-[#EDE4D8] bg-white text-stone-700 hover:bg-[#FAF7F2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1 sm:gap-1.5">
                      {paginationItems.map((item, idx) => {
                        if (item === '...') {
                          return (
                            <span
                              key={`dots-${idx}`}
                              className="w-7 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-xs font-bold text-stone-400 select-none tracking-widest"
                            >
                              ...
                            </span>
                          )
                        }

                        const p = Number(item)
                        const isActive = currentPage === p

                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handlePageChange(p)}
                            aria-current={isActive ? 'page' : undefined}
                            className={`w-7 h-8 sm:w-9 sm:h-9 text-xs font-bold rounded-lg border transition-all cursor-pointer shadow-2xs ${
                              isActive
                                ? 'bg-[#6D021B] text-white border-[#6D021B] shadow-sm'
                                : 'bg-white text-stone-700 border-[#EDE4D8] hover:bg-[#FAF7F2] hover:border-[#6D021B]/40'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold rounded-lg border border-[#EDE4D8] bg-white text-stone-700 hover:bg-[#FAF7F2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
