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
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { getCmsImageUrl } from '../../utils/imageHelper'
import { formatIndianDate, formatIndianDateTime } from '../../utils/dateHelper'
import notify from '../../utils/toast'

export default function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, token } = useCustomerAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  // Return Flow States
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [returning, setReturning] = useState(false)
  const [returnReason, setReturnReason] = useState('Fabric / Quality not as expected')
  const [returnComments, setReturnComments] = useState('')

  // Protect Order Details: If not logged in, friendly redirect to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/orders/${id}` }, replace: true })
    }
  }, [isAuthenticated, navigate, id])

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [id])

  // Fetch real order by ID from MongoDB
  useEffect(() => {
    if (!token || !id) return
    let isMounted = true
    setLoading(true)

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    fetch(`${API_BASE}/orders/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (!isMounted) return
        if (result.success && result.data) {
          setOrder(result.data)
        }
      })
      .catch((err) => {
        console.error('Failed to fetch order details:', err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id, token])

  const handleCopyTracking = () => {
    if (order?.tracking?.trackingNumber) {
      navigator.clipboard.writeText(order.tracking.trackingNumber)
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

  // Handle Cancel Order (allowed only when status is 'On process' / 'Placed')
  const handleCancelOrder = async () => {
    if (!order) return
    setCancelling(true)
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const res = await fetch(`${API_BASE}/orders/${order.orderId || order._id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: cancelReason.trim() || 'Customer requested order cancellation.',
        }),
      })

      const result = await res.json()
      if (result.success && result.data) {
        notify.success('Your order has been cancelled successfully.')
        setOrder(result.data)
        setShowCancelModal(false)
      } else {
        notify.error(result.message || 'Unable to cancel order.')
      }
    } catch (err) {
      notify.error(err.message || 'Error occurred while cancelling order.')
    } finally {
      setCancelling(false)
    }
  }

  // Handle Customer Return Request
  const handleRequestReturn = async () => {
    if (!token || !order) return
    if (!returnReason.trim()) {
      notify.error('Please select a valid return reason.')
      return
    }

    try {
      setReturning(true)
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const res = await fetch(`${API_BASE}/orders/${order.orderId || order._id}/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: returnReason,
          comments: returnComments,
        }),
      })

      const result = await res.json()
      if (result.success && result.data) {
        notify.success('Your return request has been submitted successfully.')
        setOrder(result.data)
        setShowReturnModal(false)
      } else {
        notify.error(result.message || 'Unable to submit return request.')
      }
    } catch (err) {
      notify.error(err.message || 'Error occurred while requesting return.')
    } finally {
      setReturning(false)
    }
  }

  // Check if cancellation is allowed: strictly before product is shipped
  const canCancelOrder = order && ['On process', 'Placed', 'Processing'].includes(order.status)

  // Check if return is allowed: Must be Delivered & within product's returnWindowDays
  const isDelivered = order && order.status === 'Delivered'
  let isReturnWindowValid = false
  let maxReturnDays = 7
  let daysRemaining = 0

  if (isDelivered) {
    const deliveryTime = order.deliveredAt || order.timeline?.slice().reverse().find((t) => t.status === 'Delivered')?.time || order.updatedAt || order.createdAt
    const daysSinceDelivery = (new Date().getTime() - new Date(deliveryTime).getTime()) / (1000 * 60 * 60 * 24)

    if (Array.isArray(order.items) && order.items.length > 0) {
      maxReturnDays = Math.max(...order.items.map((i) => (i.returnWindowDays !== undefined ? Number(i.returnWindowDays) : 7)))
    }
    daysRemaining = Math.max(0, Math.ceil(maxReturnDays - daysSinceDelivery))
    isReturnWindowValid = daysSinceDelivery <= maxReturnDays
  }

  const canRequestReturn = isDelivered && isReturnWindowValid && !order.returnDetails?.isReturnRequested

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase()
    if (s.includes('return')) {
      return 'bg-purple-50 text-purple-700 border-purple-200'
    }
    if (s.includes('cancel')) {
      return 'bg-rose-50 text-rose-700 border-rose-200'
    }
    if (s.includes('deliver')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200'
    }
    if (s.includes('ship')) {
      return 'bg-[#FFF9EE] text-[#9E6D08] border-[#DEA53B]/50'
    }
    return 'bg-sky-50 text-sky-800 border-sky-200' // On process
  }

  if (loading) {
    return (
      <div className="w-full bg-[#FAF7F2] min-h-[70vh] flex items-center justify-center pt-24 pb-16">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-[#6D021B]/20 border-t-[#6D021B] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-stone-500">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="w-full bg-[#FAF7F2] min-h-[70vh] flex items-center justify-center pt-24 pb-16 px-4">
        <div className="max-w-md w-full bg-white p-8 text-center rounded-2xl border border-[#EDE4D8] shadow-sm">
          <p className="font-normal text-lg text-stone-800 mb-2">Order Not Found</p>
          <p className="text-xs text-stone-500 mb-6">
            We couldn&apos;t locate the order details requested.
          </p>
          <Link
            to="/orders"
            className="inline-block px-6 py-2.5 bg-[#6D021B] text-white text-xs font-semibold rounded-full hover:bg-[#520114]"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  const orderDate = formatIndianDate(order.createdAt)

  return (
    <div className="w-full bg-[#FAF7F2] min-h-[calc(100vh-140px)] pt-[76px] sm:pt-[84px] md:pt-[136px] lg:pt-[144px] pb-12 sm:pb-16 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-none-2xl sm:rounded-none-3xl border border-[#EDE4D8] p-4 sm:p-6 lg:p-8 shadow-xs">
          
          {/* Top Header: Back Button & Order ID */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F0E8DC]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="p-2 hover:bg-[#FAF4EC] rounded-full transition-colors text-stone-600 hover:text-primary cursor-pointer shrink-0"
                aria-label="Back to orders"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-normal text-xl sm:text-2xl font-bold text-[#1F1713]">
                    Order #{order.orderId}
                  </h1>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Placed on {orderDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
              {canCancelOrder && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-rose-300 text-rose-700 bg-rose-50/70 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Cancel Order</span>
                </button>
              )}

              {canRequestReturn && (
                <button
                  type="button"
                  onClick={() => setShowReturnModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                >
                  <span className="text-sm">↺</span>
                  <span>Request Return ({daysRemaining}d left)</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleDownloadInvoice}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-4 py-2 border border-stone-200 hover:border-primary text-xs font-semibold text-stone-700 hover:text-primary rounded-xl transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Preparing...' : 'Print / Download Invoice'}</span>
              </button>
            </div>
          </div>

          {/* Order Items Table / Cards */}
          <div className="py-6 border-b border-[#F0E8DC]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-800 mb-4">
              Items Ordered ({order.items?.length || 0})
            </h2>
            <div className="divide-y divide-stone-100">
              {order.items?.map((item, idx) => {
                const thumbSrc = getCmsImageUrl(item.image)
                return (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                    <img
                      src={thumbSrc}
                      alt={item.title}
                      className="w-16 h-20 object-cover rounded-lg bg-stone-100 border border-stone-200 shrink-0"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&auto=format&fit=crop&q=80'
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-stone-900 text-sm">{item.title}</h3>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-stone-500">
                        {item.color && <span>Color: <strong className="text-stone-700">{item.color}</strong></span>}
                        {item.design && <span>• Design: <strong className="text-stone-700">{item.design}</strong></span>}
                        {item.material && <span>• Fabric: <strong className="text-stone-700">{item.material}</strong></span>}
                        {item.weight && <span>• Weight: <strong className="text-stone-700">{item.weight}g</strong></span>}
                      </div>
                      <div className="mt-2 text-xs font-medium text-stone-600">
                        Qty: {item.quantity || 1} × ₹{Number(item.price || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-stone-900 text-sm">
                        ₹{(Number(item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Shipping Address & Pricing Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {/* Delivery Address */}
            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EDE4D8]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#6D021B]" />
                <span>Delivery Address</span>
              </h3>
              <p className="font-bold text-xs text-stone-900">{order.shippingAddress?.name}</p>
              <p className="text-xs text-stone-600 mt-0.5">{order.shippingAddress?.street}</p>
              {order.shippingAddress?.landmark && (
                <p className="text-xs text-stone-500">{order.shippingAddress.landmark}</p>
              )}
              <p className="text-xs text-stone-600">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              </p>
              <p className="text-xs text-stone-600 mt-1 font-mono">
                Phone: {order.shippingAddress?.phone}
              </p>
            </div>

            {/* Pricing Summary */}
            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EDE4D8] space-y-2 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-stone-800 mb-3">
                Payment &amp; Cost Breakdown
              </h3>
              <div className="flex justify-between text-stone-600">
                <span>Items Subtotal</span>
                <span>₹{(order.pricing?.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping Fee ({order.pricing?.totalWeightGrams || 0}g)</span>
                <span>₹{(order.pricing?.shippingFee || 0).toLocaleString('en-IN')}</span>
              </div>
              {order.pricing?.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Privilege Discount</span>
                  <span>-₹{order.pricing.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-sm text-stone-900">
                <span>Total Paid</span>
                <span className="text-[#6D021B]">₹{(order.pricing?.finalTotal || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-1 text-[11px] text-stone-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Paid via {order.payment?.method || 'Online Payment'} ({order.payment?.status || 'Completed'})</span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#F0E8DC]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-4 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#DEA53B]" />
                <span>Order Timeline</span>
              </h3>
              <div className="space-y-3">
                {order.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-[#6D021B] mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold text-stone-900 mr-2">{step.status}:</span>
                      <span className="text-stone-600">{step.message}</span>
                      <span className="text-stone-400 text-[10px] ml-2">
                        {formatIndianDateTime(step.time)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Return Request Banner if return was already requested */}
          {order.returnDetails?.isReturnRequested && (
            <div className="mt-6 p-4 rounded-xl border border-purple-200 bg-purple-50/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 text-purple-700 font-bold text-sm">
                ↺
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-900">Return Request Submitted</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-200 text-purple-800">
                    {order.returnDetails.returnStatus || 'Under Review'}
                  </span>
                </div>
                <p className="text-purple-700 mt-1">
                  Reason: <span className="font-semibold text-stone-800">{order.returnDetails.reason}</span>
                  {order.returnDetails.customerComments && ` (${order.returnDetails.customerComments})`}
                </p>
                <p className="text-purple-600/80 text-[11px] mt-0.5">
                  Our luxury concierge team is reviewing your pickup. We will notify you once courier pickup is dispatched.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center gap-3 text-rose-700 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-normal text-base font-bold text-stone-900">
                  Cancel Order #{order.orderId}?
                </h3>
                <p className="text-xs text-stone-500">
                  Orders can only be cancelled before dispatch/shipping.
                </p>
              </div>
            </div>

            <div className="my-4">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Reason for cancellation (optional):
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Changed my mind, ordered incorrect color/size"
                rows={3}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-[#6D021B] text-stone-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center gap-3 text-purple-700 mb-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <span className="text-lg font-bold">↺</span>
              </div>
              <div>
                <h3 className="font-normal text-base font-bold text-stone-900">
                  Request Return for #{order.orderId}
                </h3>
                <p className="text-xs text-stone-500">
                  Return eligible within {maxReturnDays} days of delivery ({daysRemaining} days remaining).
                </p>
              </div>
            </div>

            <div className="my-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Select reason for return <span className="text-red-500">*</span>:
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-purple-600 text-stone-900 bg-white"
                >
                  <option value="Fabric / Quality not as expected">Fabric / Quality not as expected</option>
                  <option value="Color or motif differs from photos">Color or motif differs from photos</option>
                  <option value="Defective or damaged during transit">Defective or damaged during transit</option>
                  <option value="Received incorrect saree model">Received incorrect saree model</option>
                  <option value="Fit / Drape not suitable">Fit / Drape not suitable</option>
                  <option value="Changed mind / No longer needed">Changed mind / No longer needed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Additional remarks (optional):
                </label>
                <textarea
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  placeholder="Please describe the issue or any specific pickup instructions..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-purple-600 text-stone-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                disabled={returning}
                className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Keep Saree
              </button>
              <button
                type="button"
                onClick={handleRequestReturn}
                disabled={returning}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {returning ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
