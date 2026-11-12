import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  Plus,
  Clock,
  CheckCircle2,
  Truck,
  AlertTriangle,
  ChevronRight,
  XCircle,
  RotateCcw,
} from 'lucide-react'
import productService from '../../services/productService'
import { getCmsImageUrl } from '../../utils/imageHelper'
import { formatIndianDate, formatIndianTime } from '../../utils/dateHelper'

export default function AdminDashboard() {
  const [totalProducts, setTotalProducts] = useState(0)
  const [lowStockAlerts, setLowStockAlerts] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalOrdersCount, setTotalOrdersCount] = useState(0)
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    const token = localStorage.getItem('vastraa_admin_token')

    // 1. Fetch Products
    productService
      .getAll({ limit: 1000 })
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.products || []
        setTotalProducts(list.length)
      })
      .catch(() => {})

    // 2. Fetch Low Stock Alerts
    productService
      .getStockAlerts()
      .then((data) => {
        setLowStockAlerts(data?.alerts || [])
      })
      .catch(() => {})

    // 3. Fetch Real Orders from MongoDB
    setLoadingOrders(true)
    fetch(`${API_BASE}/orders/admin/all?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.success && result.data) {
          const list = result.data.orders || []
          setTotalOrdersCount(result.data.total || list.length)

          // Calculate actual total revenue
          const sumRev = list.reduce((sum, ord) => sum + (ord.pricing?.finalTotal || 0), 0)
          setTotalRevenue(sumRev)

          // Set 8 most recent orders
          setRecentOrders(list.slice(0, 8))
        }
      })
      .catch((err) => {
        console.error('Failed to load dashboard orders:', err)
      })
      .finally(() => {
        setLoadingOrders(false)
      })

    // 4. Fetch Customers Count from DB
    fetch(`${API_BASE}/customers`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          setTotalCustomers(result.data.length)
        }
      })
      .catch(() => {})
  }, [])

  const stats = [
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      change: 'Real-time sales',
      isPositive: true,
      icon: TrendingUp,
    },
    {
      label: 'Total Orders',
      value: totalOrdersCount.toString(),
      change: 'Placed in Storefront',
      isPositive: true,
      icon: ShoppingBag,
    },
    {
      label: 'Total Sarees',
      value: totalProducts ? totalProducts.toString() : '...',
      change: `${lowStockAlerts.length} stock alerts`,
      isPositive: true,
      icon: Package,
    },
    {
      label: 'Total Customers',
      value: totalCustomers > 0 ? totalCustomers.toString() : '...',
      change: 'Registered Patrons',
      isPositive: true,
      icon: Users,
    },
  ]

  const getOrderStatusConfig = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered':
        return { color: 'bg-emerald-500 text-white', icon: CheckCircle2 }
      case 'shipped':
        return { color: 'bg-amber-500 text-white', icon: Truck }
      case 'cancelled':
        return { color: 'bg-rose-500 text-white', icon: XCircle }
      case 'returned':
        return { color: 'bg-purple-500 text-white', icon: RotateCcw }
      default: // On process
        return { color: 'bg-sky-500 text-white', icon: Clock }
    }
  }

  return (
    <div className="space-y-6">
      {/* ─── Page Header with Quick Actions ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-normal text-2xl sm:text-3xl font-bold text-[#1F1713]">
            Store Overview
          </h1>
         
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/products"
            className="flex items-center gap-2 px-4 py-2 bg-[#6D021B] text-white text-xs font-semibold shadow-xs hover:bg-[#580115] transition-all"
          >
            <Plus className="w-4 h-4 text-[#DEA53B]" />
            <span>Add Saree</span>
          </Link>

          <Link
            to="/admin/orders"
            className="px-4 py-2 bg-white border border-[#EDE4D8] text-[#1F1713] text-xs font-semibold hover:border-[#6D021B] transition-all"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* ─── Metric Cards Grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white border border-[#EDE4D8] p-5 shadow-2xs hover:shadow-xs transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#73655B]">{stat.label}</span>
                <div className="w-9 h-9 bg-[#FAF7F2] border border-[#EDE4D8] flex items-center justify-center text-[#6D021B]">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3">
                <h3 className="text-2xl font-bold font-sans tracking-tight text-[#1F1713]">
                  {stat.value}
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">{stat.change}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── Main 2-Column Split: Recent Orders & Inventory Alerts ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left (2 cols): Recent Real Customer Orders */}
        <div className="lg:col-span-2 bg-white border border-[#EDE4D8] p-5 shadow-2xs h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-[#EDE4D8]">
            <div>
              <h2 className="font-normal text-lg font-bold text-[#1F1713]">Recent Customer Orders</h2>
              <p className="text-xs text-[#73655B]">Live orders placed on the storefront</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-[#6D021B] hover:text-[#DEA53B] flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#EDE4D8]/70 overflow-x-auto overflow-y-auto max-h-[420px] pr-2 admin-scrollbar">
            {loadingOrders ? (
              <div className="py-12 text-center text-xs text-stone-500">
                Loading live customer orders...
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                <p className="font-semibold text-stone-600">No customer orders yet</p>
                <p className="text-[11px] text-stone-400 mt-0.5">When customers checkout, orders will appear here automatically.</p>
              </div>
            ) : (
              recentOrders.map((order) => {
                const cfg = getOrderStatusConfig(order.status)
                const StatusIcon = cfg.icon
                const sareeTitle = order.items?.[0]?.title || 'Luxury Saree'
                const moreCount = (order.items?.length || 1) - 1
                const custName = order.customerInfo?.name || order.shippingAddress?.name || 'Customer'
                const orderTimeStr = `${formatIndianDate(order.createdAt)}, ${formatIndianTime(order.createdAt)}`

                return (
                  <Link
                    key={order._id || order.orderId}
                    to="/admin/orders"
                    className="py-3.5 flex items-center justify-between gap-4 min-w-[500px] sm:min-w-0 hover:bg-[#FAF7F2] -mx-2 px-2 transition-colors cursor-pointer group block"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FAF7F2] group-hover:bg-white border border-[#EDE4D8] flex items-center justify-center text-[#6D021B] shrink-0 transition-colors">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#1F1713] group-hover:text-[#6D021B] transition-colors">
                          #{order.orderId}
                        </p>
                        <p className="text-xs text-[#73655B] truncate max-w-xs">
                          {custName} • {sareeTitle} {moreCount > 0 ? `(+${moreCount} more)` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs font-bold font-sans text-[#1F1713]">
                          ₹{(order.pricing?.finalTotal || 0).toLocaleString('en-IN')}
                        </p>
                        <p className="text-[11px] text-[#8A796E]">{orderTimeStr}</p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold border ${cfg.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {order.status || 'On process'}
                      </span>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Right (1 col): Low Stock Alerts & Quick Insights */}
        <div className="space-y-6">
          <div className="bg-white border border-[#EDE4D8] p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE4D8]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-normal text-base font-bold text-[#1F1713]">Low Stock Alerts</h3>
              </div>
              <Link
                to="/admin/notifications"
                className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                Action needed
              </Link>
            </div>

            <div className="mt-3 space-y-2.5 max-h-[420px] overflow-y-auto pr-1 admin-scrollbar">
              {lowStockAlerts.length > 0 ? (
                lowStockAlerts.slice(0, 8).map((item) => (
                  <Link
                    key={item.id}
                    to="/admin/notifications"
                    className="p-2.5 bg-[#FAF7F2] hover:bg-white border border-[#EDE4D8] hover:border-[#6D021B] flex items-center justify-between gap-3 transition-colors cursor-pointer group block"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={getCmsImageUrl(item.image)}
                        alt={item.title}
                        className="w-10 h-10 object-cover shrink-0 border border-[#EDE4D8] group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#1F1713] group-hover:text-[#6D021B] truncate transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[#73655B]">
                          {item.variantName ? `${item.variantName} • ` : ''}₹{Number(item.price || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    <span className={`text-xs font-bold px-2 py-0.5 shrink-0 transition-colors ${
                      item.stock <= 0 ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {item.stock <= 0 ? 'Out of Stock' : `Only ${item.stock} left`}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="py-8 text-center text-stone-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1 opacity-80" />
                  <p className="text-xs font-semibold text-stone-600">All products well stocked</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
