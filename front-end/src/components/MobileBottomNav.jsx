import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useCustomerAuth } from '../context/CustomerAuthContext'

export default function MobileBottomNav() {
  const location = useLocation()
  const { totalCount, openCart } = useCart()
  const { isAuthenticated } = useCustomerAuth()

  const isCollections = location.pathname === '/collections'
  const isOrders = location.pathname.startsWith('/orders')
  const isProfile = location.pathname === '/profile' || location.pathname.startsWith('/addresses') || location.pathname === '/login'

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-[#DEA53B] via-[#E8B85A] to-[#DEA53B] border-t border-[#C4933F] shadow-[0_-8px_30px_rgba(222,165,59,0.35)] px-2 py-1.5 transition-all duration-300 safe-area-bottom"
    >
      <div className="max-w-md mx-auto grid grid-cols-4 items-center justify-items-center">
        {/* 1. Category / Collections */}
        <Link
          to="/collections"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-none-lg transition-all duration-200 group select-none ${isCollections ? 'text-[#5C0317] scale-105' : 'text-[#3E2510] hover:text-[#5C0317]'
            }`}
        >
          <div className="relative mb-0.5">
            <svg
              className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isCollections ? 'text-[#5C0317]' : 'text-current'
                }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={isCollections ? '2.4' : '1.8'}
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <span
            className={`text-[9.5px] font-sans tracking-wider uppercase font-semibold leading-tight transition-colors ${isCollections ? 'text-[#5C0317] font-extrabold' : 'text-[#3E2510]'
              }`}
          >
            Category
          </span>
        </Link>

        {/* 2. Cart (Opens global cart drawer) */}
        <button
          type="button"
          onClick={openCart}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-none-lg transition-all duration-200 group select-none text-[#3E2510] hover:text-[#5C0317] cursor-pointer"
          aria-label={`Open Cart with ${totalCount} items`}
        >
          <div className="relative mb-0.5">
            <svg
              className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 text-current"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <circle cx="9" cy="21" r="1.2" fill="currentColor" />
              <circle cx="20" cy="21" r="1.2" fill="currentColor" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#6D021B] text-white text-[9.5px] font-black w-4 h-4 rounded-none-full flex items-center justify-center leading-none shadow-md ring-1 ring-[#DEA53B]">
                {totalCount}
              </span>
            )}
          </div>
          <span className="text-[9.5px] font-sans tracking-wider uppercase font-semibold leading-tight text-[#3E2510]">
            Cart
          </span>
        </button>

        {/* 3. Orders */}
        <Link
          to="/orders"
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-none-lg transition-all duration-200 group select-none ${isOrders ? 'text-[#5C0317] scale-105' : 'text-[#3E2510] hover:text-[#5C0317]'
            }`}
        >
          <div className="relative mb-0.5">
            <svg
              className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isOrders ? 'text-[#5C0317]' : 'text-current'
                }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={isOrders ? '2.4' : '1.8'}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <span
            className={`text-[9.5px] font-sans tracking-wider uppercase font-semibold leading-tight transition-colors ${isOrders ? 'text-[#5C0317] font-extrabold' : 'text-[#3E2510]'
              }`}
          >
            Orders
          </span>
        </Link>

        {/* 4. My Account / Login */}
        <Link
          to={isAuthenticated ? "/profile" : "/login"}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-none-lg transition-all duration-200 group select-none ${isProfile ? 'text-[#5C0317] scale-105' : 'text-[#3E2510] hover:text-[#5C0317]'
            }`}
        >
          <div className="relative mb-0.5">
            <svg
              className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isProfile ? 'text-[#5C0317]' : 'text-current'
                }`}
              fill="none"
              stroke="currentColor"
              strokeWidth={isProfile ? '2.4' : '1.8'}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span
            className={`text-[9.5px] font-sans tracking-wider uppercase font-semibold leading-tight transition-colors ${isProfile ? 'text-[#5C0317] font-extrabold' : 'text-[#3E2510]'
              }`}
          >
            {isAuthenticated ? 'Account' : 'Login'}
          </span>
        </Link>
      </div>
    </nav>
  )
}

