import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Image as ImageIcon,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  PackageX,
  CheckCircle2,
  XCircle,
  Trash2,
  CheckCheck,
  FileBarChart,
} from 'lucide-react'
import vastraaLogo from '../../../public/slides/logo.png'
import arrival1 from '../../assets/products/arrival-1.jpg'
import arrival2 from '../../assets/products/arrival-2.jpg'
import arrival4 from '../../assets/products/arrival-4.jpg'
import catBanarasi from '../../assets/categories/banarasi.jpg'

const initialNotifications = [
  {
    id: 1,
    type: 'out_of_stock', // stock related
    title: 'Product Out of Stock!',
    subtitle: 'Rose Floral Tissue Organza reached 0 units',
    time: '5m ago',
    target: '/admin/notifications',
    isRead: false,
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
    icon: PackageX,
    image: arrival4,
  },
  {
    id: 2,
    type: 'new_order', // order related
    title: 'New Customer Order #ORD-9821',
    subtitle: 'Priya Sharma placed order for ₹12,499 (Banarasi Pure Katan)',
    time: '12m ago',
    target: '/admin/orders',
    isRead: false,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ShoppingBag,
    image: catBanarasi,
  },
  {
    id: 3,
    type: 'low_stock', // stock related
    title: 'Low Stock Alert: 2 units left',
    subtitle: 'Maroon Zari Katan Saree is below threshold (≤ 5 units)',
    time: '25m ago',
    target: '/admin/notifications',
    isRead: false,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: AlertTriangle,
    image: arrival1,
  },
  {
    id: 4,
    type: 'order_cancelled', // order related
    title: 'Order Cancelled #ORD-6211',
    subtitle: 'Kavita Sundaram cancelled order for Organza Tissue (₹8,299)',
    time: '1h ago',
    target: '/admin/orders',
    isRead: false,
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle,
    image: arrival4,
  },
  {
    id: 5,
    type: 'low_stock', // stock related
    title: 'Low Stock Alert: 1 unit left',
    subtitle: 'Festive Gold Temple Saree needs urgent restocking',
    time: '3h ago',
    target: '/admin/notifications',
    isRead: false,
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: AlertTriangle,
    image: arrival2,
  },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const notificationRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleNotificationClick = (n) => {
    // Mark clicked notification as read
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item))
    )
    setNotificationOpen(false)
    navigate(n.target)
  }

  const handleDeleteNotification = (id, e) => {
    e.stopPropagation()
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleClearAll = () => {
    setNotifications([])
  }

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products ', path: '/admin/products', icon: Package, badge: '24' },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag, badge: '5' },
    { name: 'Home CMS', path: '/admin/home-cms', icon: Layers },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Reports', path: '/admin/reports', icon: FileBarChart },
    { name: 'Stock Alerts', path: '/admin/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount.toString() : null },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ]

  const isCurrent = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-[#F8F6F2] font-sans flex text-[#1F1713]">
      {/* ─── Mobile Sidebar Backdrop Overlay ─── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* ─── Admin Left Sidebar ─── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#EDE4D8] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Sidebar Header: Brand Emblem & Portal Label */}
        <div className="h-18 px-5 border-b border-[#EDE4D8] flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3">
            <img
              src={vastraaLogo}
              alt="Vastraa"
              className="w-10 h-10  object-cover  shadow-xs"
            />
            <div>
              <span className="font-normal text-lg font-bold tracking-[0.14em] text-[#6D021B] block leading-none">
                VASTRAA
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#DEA53B] block mt-0.5">
                Admin Portal
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-stone-400 hover:text-stone-700 rounded-none-lg hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-[#8A796E] uppercase">
            Store Management
          </div>

          {navItems.map((item) => {
            const active = isCurrent(item.path)
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-none-xl text-sm font-medium transition-all group ${active
                  ? 'bg-[#6D021B] text-white shadow-xs'
                  : 'text-[#4A3E38] hover:bg-[#FAF7F2] hover:text-[#6D021B]'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${active ? 'text-[#DEA53B]' : 'text-[#8A796E] group-hover:text-[#6D021B]'
                      }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-none-full ${active
                      ? 'bg-white/20 text-white'
                      : 'bg-[#6D021B]/10 text-[#6D021B]'
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer: View Store & Admin Profile */}
        <div className="p-3 border-t border-[#EDE4D8] space-y-2">
          {/* Quick link to live store */}
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-none-xl text-xs font-semibold text-[#6D021B] bg-[#FAF7F2] border border-[#EDE4D8] hover:border-[#DEA53B] transition-all"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#DEA53B]" />
              View Customer Store
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          </Link>

          {/* Admin user info & Logout */}
          <div className="flex items-center justify-between px-3 py-2 bg-stone-50 rounded-none-xl border border-stone-200/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-none-full bg-[#6D021B] text-[#DEA53B] font-bold text-xs flex items-center justify-center shrink-0">
                AD
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-800 truncate">Store Admin</p>
                <p className="text-[10px] text-stone-500 truncate">admin@vastraa.com</p>
              </div>
            </div>

            <Link
              to="/admin/login"
              title="Logout"
              className="p-1.5 text-stone-400 hover:text-red-600 rounded-none-lg hover:bg-stone-200/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Wrapper ─── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Navbar */}
        <header className="h-18 bg-white border-b border-[#EDE4D8] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-stone-600 hover:text-stone-900 rounded-none-xl border border-[#EDE4D8] hover:bg-[#FAF7F2]"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>


          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Bell Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative p-2 text-stone-600 hover:text-[#6D021B] rounded-none border border-[#EDE4D8] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#6D021B] text-white text-[9.5px] font-black w-4 h-4 flex items-center justify-center rounded-none shadow-sm border border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Popup Drawer */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#EDE4D8] shadow-2xl z-50 rounded-none overflow-hidden text-xs">
                  {/* Popup Header */}
                  <div className="p-3.5 bg-[#FAF7F2] border-b border-[#EDE4D8] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-normal font-bold text-sm text-[#1F1713]">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-[#6D021B] text-white text-[10px] font-bold rounded-none">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-bold text-stone-500 hover:text-[#6D021B] flex items-center gap-1 cursor-pointer"
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark read</span>
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAll}
                          className="text-[10px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer ml-1"
                          title="Clear all notifications"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Clear All</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-[380px] overflow-y-auto divide-y divide-[#EDE4D8]/70">
                    {notifications.length > 0 ? (
                      notifications.map((n) => {
                        const Icon = n.icon
                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 flex items-start gap-3 transition-colors cursor-pointer group ${
                              !n.isRead ? 'bg-[#FFFDF9] hover:bg-[#FAF7F2]' : 'bg-white hover:bg-[#FAF7F2]'
                            }`}
                          >
                            {/* Product Image Thumbnail */}
                            <div className="relative w-12 h-14 bg-stone-100 border border-[#EDE4D8] overflow-hidden shrink-0 rounded-none">
                              {n.image ? (
                                <img
                                  src={n.image}
                                  alt={n.title}
                                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                  <Icon className="w-4 h-4" />
                                </div>
                              )}
                              {/* Overlay Indicator Icon Badge */}
                              <div className={`absolute bottom-0 right-0 p-0.5 border-t border-l rounded-none ${n.badgeColor}`}>
                                <Icon className="w-2.5 h-2.5" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1">
                                <p className={`text-xs leading-snug truncate ${
                                  !n.isRead ? 'font-bold text-[#1F1713]' : 'font-medium text-stone-700'
                                }`}>
                                  {n.title}
                                </p>
                                <span className="text-[10px] text-stone-400 shrink-0">{n.time}</span>
                              </div>

                              <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">
                                {n.subtitle}
                              </p>

                              <div className="mt-1.5 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-[#6D021B] group-hover:text-[#DEA53B] transition-colors flex items-center gap-1">
                                  {n.target === '/admin/orders' ? 'Go to Orders →' : 'Go to Stock Alerts →'}
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteNotification(n.id, e)}
                                  className="text-stone-300 hover:text-red-600 p-1 transition-colors"
                                  title="Delete notification"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="p-8 text-center text-stone-400 space-y-1">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                        <p className="font-bold text-xs text-stone-700">No new notifications</p>
                        <p className="text-[11px]">All orders and product stocks are up to date.</p>
                      </div>
                    )}
                  </div>

                  {/* Popup Footer */}
                  <div className="p-2.5 bg-[#FAF7F2] border-t border-[#EDE4D8] flex items-center justify-between text-[11px]">
                    <Link
                      to="/admin/notifications"
                      onClick={() => setNotificationOpen(false)}
                      className="text-[#6D021B] font-bold hover:underline"
                    >
                      View Stock Alerts Table
                    </Link>
                    <Link
                      to="/admin/orders"
                      onClick={() => setNotificationOpen(false)}
                      className="text-stone-600 font-semibold hover:text-[#6D021B]"
                    >
                      View Orders List
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

