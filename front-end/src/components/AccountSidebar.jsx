import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import notify from '../utils/toast'
import { useConfirm } from '../context/ConfirmModalContext'
import { useCart } from '../context/CartContext'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import {
  User,
  Package,
  MapPin,
  ShoppingCart,
  LogOut,
  X,
  Menu,
} from 'lucide-react'

export default function AccountSidebar({ active }) {
  const navigate = useNavigate()
  const location = useLocation()
  const confirm = useConfirm()
  const { openCart, totalCount } = useCart()
  const { logout, customer } = useCustomerAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Auto-detect current active tab if not explicitly passed
  const currentTab =

    active ||
    (location.pathname.includes('/addresses')
      ? 'addresses'
      : location.pathname.includes('/orders')
        ? 'orders'
        : 'profile')

  const menuItems = [
    {
      id: 'profile',
      label: 'Profile',
      path: '/profile',
      icon: User,
    },
    {
      id: 'orders',
      label: 'Orders',
      path: '/orders',
      icon: Package,
    },
    {
      id: 'addresses',
      label: 'Address Book',
      path: '/addresses',
      icon: MapPin,
    },

    {
      id: 'cart',
      label: 'Cart',
      isCart: true,
      icon: ShoppingCart,
    },
  ]

  // Close popup with Escape key
  useEffect(() => {
    if (!mobileMenuOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const handleItemClick = (item) => {
    setMobileMenuOpen(false)
    if (item.isCart) {
      openCart()
    } else if (item.path) {
      navigate(item.path)
    }
  }

  const handleLogout = async () => {
    const isConfirmed = await confirm({
      title: 'Sign Out Confirmation',
      message: 'Are you sure you want to sign out of your customer account?',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      type: 'logout',
    })

    if (isConfirmed) {
      logout()
      setMobileMenuOpen(false)
      notify.success('Logged out successfully.')
      navigate('/')
    }
  }

  return (
    <>
      {/* ─── 1. MOBILE TOP RIGHT MENU BUTTON (Closed State, Hidden on md:) ─── */}
      <div className="md:hidden w-full flex justify-end mb-2.5 sm:mb-3">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs sm:text-sm px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-none-xl shadow-md flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all active:scale-95 shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.4} />
          <span>Menu</span>
        </button>
      </div>

      {/* ─── 2. MOBILE RIGHT-SIDE SLIDE-OVER DRAWER & BACKDROP ─── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/45 backdrop-blur-2xs transition-opacity duration-300 md:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Drawer Panel Sliding in from Right Side */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[265px] xs:w-[285px] p-3 flex flex-col justify-start transition-transform duration-300 ease-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Top Button in Open State: [ ✕ Menu ] */}
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs px-3.5 py-1.5 rounded-none-xl shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
            aria-label="Close menu"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Menu</span>
          </button>
        </div>

        {/* My Account Drawer Card matching Reference Image */}
        <div className="rounded-none-2xl overflow-hidden shadow-2xl border border-[#EDE4D8] bg-white flex flex-col animate-fade-in">
          {/* Header: Solid Primary Maroon */}
          <div className="bg-primary text-white px-5 py-4 font-bold text-lg font-serif tracking-wide">
            My Account
          </div>

          {/* Menu Items List */}
          <div className="divide-y divide-stone-100/90 py-1">
            {menuItems.map((item) => {
              const isActive = currentTab === item.id
              const IconComp = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 text-sm transition-all text-left cursor-pointer relative ${isActive
                    ? 'text-primary font-semibold bg-[#FAF4EC]/80 border-l-4 border-primary pl-4'
                    : 'text-stone-700 hover:text-primary hover:bg-stone-50'
                    }`}
                >
                  <div className="flex items-center gap-3.5">
                    <IconComp
                      className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-stone-500'}`}
                      strokeWidth={1.75}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-none-full ${isActive ? 'bg-primary text-white' : 'bg-primary text-white'
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}

            {/* Logout Action */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3.5 px-5 py-3.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-5 h-5 shrink-0 text-rose-500" strokeWidth={1.75} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 3. DESKTOP/TABLET SIDEBAR (Hidden on mobile < 768px, Visible on md: 768px+) ─── */}
      <div className="hidden md:flex md:col-span-4 lg:col-span-4 bg-white rounded-none-2xl sm:rounded-none-3xl border border-[#EDE4D8] p-6 shadow-sm flex-col md:sticky md:top-28 lg:top-32 self-start z-10">
        {/* Nav Menu */}
        <div className="py-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id
            const IconComp = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-none-xl text-xs sm:text-sm font-medium transition-all cursor-pointer relative ${isActive
                  ? 'bg-primary text-white shadow-xs font-semibold'
                  : 'text-[#3E3228] hover:bg-[#FAF4EC] hover:text-primary'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <IconComp
                    className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#73655B]'}`}
                    strokeWidth={1.75}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-none-full ${isActive ? 'bg-white text-primary' : 'bg-primary text-white'
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Logout Action */}
        <div className="pt-3 border-t border-[#F0E8DC]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-none-xl text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-600" strokeWidth={1.75} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}
