import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { allProductsList } from '../pages/user/collections'

// Social Media Icons
const FacebookIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const InstagramIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

const XTwitterIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const YouTubeIcon = () => (
  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

const PhoneIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25z" />
  </svg>
)

// Navbar Action Icons
const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-800 hover:text-primary transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m20 20-3.8-3.8" />
  </svg>
)

const UserIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const CartIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="9" cy="21" r="1.2" fill="currentColor" />
    <circle cx="20" cy="21" r="1.2" fill="currentColor" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

const MenuIcon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
    <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
    <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
    <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
  </svg>
)

// Nav links: Home, Collections, About Us & Contact Us use client-side routing
const navLinks = [
  // { label: 'Home', to: '/', isRoute: true },
  { label: 'Collections', to: '/collections', isRoute: true },
  { label: 'Category', href: '/Category' },
  { label: 'About Us', to: '/about', isRoute: true },
  { label: 'Contact Us', to: '/contact', isRoute: true },
]

// 10 Curated Saree Categories
export const sareeCategories = [
  { name: 'Banarasi Silk Sarees', category: 'Banarasi' },
  { name: 'Kanjivaram Silk Sarees', category: 'Kanjivaram' },
  { name: 'Chanderi Sarees', category: 'Chanderi' },
  { name: 'Organza Tissue Sarees', category: 'Organza' },
  { name: 'Chiffon & Georgette', category: 'Chiffon' },
  { name: 'Handloom Tussar Silk', category: 'Handloom' },
  { name: 'Bandhani & Patola Sarees', category: 'Bandhani' },
  { name: 'Paithani Heritage Sarees', category: 'Paithani' },
  { name: 'Bridal Heavy Zardozi', category: 'Bridal' },
  { name: 'Partywear Net Sarees', category: 'Partywear' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { totalCount, openCart } = useCart()
  const navRef = useRef(null)
  const dropdownRef = useRef(null)
  const searchBoxRef = useRef(null)
  const mobileSearchInputRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [navSearch, setNavSearch] = useState('')
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false)

  // Filter products for instant dropdown: matches title, category, or fabric
  const searchSuggestions = useMemo(() => {
    const query = navSearch.trim().toLowerCase()
    if (!query) return []
    return allProductsList.filter((item) =>
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      (item.fabric && item.fabric.toLowerCase().includes(query))
    )
  }, [navSearch])

  // Sync search input with URL query when on collections page
  useEffect(() => {
    if (location.pathname === '/collections') {
      setNavSearch(searchParams.get('search') || '')
    } else {
      setNavSearch('')
    }
  }, [location.pathname, searchParams])

  const handleSearchChange = (value) => {
    setNavSearch(value)
    setSearchDropdownOpen(Boolean(value.trim()))
    if (location.pathname === '/collections') {
      if (value.trim()) {
        navigate(`/collections?search=${encodeURIComponent(value.trim())}`, { replace: true })
      } else {
        navigate('/collections', { replace: true })
      }
    }
  }

  const handleSelectProduct = (product) => {
    setNavSearch('')
    setSearchDropdownOpen(false)
    setMobileSearchOpen(false)
    if (product && product.id) {
      navigate(`/product/${product.id}`)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setSearchDropdownOpen(false)
    setMobileSearchOpen(false)
    const trimmed = navSearch.trim()
    if (trimmed) {
      navigate(`/collections?search=${encodeURIComponent(trimmed)}`)
    } else {
      navigate('/collections')
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false)
      }
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(e.target) &&
        mobileSearchInputRef.current &&
        !mobileSearchInputRef.current.contains(e.target)
      ) {
        setSearchDropdownOpen(false)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Keep CSS custom property --navbar-height synchronized with exact header height
  useEffect(() => {
    if (!navRef.current) return
    const updateNavbarHeight = () => {
      if (navRef.current) {
        const height = navRef.current.offsetHeight
        document.documentElement.style.setProperty('--navbar-height', `${height}px`)
      }
    }
    updateNavbarHeight()
    const resizeObserver = new ResizeObserver(updateNavbarHeight)
    resizeObserver.observe(navRef.current)
    window.addEventListener('resize', updateNavbarHeight)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateNavbarHeight)
    }
  }, [])

  return (
    <header className="w-full fixed top-0 left-0 z-50 font-sans transition-all duration-300" ref={navRef}>
      {/* ─── 1. TOP BAR: Smoothly collapses/hides on scroll ─── */}
      <div
        className={`bg-primary text-white tracking-wider items-center overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${scrolled ? 'max-h-0 opacity-0 -translate-y-2 pointer-events-none' : 'max-h-10 opacity-100 translate-y-0'
          }`}
        style={{ paddingLeft: 'clamp(12px, 3vw, 48px)', paddingRight: 'clamp(12px, 3vw, 48px)' }}
      >
        <div className="max-w-7xl mx-auto w-full h-6 sm:h-7 flex items-center justify-between gap-2">
          {/* Left: Social Icons - hidden on small mobile to give full space to the announcement */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <a href="#facebook" aria-label="Facebook" className="text-white/80 hover:text-secondary transition-colors duration-150">
              <FacebookIcon />
            </a>
            <a href="#instagram" aria-label="Instagram" className="text-white/80 hover:text-secondary transition-colors duration-150">
              <InstagramIcon />
            </a>
            <a href="#twitter" aria-label="X Twitter" className="text-white/80 hover:text-secondary transition-colors duration-150">
              <XTwitterIcon />
            </a>
            <a href="#youtube" aria-label="YouTube" className="text-white/80 hover:text-secondary transition-colors duration-150">
              <YouTubeIcon />
            </a>
          </div>

          {/* Center: Promo Announcement Text - Elegant, single-line, perfectly balanced */}
          <div className="w-full sm:w-auto text-center flex-1 min-w-0">
            <p className="font-medium tracking-[0.04em] sm:tracking-[0.08em] uppercase text-[9px] xs:text-[9.5px] sm:text-[10.5px] truncate text-white/95 leading-normal">
              Pay Online &amp; GET 10% OFF
            </p>
          </div>

          {/* Right: Balanced spacer on tablet/desktop */}
          <div className="hidden sm:flex items-center gap-2.5 opacity-0 pointer-events-none select-none shrink-0">
            <FacebookIcon />
            <InstagramIcon />
            <XTwitterIcon />
            <YouTubeIcon />
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN NAVBAR: Fully Responsive Layout across All Screen Sizes ─── */}
      <nav
        className={`border-b transition-all duration-500 py-1 sm:py-1.5 px-2 xs:px-3 sm:px-6 md:px-8 lg:px-12 ${scrolled
          ? 'bg-[#5B0216] shadow-[0_10px_35px_rgba(91,2,22,0.45)] border-[#DEA53B]/40'
          : 'bg-white/98 backdrop-blur-md shadow-none border-gray-200/80'
          }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-2">

            {/* LEFT SECTION: Logo Section & Mobile Hamburger (< lg) */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Mobile Menu Toggle Button (Hamburger) on the far left */}
              <button
                className={`lg:hidden p-1 -ml-1 transition-colors cursor-pointer shrink-0 ${scrolled ? 'text-secondary hover:text-white' : 'text-gray-800 hover:text-primary'
                  }`}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle navigation menu"
              >
                {mobileOpen ? <CloseIcon /> : <MenuIcon />}
              </button>

              {/* Logo Emblem & Brand Text on the Left */}
              <Link
                to="/"
                className="flex items-center gap-2 xs:gap-2.5 sm:gap-3 group py-0.5 tracking-wide select-none cursor-pointer"
              >
                {/* Brand Logo Emblem Image */}
                <img
                  src={`${import.meta.env.BASE_URL || '/'}slides/logo.png`}
                  alt="Vastraa Emblem"
                  className="h-9 xs:h-10 sm:h-11 md:h-13 lg:h-14 w-auto object-contain transition-all duration-300 group-hover:scale-105 shrink-0 drop-shadow-xs"
                />

                {/* VASTRAA Brand Text */}
                <div className="flex flex-col items-start justify-center text-left">
                  <span
                    className={`font-serif text-[14px] xs:text-[15px] sm:text-[17px] md:text-[19px] lg:text-[21px] font-black tracking-[0.16em] sm:tracking-[0.18em] transition-colors leading-none uppercase ${scrolled
                      ? 'text-[#FFF8ED] drop-shadow-sm group-hover:text-secondary'
                      : 'text-[#1F1713] group-hover:text-primary'
                      }`}
                  >
                    VASTRAA
                  </span>
                  <span
                    className={`text-[6.5px] xs:text-[7px] sm:text-[8px] md:text-[9px] lg:text-[9.5px] font-sans font-bold tracking-[0.2em] sm:tracking-[0.24em] transition-colors uppercase mt-1 leading-none ${scrolled
                      ? 'text-secondary'
                      : 'text-[#8C7667] group-hover:text-secondary'
                      }`}
                  >
                    THE HOUSE OF SAREES
                  </span>
                </div>
              </Link>
            </div>

            {/* CENTER SECTION: Centered Nav Links (Desktop >= lg, Title Case / Normal Casing) */}
            <div className="hidden lg:flex flex-1 items-center justify-center gap-5 xl:gap-8 px-4">
              {navLinks.map((link, idx) => {
                if (link.label.toLowerCase() === 'category') {
                  return (
                    <div
                      key={idx}
                      ref={dropdownRef}
                      className="relative"
                      onMouseEnter={() => setCategoryDropdownOpen(true)}
                      onMouseLeave={() => setCategoryDropdownOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                        className={`text-[13px] xl:text-[14px] font-medium tracking-[0.02em] transition-colors duration-200 cursor-pointer py-1 relative group inline-flex items-center gap-1.5 whitespace-nowrap ${scrolled
                          ? 'text-white hover:text-secondary'
                          : 'text-[#1F1713] hover:text-primary'
                          }`}
                      >
                        <span>{link.label}</span>
                        <svg
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180 text-secondary' : scrolled ? 'text-secondary/80' : 'text-gray-500'
                            }`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                        <span className={`absolute bottom-0 left-0 w-0 h-[2px] transition-all duration-200 group-hover:w-full ${scrolled ? 'bg-secondary' : 'bg-primary'
                          }`} />
                      </button>

                      {/* Dropdown Menu (Scrollable after 6 items, showing 10 items) */}
                      {categoryDropdownOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 animate-fade-in w-64">
                          <div className="bg-white rounded-none-none shadow-2xl border border-stone-200/90 overflow-hidden">
                            <div className="max-h-[280px] overflow-y-auto divide-y divide-stone-100 py-1 scrollbar-thin scrollbar-thumb-stone-300">
                              {sareeCategories.map((cat, catIdx) => (
                                <button
                                  key={catIdx}
                                  type="button"
                                  onClick={() => {
                                    setCategoryDropdownOpen(false)
                                    navigate(`/collections?category=${encodeURIComponent(cat.category)}`)
                                  }}
                                  className="w-full text-left flex items-center px-4 py-2.5 hover:bg-[#FAF4EC] hover:text-primary transition-all duration-150 group/item cursor-pointer"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-none-none bg-secondary opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                    <span className="text-xs font-medium text-stone-800 group-hover/item:text-primary group-hover/item:font-semibold">
                                      {cat.name}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>

                            <div className="p-2.5 bg-stone-50/70 border-t border-stone-100 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setCategoryDropdownOpen(false)
                                  navigate('/collections')
                                }}
                                className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                              >
                                View All Categories →
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }

                if (link.isRoute) {
                  const isActive = location.pathname === link.to
                  return (
                    <Link
                      key={idx}
                      to={link.to}
                      className={`text-[13px] xl:text-[14px] font-medium tracking-[0.02em] transition-colors duration-200 cursor-pointer py-1 relative group whitespace-nowrap ${isActive
                        ? scrolled ? 'text-secondary font-bold' : 'text-primary font-bold'
                        : scrolled
                          ? 'text-white hover:text-secondary'
                          : 'text-[#1F1713] hover:text-primary'
                        }`}
                    >
                      <span>{link.label}</span>
                      <span
                        className={`absolute bottom-0 left-0 h-[2px] transition-all duration-200 ${scrolled ? 'bg-secondary' : 'bg-primary'
                          } ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}
                      />
                    </Link>
                  )
                }

                return (
                  <a
                    key={idx}
                    href={link.href}
                    className={`text-[13px] xl:text-[14px] font-medium tracking-[0.02em] transition-colors duration-200 cursor-pointer py-1 relative group whitespace-nowrap ${scrolled ? 'text-white hover:text-secondary' : 'text-[#1F1713] hover:text-primary'
                      }`}
                  >
                    <span>{link.label}</span>
                    <span className={`absolute bottom-0 left-0 w-0 h-[2px] transition-all duration-200 group-hover:w-full ${scrolled ? 'bg-secondary' : 'bg-primary'
                      }`} />
                  </a>
                )
              })}
            </div>

            {/* RIGHT SECTION: Mobile Search Icon (< lg); Search Bar + Cart + Account on Desktop (>= lg) */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 md:gap-4 shrink-0">
              {/* Mobile Search Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  setMobileSearchOpen((prev) => {
                    const next = !prev
                    if (next) {
                      setTimeout(() => mobileSearchInputRef.current?.focus(), 150)
                    }
                    return next
                  })
                }}
                aria-label="Toggle mobile search"
                className={`lg:hidden p-1.5 transition-colors cursor-pointer shrink-0 ${mobileSearchOpen
                  ? 'text-secondary'
                  : scrolled
                    ? 'text-white hover:text-secondary'
                    : 'text-[#1F1713] hover:text-primary'
                  }`}
              >
                {mobileSearchOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="m20 20-3.8-3.8" />
                  </svg>
                )}
              </button>

              {/* Desktop Search Bar with Live Dropdown (hidden on mobile, visible on lg+) */}
              <form
                ref={searchBoxRef}
                onSubmit={handleSearchSubmit}
                className="hidden lg:flex relative items-center group/search flex-1 max-w-[280px] xl:max-w-[320px] justify-end"
              >
                <div className="relative w-full transition-all duration-300">
                  <input
                    type="text"
                    value={navSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => {
                      if (navSearch.trim()) setSearchDropdownOpen(true)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setSearchDropdownOpen(false)
                    }}
                    placeholder="Search saree, silk..."
                    className={`w-full pl-9 pr-8 py-2 text-xs lg:text-[13px] font-normal tracking-wide rounded-none-none border focus:outline-none transition-all duration-200 ${scrolled
                      ? 'bg-white/95 text-[#1F1713] placeholder-[#7D6B60] border-secondary/40 focus:border-secondary focus:ring-1 focus:ring-secondary shadow-sm'
                      : 'bg-[#FAF7F2] hover:bg-[#F5EFE6] focus:bg-white text-[#1F1713] placeholder-[#9E8B7F] border-[#E8DDCE] hover:border-[#D4C3AC] focus:border-[#6D021B] focus:ring-1 focus:ring-[#6D021B]'
                      }`}
                  />
                  {/* Left Magnifying Glass Icon */}
                  <div className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${scrolled ? 'text-primary' : 'text-[#8C7667] group-focus-within/search:text-primary'
                    }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="7" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="m20 20-3.8-3.8" />
                    </svg>
                  </div>
                  {/* Clear Button */}
                  {navSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        handleSearchChange('')
                        setSearchDropdownOpen(false)
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-none-none bg-stone-300/80 hover:bg-primary text-white flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Clear search"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}

                  {/* Search Results Live Dropdown */}
                  {searchDropdownOpen && navSearch.trim() && (
                    <div className="absolute top-full mt-1 right-0 w-80 bg-white rounded-none-none shadow-2xl border border-[#E3D7C7] overflow-hidden z-50 animate-fade-in">
                      {searchSuggestions.length > 0 ? (
                        <div className="max-h-72 overflow-y-auto divide-y divide-[#F0E6D8]/80 py-1 scrollbar-thin scrollbar-thumb-stone-300">
                          {searchSuggestions.map((product) => (
                            <Link
                              key={product.id}
                              to={`/product/${product.id}`}
                              onMouseDown={(e) => {
                                e.preventDefault()
                                handleSelectProduct(product)
                              }}
                              className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-[#FAF5ED] transition-colors cursor-pointer group"
                            >
                              <img
                                src={product.image}
                                alt={product.title}
                                className="w-11 h-11 rounded-none-none object-cover shrink-0 bg-[#F2ECE2] border border-[#EFE7DC]"
                              />
                              <span className="text-xs sm:text-[13px] font-medium text-[#1F1713] group-hover:text-primary transition-colors truncate flex-1 min-w-0">
                                {product.title}
                              </span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-4 text-center">
                          <p className="text-xs text-[#8B7C72]">No sarees found matching "{navSearch}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </form>

              {/* Desktop-only: Cart Icon with dynamic badge */}
              <button
                type="button"
                onClick={openCart}
                aria-label={`Cart with ${totalCount} items`}
                className={`hidden lg:inline-flex p-1.5 transition-colors relative cursor-pointer shrink-0 ${scrolled ? 'text-white hover:text-secondary' : 'text-gray-700 hover:text-primary'
                  }`}
              >
                <CartIcon />
                {totalCount > 0 && (
                  <span className={`absolute -top-1 -right-1 text-white text-[9px] xs:text-[10px] font-bold w-3.5 h-3.5 xs:w-4 xs:h-4 rounded-none-full flex items-center justify-center leading-none shadow-xs ${scrolled ? 'bg-secondary text-primary-dark font-black' : 'bg-primary'
                    }`}>
                    {totalCount}
                  </span>
                )}
              </button>

              {/* Desktop-only: User Account / Profile */}
              <button
                type="button"
                onClick={() => navigate('/profile')}
                aria-label="Account Profile"
                className={`hidden lg:inline-flex p-1.5 transition-colors cursor-pointer shrink-0 ${scrolled ? 'text-white hover:text-secondary' : 'text-gray-700 hover:text-primary'
                  }`}
              >
                <UserIcon />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── MOBILE SEARCH EXPANDABLE BAR: Positioned smoothly below navbar with full z-index visibility above slider ─── */}
      <div
        className={`lg:hidden relative z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${mobileSearchOpen
          ? 'opacity-100 border-b border-[#DEA53B]/30 shadow-2xl pointer-events-auto'
          : 'max-h-0 opacity-0 overflow-hidden pointer-events-none'
          } ${scrolled ? 'bg-[#4A0111]' : 'bg-[#FAF7F2]'}`}
      >
        <div className="px-3 py-2.5">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="relative w-full">
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={navSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  if (navSearch.trim()) setSearchDropdownOpen(true)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setMobileSearchOpen(false)
                    setSearchDropdownOpen(false)
                  }
                }}
                placeholder="Search saree, silk, collection..."
                className="w-full pl-9 pr-9 py-2 text-xs font-normal tracking-wide rounded-none-none bg-white text-[#1F1713] placeholder-[#8C7667] border border-[#DEA53B]/50 focus:border-[#DEA53B] focus:ring-1 focus:ring-[#DEA53B] focus:outline-none shadow-sm"
              />
              {/* Left Search Icon */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="m20 20-3.8-3.8" />
                </svg>
              </div>
              {/* Clear button */}
              {navSearch && (
                <button
                  type="button"
                  onClick={() => {
                    handleSearchChange('')
                    setSearchDropdownOpen(false)
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-none-none bg-stone-300 hover:bg-primary text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </form>

          {/* Mobile Live Suggestions Dropdown - Positioned as an absolute popover over slider with high z-index */}
          {searchDropdownOpen && navSearch.trim() && (
            <div className="absolute left-3 right-3 top-full mt-1 bg-white rounded-none-none shadow-[0_15px_35px_rgba(0,0,0,0.35)] border border-[#DEA53B]/40 overflow-hidden z-50 animate-fade-in">
              {searchSuggestions.length > 0 ? (
                <div className="max-h-72 overflow-y-auto divide-y divide-[#F0E6D8]/80 py-1 scrollbar-thin scrollbar-thumb-stone-300">
                  {searchSuggestions.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSelectProduct(product)
                      }}
                      className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-[#FAF5ED] transition-colors cursor-pointer group"
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-11 h-11 rounded-none-none object-cover shrink-0 bg-[#F2ECE2] border border-[#EFE7DC]"
                      />
                      <span className="text-xs font-medium text-[#1F1713] group-hover:text-primary transition-colors truncate flex-1 min-w-0">
                        {product.title}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 text-center">
                  <p className="text-xs text-[#8B7C72]">No sarees found matching "{navSearch}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── MOBILE DRAWER with Category Accordion ─── */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 shadow-xl px-6 py-4 animate-fade-in max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col gap-1">
            {navLinks.map((link, idx) => {
              if (link.label.toLowerCase() === 'category') {
                return (
                  <div key={idx} className="border-b border-gray-100 py-1">
                    <button
                      type="button"
                      onClick={() => setMobileCategoryOpen(!mobileCategoryOpen)}
                      className="w-full flex items-center justify-between text-sm font-semibold tracking-wide text-gray-800 hover:text-primary py-2.5 capitalize"
                    >
                      <span>{link.label}</span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${mobileCategoryOpen ? 'rotate-180 text-primary' : 'text-gray-400'
                          }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>

                    {/* Mobile Saree Categories List (Max-height for 6 items, scroll for the rest) */}
                    {mobileCategoryOpen && (
                      <div className="mt-1 mb-2 bg-[#FAF7F2] rounded-none-none border border-stone-200/70 overflow-hidden">
                        <div className="max-h-[260px] overflow-y-auto divide-y divide-stone-200/50 p-1">
                          {sareeCategories.map((cat, catIdx) => (
                            <button
                              key={catIdx}
                              type="button"
                              onClick={() => {
                                setMobileCategoryOpen(false)
                                setMobileOpen(false)
                                navigate(`/collections?category=${encodeURIComponent(cat.category)}`)
                              }}
                              className="w-full text-left block px-3 py-2 text-xs font-medium text-stone-700 hover:bg-[#FAF4EC] hover:text-primary transition-colors cursor-pointer"
                            >
                              <span>{cat.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              }

              if (link.isRoute) {
                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={idx}
                    to={link.to}
                    className={`block text-sm font-semibold tracking-wide py-2.5 border-b border-gray-100 capitalize ${isActive ? 'text-primary font-bold' : 'text-gray-800 hover:text-primary'
                      }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              }

              return (
                <a
                  key={idx}
                  href={link.href}
                  className="block text-sm font-semibold tracking-wide text-gray-800 hover:text-primary py-2.5 border-b border-gray-100 capitalize"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              )
            })}
          </div>


        </div>
      )}
    </header>
  )
}
