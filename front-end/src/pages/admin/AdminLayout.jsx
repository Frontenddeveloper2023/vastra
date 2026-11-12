import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import notify from '../../utils/toast'
import { useConfirm } from '../../context/ConfirmModalContext'
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
  RotateCcw,
} from 'lucide-react'
import vastraaLogo from '../../../public/slides/logo.png'
import { useAdminAuth } from '../../context/AdminAuthContext'
import productService from '../../services/productService'
import { formatIndianTime } from '../../utils/dateHelper'
import { getCmsImageUrl } from '../../utils/imageHelper'
import getSocket from '../../services/socket'

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth()
  const confirm = useConfirm()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const notificationRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Load real stock alerts AND new orders from backend DB
  const getDismissedIds = () => {
    try {
      const data = localStorage.getItem('vastraa_admin_dismissed_notifications')
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  const addDismissedIds = (ids) => {
    try {
      const current = new Set(getDismissedIds())
      ids.forEach((id) => current.add(String(id)))
      localStorage.setItem('vastraa_admin_dismissed_notifications', JSON.stringify([...current]))
    } catch (e) {
      console.error(e)
    }
  }

  const fetchStockAlerts = async () => {
    setLoadingNotifications(true)
    try {
      const token = localStorage.getItem('vastraa_admin_token')
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const dismissed = new Set(getDismissedIds())

      // Parallel fetch for stock alerts and all live orders
      const [stockData, ordersRes] = await Promise.all([
        productService.getStockAlerts().catch(() => ({ alerts: [] })),
        fetch(`${API_BASE}/orders/admin/all?limit=200`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()).catch(() => ({ success: false })),
      ])

      const alertList = stockData?.alerts || []
      const orderList = ordersRes?.success && ordersRes?.data?.orders ? ordersRes.data.orders : []

      const stockNotifications = alertList
        .filter((item) => !dismissed.has(String(item.id)))
        .map((item) => {
          const isOutOfStock = item.status === 'Out of Stock' || item.stock <= 0
          return {
            id: item.id,
            productId: item.productId,
            variantIndex: item.variantIndex,
            type: isOutOfStock ? 'out_of_stock' : 'low_stock',
            title: isOutOfStock
              ? `Out of Stock: ${item.title}`
              : `Low Stock Alert: ${item.stock} unit${item.stock === 1 ? '' : 's'} left`,
            subtitle: `${item.variantName ? `${item.variantName} • ` : ''}${item.title} has reached Stock Alert Limit`,
            time: 'Live',
            target: '/admin/notifications',
            isRead: false,
            badgeColor: isOutOfStock
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-amber-50 text-amber-800 border-amber-200',
            icon: isOutOfStock ? PackageX : AlertTriangle,
            image: getCmsImageUrl(item.image),
          }
        })

      const orderNotifications = orderList
        .filter((ord) => !ord.readByAdmin && !dismissed.has(String(ord._id)))
        .map((ord) => {
          const isCancelled = ord.status === 'Cancelled'
          const isReturn =
            ord.status === 'Return Requested' ||
            ord.returnDetails?.returnStatus === 'Requested' ||
            ord.returnDetails?.status === 'Requested'
          return {
            id: ord._id,
            type: isReturn ? 'return_requested' : isCancelled ? 'order_cancelled' : 'new_order',
            title: isReturn
              ? `Return Requested: #${ord.orderId}`
              : isCancelled
              ? `Order Cancelled: #${ord.orderId}`
              : `New Order: #${ord.orderId}`,
            subtitle: isReturn
              ? `${ord.customerInfo?.name || ord.shippingAddress?.name || 'Customer'} requested a return: ${ord.returnDetails?.reason || 'Product return'}`
              : isCancelled
              ? `${ord.customerInfo?.name || ord.shippingAddress?.name || 'Customer'} cancelled their order of ₹${(ord.pricing?.finalTotal || 0).toLocaleString('en-IN')}`
              : `${ord.customerInfo?.name || ord.shippingAddress?.name || 'Customer'} ordered ${ord.items?.length || 1} saree(s) • ₹${(ord.pricing?.finalTotal || 0).toLocaleString('en-IN')}`,
            time: formatIndianTime(ord.updatedAt || ord.createdAt),
            target: isReturn ? '/admin/returns' : '/admin/orders',
            isRead: Boolean(ord.readByAdmin),
            badgeColor: isReturn
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : isCancelled
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200',
            icon: isReturn ? RotateCcw : isCancelled ? XCircle : ShoppingBag,
            image: getCmsImageUrl(ord.items?.[0]?.image),
          }
        })

      setNotifications([...orderNotifications, ...stockNotifications])
    } catch (err) {
      console.error('Failed to fetch admin notifications:', err)
    } finally {
      setLoadingNotifications(false)
    }
  }

  useEffect(() => {
    fetchStockAlerts()
    // Poll every 30 seconds as background fallback
    const interval = setInterval(fetchStockAlerts, 30000)

    // Connect to WebSocket for instant real-time push
    const socket = getSocket()
    socket.emit('join:admin')

    const onOrderNew = (data) => {
      notify.info(data.message || 'New order received!')
      fetchStockAlerts()
    }

    const onOrderCancelled = (data) => {
      notify.error(data.message || 'An order was cancelled by the customer.')
      fetchStockAlerts()
    }

    const onReturnNew = (data) => {
      notify.info(data.message || 'New customer return request received!')
      fetchStockAlerts()
    }

    const onStockUpdated = () => {
      fetchStockAlerts()
    }

    socket.on('order:new', onOrderNew)
    socket.on('order:cancelled', onOrderCancelled)
    socket.on('return:new', onReturnNew)
    socket.on('stock:updated', onStockUpdated)

    // Listen for custom stock-updated or orders-updated local events
    const handleImmediateRefresh = () => {
      fetchStockAlerts()
    }
    window.addEventListener('vastraa:stock-updated', handleImmediateRefresh)
    window.addEventListener('vastraa:order-updated', handleImmediateRefresh)

    return () => {
      clearInterval(interval)
      socket.off('order:new', onOrderNew)
      socket.off('order:cancelled', onOrderCancelled)
      socket.off('return:new', onReturnNew)
      socket.off('stock:updated', onStockUpdated)
      window.removeEventListener('vastraa:stock-updated', handleImmediateRefresh)
      window.removeEventListener('vastraa:order-updated', handleImmediateRefresh)
    }
  }, [])

  const handleLogoutClick = async () => {
    const isConfirmed = await confirm({
      title: 'Confirm Logout',
      message: 'Are you sure you want to log out of the Vastraa admin panel? You will need to sign in with email OTP to access again.',
      confirmText: 'Yes, Logout',
      cancelText: 'Cancel',
      type: 'logout',
    })

    if (isConfirmed) {
      await logout()
      notify.success('Logged out of admin portal successfully')
      navigate('/admin/login')
    }
  }

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

  const handleNotificationClick = async (n) => {
    // When clicking a notification, dismiss/hide it permanently so it won't show again
    addDismissedIds([n.id])
    setNotifications((prev) => prev.filter((item) => item.id !== n.id))
    setNotificationOpen(false)

    // If it's an order notification, also call backend mark-read
    if (n.type === 'new_order') {
      try {
        const token = localStorage.getItem('vastraa_admin_token')
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        await fetch(`${API_BASE}/orders/admin/mark-read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        })
      } catch (e) {
        console.error('Failed to mark order as read on server:', e)
      }
    }
    navigate(n.target)
  }

  const handleDeleteNotification = (id, e) => {
    e.stopPropagation()
    addDismissedIds([id])
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleClearAll = async () => {
    const allIds = notifications.map((n) => n.id)
    addDismissedIds(allIds)
    setNotifications([])

    // Update backend order status as read
    try {
      const token = localStorage.getItem('vastraa_admin_token')
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      await fetch(`${API_BASE}/orders/admin/mark-read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (e) {
      console.error('Failed to mark orders as read on server:', e)
    }
  }

  const handleMarkAllRead = async () => {
    // Permanently dismiss all current notifications so they will not show another time
    const allIds = notifications.map((n) => n.id)
    addDismissedIds(allIds)
    setNotifications([])

    try {
      const token = localStorage.getItem('vastraa_admin_token')
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      await fetch(`${API_BASE}/orders/admin/mark-read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (e) {
      console.error('Failed to mark orders as read on server:', e)
    }
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products ', path: '/admin/products', icon: Package, badge: '24' },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag, badge: '5' },
    { name: 'Returns', path: '/admin/returns', icon: RotateCcw },
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
              {admin?.avatar ? (
                <img
                  src={admin.avatar}
                  alt={admin.name || 'Admin'}
                  className="w-8 h-8 rounded-none-full object-cover shrink-0 border border-[#EDE4D8]"
                />
              ) : (
                <div className="w-8 h-8 rounded-none-full bg-[#6D021B] text-[#DEA53B] font-bold text-xs flex items-center justify-center shrink-0">
                  {admin?.name ? admin.name.slice(0, 2).toUpperCase() : 'AD'}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-800 truncate">
                  {admin?.name || 'Store Admin'}
                </p>
                <p className="text-[10px] text-stone-500 truncate">
                  {admin?.email || 'admin@vastraa.com'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogoutClick}
              title="Logout from Admin Portal"
              className="p-1.5 text-stone-400 hover:text-red-600 rounded-none-lg hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
                                <span className="text-[10px] text-green-600 shrink-0">{n.time}</span>
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

