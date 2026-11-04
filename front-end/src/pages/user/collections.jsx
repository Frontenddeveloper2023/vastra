import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

// Assets
import arrival1 from '../../assets/products/arrival-1.jpg'
import arrival2 from '../../assets/products/arrival-2.jpg'
import arrival3 from '../../assets/products/arrival-3.jpg'
import arrival4 from '../../assets/products/arrival-4.jpg'
import banarasi1 from '../../assets/featured/banarasi-1.jpg'
import banarasi2 from '../../assets/featured/banarasi-2.jpg'
import banarasi3 from '../../assets/featured/banarasi-3.jpg'
import banarasi4 from '../../assets/featured/banarasi-4.jpg'
import catBanarasi from '../../assets/categories/banarasi.jpg'
import catBridal from '../../assets/categories/bridal.jpg'
import catChanderi from '../../assets/categories/chanderi.jpg'
import catChiffon from '../../assets/categories/chiffon.jpg'
import catOrganza from '../../assets/categories/organza.jpg'
import catKanjivaram from '../../assets/categories/kanjivaram.jpg'

const PRODUCTS_PER_PAGE = 12

export const allProductsList = [
  {
    id: 1,
    title: 'Maroon Zari Katan Saree',
    category: 'Banarasi',
    price: 4999,
    originalPrice: 6999,
    badge: 'Banarasi',
    color: 'Maroon',
    sizes: ['Free Size', 'M', 'L'],
    fabric: 'Pure Silk',
    weight: 850, // in grams (0.85 kg)
    image: arrival1,
  },
  {
    id: 2,
    title: 'Festive Gold Temple Saree',
    category: 'Kanjivaram',
    price: 5499,
    originalPrice: 7999,
    badge: 'Kanjivaram',
    color: 'Gold',
    sizes: ['Free Size', 'S', 'M'],
    fabric: 'Kanjivaram Silk',
    weight: 950, // in grams (0.95 kg)
    image: arrival2,
  },
  {
    id: 3,
    title: 'Emerald Handloom Silk Saree',
    category: 'Handloom',
    price: 4299,
    originalPrice: 5999,
    badge: 'Handloom',
    color: 'Green',
    sizes: ['Free Size', 'M', 'XL'],
    fabric: 'Tussar Handloom',
    weight: 750, // in grams (0.75 kg)
    image: arrival3,
  },
  {
    id: 4,
    title: 'Rose Floral Tissue Organza',
    category: 'Organza',
    price: 3899,
    originalPrice: 4999,
    badge: 'Organza',
    color: 'Pink',
    sizes: ['Free Size', 'S', 'M', 'L'],
    fabric: 'Tissue Organza',
    weight: 550, // in grams (0.55 kg)
    image: arrival4,
  },
  {
    id: 5,
    title: 'Maroon Royal Katan Saree',
    category: 'Banarasi',
    price: 6499,
    originalPrice: 8999,
    badge: 'Banarasi',
    color: 'Maroon',
    sizes: ['Free Size', 'M', 'L', 'XL'],
    fabric: 'Pure Katan',
    image: banarasi1,
  },
  {
    id: 6,
    title: 'Raktambari Crimson Bridal Saree',
    category: 'Bridal',
    price: 7899,
    originalPrice: 10499,
    badge: 'Bridal',
    color: 'Red',
    sizes: ['Free Size', 'S', 'M'],
    fabric: 'Zardozi Silk',
    image: banarasi2,
  },
  {
    id: 7,
    title: 'Shikargah Heritage Handloom',
    category: 'Handloom',
    price: 8999,
    originalPrice: 12999,
    badge: 'Handloom',
    color: 'Green',
    sizes: ['Free Size', 'L', 'XL'],
    fabric: 'Pure Handloom',
    image: catBanarasi,
  },
  {
    id: 8,
    title: 'Jangla Pure Gold Zari Saree',
    category: 'Kanjivaram',
    price: 6999,
    originalPrice: 9499,
    badge: 'Kanjivaram',
    color: 'Gold',
    sizes: ['Free Size', 'M', 'L'],
    fabric: 'Gold Brocade',
    image: banarasi4,
  },
  {
    id: 9,
    title: 'Royal Scarlet Bridal Edit',
    category: 'Bridal',
    price: 9499,
    originalPrice: 13999,
    badge: 'Bridal',
    color: 'Red',
    sizes: ['Free Size', 'S', 'M', 'L'],
    fabric: 'Bridal Silk',
    image: catBridal,
  },
  {
    id: 10,
    title: 'Chanderi Gold Foil Zari Saree',
    category: 'Chanderi',
    price: 3499,
    originalPrice: 4899,
    badge: 'Chanderi',
    color: 'Cream',
    sizes: ['Free Size', 'M', 'XL'],
    fabric: 'Chanderi Cotton Silk',
    image: catChanderi,
  },
  {
    id: 11,
    title: 'Pastel Lavender Chiffon Drape',
    category: 'Chiffon',
    price: 2999,
    originalPrice: 3999,
    badge: 'Chiffon',
    color: 'Pink',
    sizes: ['Free Size', 'S', 'M'],
    fabric: 'Pure Chiffon',
    image: catChiffon,
  },
  {
    id: 12,
    title: 'Scalloped Border Sheer Organza',
    category: 'Organza',
    price: 4599,
    originalPrice: 5999,
    badge: 'Organza',
    color: 'Cream',
    sizes: ['Free Size', 'M', 'L'],
    fabric: 'Glass Organza',
    image: catOrganza,
  },
  {
    id: 13,
    title: 'Royal Indigo Kanjivaram Brocade',
    category: 'Kanjivaram',
    price: 7499,
    originalPrice: 10999,
    badge: 'Kanjivaram',
    color: 'Maroon',
    sizes: ['Free Size', 'M', 'L'],
    fabric: 'Kanjivaram Silk',
    image: catKanjivaram,
  },
  {
    id: 14,
    title: 'Meenakari Banarasi Tanchoi Weave',
    category: 'Banarasi',
    price: 8299,
    originalPrice: 11999,
    badge: 'Banarasi',
    color: 'Gold',
    sizes: ['Free Size', 'S', 'M', 'L'],
    fabric: 'Banarasi Tanchoi',
    image: banarasi3,
  },
  {
    id: 15,
    title: 'Temple Border Festive Kanjivaram',
    category: 'Kanjivaram',
    price: 6199,
    originalPrice: 8499,
    badge: 'Kanjivaram',
    color: 'Gold',
    sizes: ['Free Size', 'M', 'XL'],
    fabric: 'Pure Temple Silk',
    image: arrival2,
  },
  {
    id: 16,
    title: 'Blush Rose Tissue Embroidered Organza',
    category: 'Organza',
    price: 4799,
    originalPrice: 6299,
    badge: 'Organza',
    color: 'Pink',
    sizes: ['Free Size', 'S', 'M'],
    fabric: 'Embroidered Organza',
    image: catOrganza,
  },
  {
    id: 17,
    title: 'Vermilion Bridal Heritage Saree',
    category: 'Bridal',
    price: 9899,
    originalPrice: 14499,
    badge: 'Bridal',
    color: 'Red',
    sizes: ['Free Size', 'M', 'L'],
    fabric: 'Heritage Bridal Silk',
    image: arrival1,
  },
  {
    id: 18,
    title: 'Olive Handloom Tussar Silk Saree',
    category: 'Handloom',
    price: 5299,
    originalPrice: 7199,
    badge: 'Handloom',
    color: 'Green',
    sizes: ['Free Size', 'L', 'XL'],
    fabric: 'Pure Tussar Silk',
    image: catBanarasi,
  },
  {
    id: 19,
    title: 'Crimson Gold Zardozi Bridal Drape',
    category: 'Bridal',
    price: 8799,
    originalPrice: 12499,
    badge: 'Bridal',
    color: 'Red',
    fabric: 'Pure Zardozi Silk',
    image: catBridal,
  },
  {
    id: 20,
    title: 'Peach Blossom Sheer Tissue Organza',
    category: 'Organza',
    price: 4399,
    originalPrice: 5899,
    badge: 'Organza',
    color: 'Pink',
    fabric: 'Tissue Glass Organza',
    image: arrival4,
  },
  {
    id: 21,
    title: 'Bandhani Silk Jaipuri Heritage Saree',
    category: 'Bandhani',
    price: 5299,
    originalPrice: 7499,
    badge: 'Bandhani',
    color: 'Red',
    sizes: ['Free Size', 'M', 'L'],
    fabric: 'Georgette Bandhani',
    image: arrival1,
  },
  {
    id: 22,
    title: 'Paithani Heritage Peacock Pallu Saree',
    category: 'Paithani',
    price: 9499,
    originalPrice: 13999,
    badge: 'Paithani',
    color: 'Green',
    sizes: ['Free Size', 'S', 'M', 'L'],
    fabric: 'Pure Silk Paithani',
    image: arrival2,
  },
  {
    id: 23,
    title: 'Partywear Shimmer Net Designer Saree',
    category: 'Partywear',
    price: 4699,
    originalPrice: 6599,
    badge: 'Partywear',
    color: 'Pink',
    sizes: ['Free Size', 'M', 'L'],
    fabric: 'Designer Net & Sequin',
    image: arrival4,
  },
]

