import { Link } from 'react-router-dom'
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  ArrowUpRight,
  Plus,
  Clock,
  CheckCircle2,
  Truck,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'
import { allProductsList } from '../user/collections'
import { ordersData } from '../../data/ordersData'

export default function AdminDashboard() {
  const stats = [
    {
      label: 'Total Revenue',
      value: '₹3,42,850',
      change: '+18.2%',
      isPositive: true,
      icon: TrendingUp,
      period: 'vs last month',
    },
    {
      label: 'Total Orders',
      value: '148',
      change: '+12.4%',
      isPositive: true,
      icon: ShoppingBag,
      period: '24 pending dispatch',
    },
    {
      label: 'Total sarees',
      value: allProductsList.length.toString(),
      change: '12 Categories',
      isPositive: true,
      icon: Package,
      period: '3 low stock items',
    },
    {
      label: 'Total Customers',
      value: '1,280',
      change: '+9.1%',
      isPositive: true,
      icon: Users,
      period: 'Active this month',
    },
  ]

  // Recent 8 mock orders
  const recentOrders = [
    {
      id: 'ORD-3115-225118',
      customer: 'Priya Sharma',
      saree: 'Crimson Bridal Kanjivaram Silk',
      amount: '₹8,999',
      date: 'Today, 11:20 AM',
      status: 'Shipped',
      statusColor: 'bg-blue-500 text-white ',
      icon: Truck,
    },
    {
      id: 'ORD-3104-224901',
      customer: 'Ritu Singhania',
      saree: 'Blush Rose Tissue Organza Saree',
      amount: '₹4,799',
      date: 'Today, 09:15 AM',
      status: 'Processing',
      statusColor: 'bg-orange-500 text-white ',
      icon: Clock,
    },
    {
      id: 'ORD-2980-114092',
      customer: 'Ananya Deshmukh',
      saree: 'Royal Indigo Kanjivaram',
      amount: '₹7,499',
      date: 'Yesterday, 04:45 PM',
      status: 'Delivered',
      statusColor: 'bg-emerald-500 text-white ',
      icon: CheckCircle2,
    },
    {
      id: 'ORD-2915-110822',
      customer: 'Pooja Hegde',
      saree: 'Classic Gold Temple Border Saree',
      amount: '₹6,199',
      date: 'Yesterday, 01:20 PM',
      status: 'Shipped',
      statusColor: 'bg-blue-500 text-white ',
      icon: Truck,
    },
    {
      id: 'ORD-2841-998124',
      customer: 'Kavita Sundaram',
      saree: 'Meenakari Banarasi Heritage Silk',
      amount: '₹8,299',
      date: '28 Oct 2026',
      status: 'Processing',
      statusColor: 'bg-orange-500 text-white',
      icon: Clock,
    },
    {
      id: 'ORD-2790-994301',
      customer: 'Divya Nambiar',
      saree: 'Traditional Red Paithani Silk',
      amount: '₹9,499',
      date: '27 Oct 2026',
      status: 'Delivered',
      statusColor: 'bg-emerald-500 text-white',
      icon: CheckCircle2,
    },
    {
      id: 'ORD-2712-887410',
      customer: 'Meera Iyer',
      saree: 'Emerald Handloom Tussar Silk',
      amount: '₹4,299',
      date: '26 Oct 2026',
      status: 'Delivered',
      statusColor: 'bg-emerald-500 text-white',
      icon: CheckCircle2,
    },
    {
      id: 'ORD-2650-881290',
      customer: 'Sneha Reddy',
      saree: 'Pastel Peach Floral Chiffon Saree',
      amount: '₹3,899',
      date: '25 Oct 2026',
      status: 'Processing',
      statusColor: 'bg-orange-500 text-white',
      icon: Clock,
    },
  ]

  // Low stock alert items
  const lowStockItems = allProductsList.slice(0, 6).map((item, idx) => ({
    ...item,
    stockLeft: (idx % 4) + 1,
  }))

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
            className="flex items-center gap-2 px-4 py-2 bg-[#6D021B] text-white  text-xs font-semibold shadow-xs hover:bg-[#580115] transition-all"
          >
            <Plus className="w-4 h-4 text-[#DEA53B]" />
            <span>Add Saree</span>
          </Link>

          <Link
            to="/admin/orders"
            className="px-4 py-2 bg-white border border-[#EDE4D8] text-[#1F1713]  text-xs font-semibold hover:border-[#6D021B] transition-all"
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
              className="bg-white border border-[#EDE4D8]  p-5 shadow-2xs hover:shadow-xs transition-all"
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

              </div>
            </div>
          )
        })}
      </div>

      {/* ─── Main 2-Column Split: Recent Orders & Inventory Alerts ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left (2 cols): Recent Orders Table */}
        <div className="lg:col-span-2 bg-white border border-[#EDE4D8]  p-5 shadow-2xs h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-[#EDE4D8]">
            <div>
              <h2 className="font-normal text-lg font-bold text-[#1F1713]">Recent Customer Orders</h2>
              <p className="text-xs text-[#73655B]">Latest purchases requiring fulfillment</p>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-semibold text-[#6D021B] hover:text-[#DEA53B] flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#EDE4D8]/70 overflow-x-auto overflow-y-auto max-h-[420px] pr-2 admin-scrollbar">
            {recentOrders.slice(0, 8).map((order) => {
              const StatusIcon = order.icon
              return (
                <Link
                  key={order.id}
                  to="/admin/orders"
                  className="py-3.5 flex items-center justify-between gap-4 min-w-[500px] sm:min-w-0 hover:bg-[#FAF7F2] -mx-2 px-2 transition-colors cursor-pointer group block"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FAF7F2] group-hover:bg-white border border-[#EDE4D8] flex items-center justify-center text-[#6D021B] shrink-0 transition-colors">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1F1713] group-hover:text-[#6D021B] transition-colors">
                        {order.id}
                      </p>
                      <p className="text-xs text-[#73655B]">{order.customer} • {order.saree}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-bold font-sans text-[#1F1713]">{order.amount}</p>
                      <p className="text-[11px] text-[#8A796E]">{order.date}</p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold border ${order.statusColor}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {order.status}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right (1 col): Low Stock Alerts & Quick Insights */}
        <div className="space-y-6">
          {/* Low Stock Warning */}
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

            {/* Scrollable list container matching Recent Orders height */}
            <div className="mt-3 space-y-2.5 max-h-[420px] overflow-y-auto pr-1 admin-scrollbar">
              {lowStockItems.slice(0, 8).map((item) => (
                <Link
                  key={item.id}
                  to="/admin/notifications"
                  className="p-2.5 bg-[#FAF7F2] hover:bg-white border border-[#EDE4D8] hover:border-[#6D021B] flex items-center justify-between gap-3 transition-colors cursor-pointer group block"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-10 h-10 object-cover shrink-0 border border-[#EDE4D8] group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1F1713] group-hover:text-[#6D021B] truncate transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#73655B]">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-white bg-red-500 border border-red-200 px-2 py-0.5 shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    Only {item.stockLeft} left
                  </span>
                </Link>
              ))}
            </div>

        
          </div>


        </div>
      </div>
    </div>
  )
}
