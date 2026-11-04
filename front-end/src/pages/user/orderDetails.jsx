import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Package,
  MapPin,
  Copy,
  Check,
  Download,
  ExternalLink,
} from 'lucide-react'
import { ordersData } from '../../data/ordersData'

export default function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [id])

  // Find order by ID from ordersData, default to ORD-3115-225118 if not matched
  const order =
    ordersData.find(
      (o) =>
        String(o.id).toLowerCase() === String(id).toLowerCase() ||
        o.id.includes(String(id))
    ) || ordersData[0]

  const handleCopyTracking = () => {
    if (order.trackingId) {
      navigator.clipboard.writeText(order.trackingId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownloadInvoice = () => {
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      window.print()
    }, 400)
  }

  const getStatusBadge = (status) => {
    const s = String(status).toLowerCase()
    if (s.includes('cancel')) {
      return 'bg-rose-50 text-rose-700 border-rose-200'
    }
    if (s.includes('deliver')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200'
    }
    if (s.includes('ship')) {
      return 'bg-[#FFF9EE] text-[#9E6D08] border-secondary/50'
    }
    return 'bg-[#FAF4EC] text-primary border-primary/25'
  }

  const getPaymentStatusBadge = (paymentStatus) => {
    const s = String(paymentStatus).toLowerCase()
    if (s.includes('fail') || s.includes('unpaid')) {
      return 'bg-rose-50 text-rose-700 border-rose-200'
    }
    if (s.includes('paid') || s.includes('success')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200'
    }
    return 'bg-[#FFF9EE] text-[#9E6D08] border-secondary/50'
  }

  return (
    <div className="w-full bg-[#FAF7F2] min-h-[calc(100vh-140px)] pt-[76px] sm:pt-[84px] md:pt-[136px] lg:pt-[144px] pb-12 sm:pb-16 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* ─── Main Order Details Card Container ─── */}
        <div className="bg-white rounded-none-2xl sm:rounded-none-3xl border border-[#EDE4D8] p-4 sm:p-6 lg:p-8 shadow-xs">

          {/* Top Header: Back Button & Order ID with Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-[#EDE4D8]">
            {/* Back to Orders Button */}
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-none-xl border border-[#EDE4D8] bg-white text-xs sm:text-sm font-semibold text-[#40342C] hover:text-primary hover:border-secondary/60 hover:bg-[#FAF4EC]/60 shadow-2xs hover:shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4 text-primary" />
              <span>Back to Orders</span>
            </Link>

            {/* Order ID & Status Badge */}
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <span className="font-sans text-base sm:text-lg lg:text-xl font-bold text-primary tracking-tight">
                {order.id}
              </span>
              <span
                className={`text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-none-md border ${getStatusBadge(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* ─── 2-Column Content Grid ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mt-6 items-start">

            {/* ─── LEFT COLUMN (5 cols): Order Info, Tracking, Shipping ─── */}
            <div className="lg:col-span-5 space-y-4 sm:space-y-5">

              {/* 1. Order Information Card */}
              <div className="bg-white rounded-none-2xl border border-[#EDE4D8] p-4 sm:p-5 shadow-2xs hover:border-secondary/50 transition-colors">
                <div className="flex items-center gap-2.5 mb-4 pb-2.5 border-b border-[#F0E8DC]">
                  <div className="w-8 h-8 rounded-none-lg bg-[#FAF4EC] border border-secondary/30 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                    <Calendar className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-primary">
                    Order Information
                  </h3>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  {/* Order Date */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#73655B]">Order Date:</span>
                    <span className="font-semibold text-[#1F1713]">{order.date}</span>
                  </div>

                  {/* Order Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#73655B]">Order Status:</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-none border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Payment Method */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#73655B]">Payment Method:</span>
                    <span className="font-bold text-[#1F1713] tracking-wide">
                      {order.paymentMethod}
                    </span>
                  </div>

                  {/* Payment Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#73655B]">Payment Status:</span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-none border ${getPaymentStatusBadge(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Tracking Information Card */}
              <div className="bg-white rounded-none-2xl border border-[#EDE4D8] p-4 sm:p-5 shadow-2xs hover:border-secondary/50 transition-colors">
                <div className="flex items-center gap-2.5 mb-4 pb-2.5 border-b border-[#F0E8DC]">
                  <div className="w-8 h-8 rounded-none-lg bg-[#FAF4EC] border border-secondary/30 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                    <Package className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-primary">
                    Tracking Information
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm">
                  {/* Tracking ID with Copy Icon */}
                  <div>
                    <span className="text-[#73655B] text-xs block mb-1">Tracking ID</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-[#1F1713] tracking-wide font-mono">
                        {order.trackingId}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyTracking}
                        className="p-1 rounded-none-md text-[#73655B] hover:text-primary hover:bg-[#FAF4EC] transition-all cursor-pointer relative"
                        title="Copy tracking ID"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copied && (
                          <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-none shadow">
                            Copied!
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Tracking Link */}
                  <div>
                    <span className="text-[#73655B] text-xs block mb-1">Tracking Link</span>
                    <a
                      href={order.trackingLink || '#track'}
                      onClick={(e) => {
                        e.preventDefault()
                        alert(`Tracking package ${order.trackingId}... Status: In Transit.`)
                      }}
                      className="font-semibold text-xs sm:text-sm text-primary hover:text-primary-dark hover:underline cursor-pointer inline-flex items-center gap-1 group"
                    >
                      <span>Click here to track your package</span>
                      <ExternalLink className="w-3.5 h-3.5 text-secondary group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>

              {/* 3. Shipping Address Card */}
              <div className="bg-white rounded-none-2xl border border-[#EDE4D8] p-4 sm:p-5 shadow-2xs hover:border-secondary/50 transition-colors">
                <div className="flex items-center gap-2.5 mb-4 pb-2.5 border-b border-[#F0E8DC]">
                  <div className="w-8 h-8 rounded-none-lg bg-[#FAF4EC] border border-secondary/30 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                    <MapPin className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-primary">
                    Shipping Address
                  </h3>
                </div>

                <div className="text-xs sm:text-sm space-y-1">
                  <p className="font-sans font-bold text-[#1F1713] text-sm sm:text-base">
                    {order.shippingAddress.name}
                  </p>
                  <p className="text-[#5C4A3E] leading-relaxed">
                    {order.shippingAddress.street}
                  </p>
                  <p className="text-[#5C4A3E] leading-relaxed">
                    {order.shippingAddress.cityState}
                  </p>
                  {order.shippingAddress.phone && (
                    <p className="text-[#73655B] text-xs pt-1">
                      Phone: <span className="text-[#1F1713] font-medium">{order.shippingAddress.phone}</span>
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* ─── RIGHT COLUMN (7 cols): Items List, Breakdown, Invoice ─── */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">

              {/* 4. Items List Card */}
              <div className="bg-white rounded-none-2xl border border-[#EDE4D8] p-4 sm:p-5 shadow-2xs hover:border-secondary/50 transition-colors">
                <div className="flex items-center gap-2.5 mb-4 pb-2.5 border-b border-[#F0E8DC]">
                  <div className="w-8 h-8 rounded-none-lg bg-[#FAF4EC] border border-secondary/30 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                    <Package className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-primary">
                    Items ({order.items.length})
                  </h3>
                </div>

                <div className="divide-y divide-dashed divide-[#F0E8DC]">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3.5 first:pt-1 last:pb-1 flex items-center gap-3.5 sm:gap-4 group"
                    >
                      {/* Product Thumbnail */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-none-xl bg-[#FAF4EC] border border-[#EDE4D8] overflow-hidden shrink-0 flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.src =
                              'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&auto=format&fit=crop&q=80'
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-[#1F1713] group-hover:text-primary transition-colors truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-[#73655B] mt-1">
                          Qty: <span className="font-medium text-[#1F1713]">{item.qty}</span> &nbsp;•&nbsp; ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} each
                        </p>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right shrink-0">
                        <span className="font-bold text-xs sm:text-sm text-[#1F1713]">
                          ₹{(item.qty * item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Summary / Pricing Breakdown Card */}
              <div className="bg-white rounded-none-2xl border border-[#EDE4D8] p-4 sm:p-5 shadow-2xs space-y-2.5 text-xs sm:text-sm">
                {/* Subtotal */}
                <div className="flex justify-between items-center text-[#73655B]">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#1F1713]">
                    ₹{order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* GST */}
                <div className="flex justify-between items-center text-[#73655B]">
                  <span>GST Calculated</span>
                  <span className="font-medium text-[#1F1713]">
                    ₹{order.gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Shipping Fee */}
                <div className="flex justify-between items-center text-[#73655B]">
                  <span>Shipping Fee</span>
                  <span className="font-medium text-[#1F1713]">
                    {order.shippingFee === 0 ? (
                      <span className="text-emerald-700 font-semibold">FREE</span>
                    ) : (
                      `₹${order.shippingFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    )}
                  </span>
                </div>

                {/* Total Amount Divider */}
                <div className="pt-3 border-t border-[#F0E8DC] flex justify-between items-baseline">
                  <span className="font-sans font-bold text-sm sm:text-base text-[#1F1713]">
                    Total Amount
                  </span>
                  <span className="font-sans font-bold text-base sm:text-lg lg:text-xl text-primary tabular-nums">
                    ₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* 6. Download Invoice Button */}
              <button
                type="button"
                onClick={handleDownloadInvoice}
                disabled={downloading}
                className="w-full py-3.5 px-5 rounded-none-xl font-bold text-xs sm:text-sm text-white bg-primary hover:bg-primary-dark transition-all duration-300 shadow-md hover:shadow-lg border border-secondary/35 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {downloading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-none-full animate-spin" />
                    <span>Preparing Invoice...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-secondary" strokeWidth={2.4} />
                    <span className="tracking-wide">Download Invoice</span>
                  </>
                )}
              </button>

            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