export default function Collections() {
  const { addToCart } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const categoryParam = searchParams.get('category') || 'All'

  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [maxPrice, setMaxPrice] = useState(15000)
  const [sortBy, setSortBy] = useState('featured')
  const [addedIds, setAddedIds] = useState([])
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

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

  const categories = [
    { label: 'All Products', value: 'All' },
    { label: 'Banarasi Sarees', value: 'Banarasi' },
    { label: 'Kanjivaram Silk', value: 'Kanjivaram' },
    { label: 'Bridal Edit', value: 'Bridal' },
    { label: 'Handloom Sarees', value: 'Handloom' },
    { label: 'Organza Tissue', value: 'Organza' },
    { label: 'Chanderi Weaves', value: 'Chanderi' },
    { label: 'Chiffon & Georgette', value: 'Chiffon' },
    { label: 'Bandhani & Patola', value: 'Bandhani' },
    { label: 'Paithani Heritage', value: 'Paithani' },
    { label: 'Partywear Net', value: 'Partywear' },
  ]

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
    setMaxPrice(15000)
    setSortBy('featured')
    setCurrentPage(1)
    const newParams = new URLSearchParams()
    setSearchParams(newParams)
  }

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = allProductsList.filter((item) => {
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory
      const matchPrice = item.price <= maxPrice
      const query = searchQuery.trim().toLowerCase()
      const matchSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.fabric && item.fabric.toLowerCase().includes(query)) ||
        (item.badge && item.badge.toLowerCase().includes(query))
      return matchCategory && matchPrice && matchSearch
    })

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.id - a.id)
    }

    return result
  }, [selectedCategory, maxPrice, sortBy, searchQuery])

  // Reset to page 1 whenever any filter or search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, maxPrice, sortBy, searchQuery])

  // Always scroll to top when Collections page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  // Pagination calculations: 9 products per page (3x3 grid)
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
    <div className="w-full bg-[#FAF7F2] min-h-screen pt-[76px] sm:pt-[84px] md:pt-[136px] lg:pt-[144px] pb-16 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* ─── Unified Top Bar: Sort by & Filters ─── */}
        <div className="flex items-center justify-between lg:justify-end gap-3 pt-1 pb-3 sm:py-3 border-b border-[#EDE4D8]">
          {/* Sort By Dropdown & Mobile Filter Button */}
          <div className="flex items-center justify-between w-full lg:w-auto gap-3 shrink-0">
            {/* Mobile Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-[#EDE4D8] rounded-none-xl text-xs font-semibold text-[#1F1713] shadow-2xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h18m-14 7.5h10m-7 7.5h4" />
              </svg>
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#73655B]">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-[#E3D7C7] rounded-none-xl px-3 py-2 text-xs font-medium text-[#1F1713] focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* ─── Mobile Filter Backdrop Overlay ─── */}
        {mobileFilterOpen && (
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-2xs z-40 lg:hidden animate-fade-in"
            onClick={() => setMobileFilterOpen(false)}
          />
        )}

        {/* ─── Main Grid: Filter Sidebar & Product Cards In The Exact Same Row ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* ══════════ LEFT FILTER SIDEBAR (Desktop & Mobile Drawer) ══════════ */}
          <aside
            className={`lg:col-span-3 bg-white rounded-none-3xl border border-[#EDE4D8] p-6 shadow-sm ${mobileFilterOpen ? 'block fixed inset-x-4 top-20 z-50 max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in' : 'hidden lg:block'
              }`}
          >
            {/* Filter Header & Reset & Mobile Close Cross Icon */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F0E8DC]">
              <span className="font-serif text-base font-bold uppercase tracking-wider text-[#1F1713]">
                Filters
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-[#8B7C72] hover:text-primary underline cursor-pointer"
                >
                  Reset
                </button>
                {/* Mobile Cancel / Close Cross (✕) Button */}
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="lg:hidden p-1 text-stone-400 hover:text-primary hover:bg-[#FAF4EC] rounded-none-full transition-colors cursor-pointer"
                  aria-label="Close filters"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 1. Category Radio / Checkbox List */}
            <div className="py-5 border-b border-[#F0E8DC]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1F1713] mb-3">
                Category
              </h4>
              <div className="space-y-2.5">
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

            {/* 2. Price Range Slider */}
            <div className="py-5 border-b border-[#F0E8DC]">
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
                min="2000"
                max="15000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#8B7C72] mt-1 font-light">
                <span>₹2,000</span>
                <span>₹15,000+</span>
              </div>
            </div>

            {mobileFilterOpen && (
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full mt-3 py-2.5 bg-primary text-white rounded-none-xl text-xs font-semibold cursor-pointer shadow-xs"
              >
                Apply Filters
              </button>
            )}
          </aside>

          {/* ══════════ RIGHT PRODUCTS: In Same Top Row As Filter ══════════ */}
          <main className="lg:col-span-9">
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

            {/* Product Grid: Exactly 3 in a Row on Desktop, Top-Aligned with Filter Sidebar */}
            {filteredProducts.length === 0 ? (
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
                {/* Responsive Grid: 2 per row (<700px down to 320px), 3 per row (>=700px) */}
                <div className="grid grid-cols-2 min-[700px]:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-6">
                  {paginatedProducts.map((product) => {
                    const isAdded = addedIds.includes(product.id)
                    const discountPercent = Math.round(
                      ((product.originalPrice - product.price) / product.originalPrice) * 100
                    )

                    return (
                      <div
                        key={product.id}
                        className="group flex flex-col bg-white border border-[#EAE1D5] rounded-none-xl sm:rounded-none-2xl lg:rounded-none-3xl p-2.5 sm:p-3 lg:p-3.5 transition-all duration-300 hover:shadow-xl hover:border-secondary/40"
                      >
                        {/* Product Image Frame */}
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none-lg sm:rounded-none-xl lg:rounded-none-2xl bg-[#F2ECE2]">
                          <Link to={`/product/${product.id}`} className="block w-full h-full">
                            <img
                              src={product.image}
                              alt={product.title}
                              loading="lazy"
                              className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                            />
                          </Link>


                        </div>

                        {/* Product Content Details (Clean without rating stars) */}
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
                                ₹{product.price.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] sm:text-xs text-[#9E9189] line-through font-normal">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                              </span>
                              {discountPercent > 0 && (
                                <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded-none">
                                  {discountPercent}% OFF
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Full-width "+ Add to Cart" Button (Opens Slide-out Cart Drawer Popup) */}
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(product, e)}
                            className={`mt-2.5 sm:mt-3 w-full py-2 sm:py-2.5 lg:py-3 px-2 sm:px-4 rounded-none-lg sm:rounded-none-xl text-[11px] sm:text-xs lg:text-sm font-medium tracking-wide transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer shadow-2xs active:scale-98 ${isAdded
                              ? 'bg-secondary text-primary-dark font-semibold'
                              : 'bg-[#F4ECE1] text-[#2B1F19] hover:bg-primary hover:text-white'
                              }`}
                          >
                            {isAdded ? (
                              <>
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                                <span>Added to Cart</span>
                              </>
                            ) : (
                              <>
                                <span className="text-sm sm:text-base font-light leading-none">+</span>
                                <span>Add to Cart</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* ─── Page Navigation Controls (After 9 Products) ─── */}
                {totalPages > 1 && (
                  <div className="mt-12 pt-6 border-t border-[#EDE4D8] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-[#73655B] font-light">
                      Page <span className="font-semibold text-[#1F1713]">{currentPage}</span> of{' '}
                      <span className="font-semibold text-[#1F1713]">{totalPages}</span> ({filteredProducts.length} total sarees)
                    </p>

                    <div className="flex items-center gap-2 select-none">
                      {/* Prev Button */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-none-xl text-xs font-semibold transition-all ${currentPage === 1
                          ? 'text-stone-300 border border-stone-200 cursor-not-allowed bg-stone-50'
                          : 'text-[#1F1713] border border-[#EDE4D8] bg-white hover:border-primary hover:text-primary cursor-pointer shadow-2xs'
                          }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        <span>Prev</span>
                      </button>

                      {/* Numbered Page Buttons */}
                      <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
                          const isActive = num === currentPage
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => handlePageChange(num)}
                              className={`w-9 h-9 rounded-none-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center border ${isActive
                                ? 'bg-primary text-white border-primary shadow-xs'
                                : 'bg-white text-[#40342C] border-[#EDE4D8] hover:border-primary hover:text-primary'
                                }`}
                            >
                              {num}
                            </button>
                          )
                        })}
                      </div>

                      {/* Next Button */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-none-xl text-xs font-semibold transition-all ${currentPage === totalPages
                          ? 'text-stone-300 border border-stone-200 cursor-not-allowed bg-stone-50'
                          : 'text-[#1F1713] border border-[#EDE4D8] bg-white hover:border-primary hover:text-primary cursor-pointer shadow-2xs'
                          }`}
                      >
                        <span>Next</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </div>
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
