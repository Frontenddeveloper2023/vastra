import { useState } from 'react'
import { Link } from 'react-router-dom'
import AccountSidebar from '../../components/AccountSidebar'
import { ordersData } from '../../data/ordersData'

export default function Orders() {
  const [filter, setFilter] = useState('All')

  const filteredOrders = ordersData.filter((order) => {
    if (filter === 'All') return true
    return order.status.toLowerCase() === filter.toLowerCase()
  })

  const getStatusBadgeStyle = (statusType) => {
    switch (statusType) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'shipped':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'processing':
        return 'bg-sky-100 text-sky-800 border-sky-200'
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200'
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200'
    }
  }

  return (
    <div className="w-full bg-[#FAF7F2] min-h-[calc(100vh-140px)] pt-[78px] xs:pt-[82px] sm:pt-[90px] md:pt-[140px] lg:pt-[148px] pb-12 sm:pb-16 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* ─── GRID CONTAINER: Side-by-side from md (768px) and above ─── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-6 lg:gap-8 items-start">

          {/* ─── REUSABLE ACCOUNT SIDEBAR (Mobile button & Desktop Sidebar) ─── */}
          <AccountSidebar active="orders" />

          {/* ─── RIGHT MAIN CONTENT CARD: Orders Content ─── */}
          <div className="w-full md:col-span-8 lg:col-span-8 bg-white rounded-none-2xl sm:rounded-none-3xl border border-[#EDE4D8] p-6 sm:p-8 shadow-sm">

            {/* ─── Header: My Orders & Continue Shopping ─── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4  border-b border-[#EAE1D5]  pb-4">
              <div>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1713]">
                  My Orders
                </h1>

              </div>

              <Link
                to="/"
                className="text-xs sm:text-sm font-semibold text-[#2B1E19] hover:text-primary transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>Continue Shopping</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>



            {/* ─── Orders List (Cards with thumbnail, meta, and Track Package button) ─── */}
            <div className="space-y-4 sm:space-y-5">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-none-3xl border border-[#EDE4D8] p-12 text-center">
                  <p className="font-serif text-lg text-[#1F1713]">No orders found for &quot;{filter}&quot;</p>
                  <p className="text-xs sm:text-sm text-[#73655B] mt-1">
                    Explore our collections to place your next saree order.
                  </p>
                  <Link
                    to="/"
                    className="mt-5 inline-block bg-primary text-white text-xs font-semibold px-6 py-2.5 rounded-none-full hover:bg-primary-dark transition-colors"
                  >
                    Shop Sarees
                  </Link>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const firstItem = order.items?.[0]
                  const itemsCount = order.items?.reduce((acc, it) => acc + (it.qty || 1), 0) || order.items?.length || 1
                  const formattedTotal = `₹${order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

                  return (
                    <div
                      key={order.id}
                      className="group bg-white rounded-none-2xl sm:rounded-none-3xl border border-[#EDE4D8] p-4 sm:p-5 lg:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Left: Thumbnail & Order Info */}
                      <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                        {/* Thumbnail Image Frame */}
                        <div className="relative w-18 h-20 sm:w-20 sm:h-22 rounded-none-2xl overflow-hidden bg-[#F4EFE6] shrink-0 border border-[#EBE1D4]">
                          <img
                            src={firstItem?.image}
                            alt={`Order #${order.id}`}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src =
                                'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&auto=format&fit=crop&q=80'
                            }}
                          />
                        </div>

                        {/* Order Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="font-sans text-sm sm:text-base font-bold text-[#1F1713]">
                              Order #{order.id}
                            </h3>
                            {/* Status Pill Badge */}
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-none-full border ${getStatusBadgeStyle(
                                order.statusType
                              )}`}
                            >
                              {order.status}
                            </span>
                          </div>

                          {/* Date • items • total */}
                          <p className="mt-1 text-xs text-[#73655B] font-light flex items-center gap-1.5 flex-wrap">
                            <span>{order.date}</span>
                            <span>•</span>
                            <span>
                              {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                            </span>
                            <span>•</span>
                            <strong className="font-bold text-[#1F1713]">{formattedTotal}</strong>
                          </p>

                          {/* View Details Link directly navigating to Order Details Page */}
                          <Link
                            to={`/orders/${order.id}`}
                            className="mt-2 text-xs font-semibold text-[#1F1713] hover:text-primary underline underline-offset-2 transition-colors cursor-pointer text-left inline-block"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>

                      {/* Right: Quick Action Button */}
                      <div className="self-end sm:self-center shrink-0">
                        <Link
                          to={`/orders/${order.id}`}
                          className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-none-xl border border-stone-200 hover:border-primary text-xs font-semibold text-stone-700 hover:text-primary transition-all inline-flex items-center gap-1.5"
                        >
                          <span>Track &amp; Details</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

