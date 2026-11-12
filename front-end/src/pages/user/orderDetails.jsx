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
  RotateCcw,
  Upload,
  Image as ImageIcon,
  IndianRupee,
} from 'lucide-react'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { getCmsImageUrl } from '../../utils/imageHelper'
import { formatIndianDate, formatIndianDateTime } from '../../utils/dateHelper'
import notify from '../../utils/toast'
import getSocket from '../../services/socket'

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

  // Global Return Window Setting
  const [globalReturnDays, setGlobalReturnDays] = useState(7)

  // Return Flow States
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [returning, setReturning] = useState(false)
  const [returnReason, setReturnReason] = useState('Fabric / Quality not as expected')
  const [returnComments, setReturnComments] = useState('')
  const [proofImages, setProofImages] = useState([])
  const [uploadingImage, setUploadingImage] = useState(false)

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

  // Fetch Global Store Return Policy Setting
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
        const res = await fetch(`${API_BASE}/settings`)
        const data = await res.json()
        if (data?.success && data.data?.returnPolicy?.returnWindowDays) {
          setGlobalReturnDays(Number(data.data.returnPolicy.returnWindowDays))
        }
      } catch (e) {
        console.error('Failed to load global return setting:', e)
      }
    }
    fetchSettings()
  }, [])

  // Fetch real order by ID from MongoDB
  const fetchOrderDetails = () => {
    if (!token || !id) return
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    fetch(`${API_BASE}/orders/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) {
          setOrder(result.data)
        }
      })
      .catch((err) => {
        console.error('Failed to fetch order details:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    setLoading(true)
    fetchOrderDetails()

    // Real-time socket listener for immediate status updates
    const socket = getSocket()
    socket.emit('join:order', id)
    if (order?.orderId && order.orderId !== id) {
      socket.emit('join:order', order.orderId)
    }

    const onStatusUpdated = (data) => {
      if (data) {
        const matches =
          String(data.orderId || '').toLowerCase() === String(id || '').toLowerCase() ||
          String(data._id || '').toLowerCase() === String(id || '').toLowerCase() ||
          String(order?.orderId || '').toLowerCase() === String(data.orderId || '').toLowerCase()

        if (matches) {
          notify.info(data.message || `Order status updated to "${data.status}"`)
          fetchOrderDetails()
        }
      }
    }

    socket.on('order:status-updated', onStatusUpdated)

    return () => {
      socket.off('order:status-updated', onStatusUpdated)
    }
  }, [id, token])

  // Handle Image Proof Upload (Multiple or Single)
  const handleProofUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploadingImage(true)
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const uploadedUrls = []

      for (const file of files) {
        // Upload via existing /api/products/upload endpoint or FormData
        const formData = new FormData()
        formData.append('image', file)
        const res = await fetch(`${API_BASE}/products/upload`, {
          method: 'POST',
          body: formData,
        })
        const result = await res.json()
        if (result?.success && result.url) {
          uploadedUrls.push(result.url)
        } else {
          // Fallback to base64 reader if upload endpoint rejects
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.readAsDataURL(file)
          })
          uploadedUrls.push(base64)
        }
      }

      setProofImages((prev) => [...prev, ...uploadedUrls])
      notify.success(`${uploadedUrls.length} photo proof(s) attached!`)
    } catch (err) {
      console.error('Failed to upload proof image:', err)
      notify.error('Could not upload photo proof. Please try another image.')
    } finally {
      setUploadingImage(false)
    }
  }

  const removeProofImage = (index) => {
    setProofImages((prev) => prev.filter((_, idx) => idx !== index))
  }

  // Handle Customer Cancellation (Allowed before dispatch/shipped)
  const handleCancelOrder = async () => {
    if (!token || !order) return

    try {
      setCancelling(true)
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const res = await fetch(`${API_BASE}/orders/${order.orderId || order._id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason || 'Cancelled by customer' }),
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

    if (!proofImages || proofImages.length === 0) {
      notify.error('Please upload at least one photo proof of the product condition.')
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
          proofImages: proofImages,
        }),
      })

      const result = await res.json()
      if (result.success && result.data) {
        notify.success('Your return request and proof have been submitted successfully.')
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

  // Check if return is allowed: Must be Delivered & within global return window days
  const isDelivered = order && (order.status === 'Delivered' || Boolean(order.deliveredAt))
  let isReturnWindowValid = false
  let returnWindowDays = globalReturnDays || 7
  let daysRemaining = 0

  if (isDelivered) {
    const deliveryTime =
      order.deliveredAt ||
      order.timeline?.slice().reverse().find((t) => t.status === 'Delivered')?.time ||
      order.updatedAt ||
      order.createdAt

    const daysSinceDelivery = (new Date().getTime() - new Date(deliveryTime).getTime()) / (1000 * 60 * 60 * 24)
    returnWindowDays = Number(globalReturnDays) || 5

    daysRemaining = Math.max(0, Math.ceil(returnWindowDays - daysSinceDelivery))
    isReturnWindowValid = daysSinceDelivery <= returnWindowDays
  }

  // Return button is ONLY visible if:
  // 1. Order is delivered
  // 2. We are within the global return policy window (daysRemaining > 0)
  // 3. Customer has not already initiated a return
  const canRequestReturn =
    isDelivered &&
    isReturnWindowValid &&
    !order.returnDetails?.isReturnRequested &&
    order.status !== 'Return Requested' &&
    order.status !== 'Return Approved' &&
    order.status !== 'Returned'

  const handleDownloadInvoice = () => {
    window.print()
  }

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
    return 'bg-sky-50 text-sky-800 border-sky-200'
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
        <div className="max-w-md w-full bg-white p-8 text-center rounded-2xl border border-[#EDE4D8] shadow-xs">
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
  const retStatus = order.returnDetails?.returnStatus || order.returnDetails?.status
  const ret = {
    ...order.returnDetails,
    status: retStatus,
  }
  // Only show Return Details Banner if customer actually requested a return, or if return status is active/progressing
  const hasReturnDetails = Boolean(
    order.returnDetails?.isReturnRequested ||
    (retStatus && retStatus !== 'None') ||
    order.status?.startsWith('Return') ||
    order.status === 'Returned'
  )

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

              {/* Return Product Button: Visible ONLY within global return window date; Hidden completely after */}
              {canRequestReturn && (
                <button
                  type="button"
                  onClick={() => setShowReturnModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-[#6D021B] text-white bg-[#6D021B] hover:bg-[#580014] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Return Product ({daysRemaining} days left)</span>
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

          {/* ══════════════════════════════════════════════════════════════════════
              RETURN DETAILS BANNER (Clean, Neat, WITHOUT Border, NO Rounded)
              Strictly rounded-none, border-0 as requested by user.
          ══════════════════════════════════════════════════════════════════════ */}
          {hasReturnDetails && (
            <div className="my-6 bg-[#FAF7F2] p-5 rounded-none border-0 shadow-none text-[#1F1713]">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-normal font-bold text-sm uppercase tracking-wider text-[#6D021B] flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4" />
                      Product Return Information
                    </span>
                    <span
                      className={`px-2.5 py-0.5 text-[11px] font-bold uppercase rounded-none tracking-wider ${
                        ret.status === 'Approved' || order.status === 'Return Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ret.status === 'Rejected' || order.status === 'Return Rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : ret.status === 'Completed' || order.status === 'Returned'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ret.status || order.status || 'Requested'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-700">
                    <span className="font-semibold text-stone-900">Return Reason:</span> {ret.reason || 'Requested by customer'}
                  </p>

                  {ret.comments && (
                    <p className="text-xs text-stone-600 italic">
                      &quot;{ret.comments}&quot;
                    </p>
                  )}
                </div>

                {/* Proof Thumbnails preview */}
                {ret.proofImages && ret.proofImages.length > 0 && (
                  <div className="shrink-0">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 mb-1">
                      Submitted Photo Proof ({ret.proofImages.length})
                    </p>
                    <div className="flex items-center gap-2">
                      {ret.proofImages.map((img, i) => (
                        <a
                          key={i}
                          href={getCmsImageUrl(img)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-none overflow-hidden hover:opacity-80"
                        >
                          <img
                            src={getCmsImageUrl(img)}
                            alt={`Proof ${i + 1}`}
                            className="w-12 h-12 object-cover bg-stone-200"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 1. If Refund is Completed */}
              {(ret.status === 'Completed' || order.status === 'Returned') && (
                <div className="mt-4 pt-4 border-t border-emerald-200/60 bg-emerald-50/70 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wider font-bold text-emerald-900">
                        Refund Completed Successfully
                      </p>
                      <p className="text-base font-bold text-emerald-800">
                        ₹{(ret.refundAmount || order.pricing?.finalTotal || 0).toLocaleString('en-IN')} Refunded
                      </p>
                      <p className="text-xs text-emerald-800">
                        The refund has been sent back to your original payment method.
                      </p>
                      {ret.refundTransactionId && (
                        <p className="text-[11px] font-mono text-emerald-700 pt-0.5">
                          Bank Reference / Refund ID: <strong className="font-bold">{ret.refundTransactionId}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. If there is a Refund Transfer Issue */}
              {ret.status === 'Refund Issue' && (
                <div className="mt-4 pt-4 border-t border-amber-300/60 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wider font-bold text-amber-900">
                        Refund Processing Notice
                      </p>
                      <p className="text-xs text-amber-900 leading-relaxed font-medium">
                        {ret.refundIssueReason || 'We encountered an issue transferring your refund to the original account (e.g. bank or UPI issue).'}
                      </p>
                
                    </div>
                  </div>
                </div>
              )}

              {/* 3. If Return is Approved & Waiting for Courier Pickup */}
              {(ret.status === 'Approved' || order.status === 'Return Approved') && ret.status !== 'Completed' && ret.status !== 'Refund Issue' && (
                <div className="mt-4 pt-4 border-t border-stone-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ret.pickupDate && (
                    <div className="flex items-start gap-2.5">
                      <Truck className="w-5 h-5 text-[#DEA53B] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs uppercase tracking-wider font-bold text-stone-900">
                          Scheduled Courier Pickup Date
                        </p>
                        <p className="text-sm font-bold text-[#6D021B] mt-0.5">
                          {formatIndianDate(ret.pickupDate)}
                        </p>
                        <p className="text-[11px] text-stone-500">
                          Our courier partner will arrive on this date to collect the return parcel.
                        </p>
                      </div>
                    </div>
                  )}

                  {ret.refundDays && (
                    <div className="flex items-start gap-2.5">
                      <IndianRupee className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs uppercase tracking-wider font-bold text-stone-900">
                          Your Amount Will Refund
                        </p>
                        <p className="text-sm font-bold text-emerald-700 mt-0.5">
                          Within {ret.refundDays} Business Days
                        </p>
                        <p className="text-[11px] text-stone-500">
                          Amount will be credited back to your original payment method within {ret.refundDays} days after successful pickup and verification.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Admin Remarks: Only show if rejected or if there is a specific dispute/problem, never on Approved or Return Success / Completed */}
              {ret.adminRemarks &&
                ret.status !== 'Approved' &&
                ret.status !== 'Completed' &&
                order.status !== 'Return Approved' &&
                order.status !== 'Returned' && (
                  <div className="mt-3 pt-3 border-t border-stone-200/60 text-xs text-stone-700">
                    <span className="font-semibold text-[#1F1713]">Message from Vastraa Store:</span> {ret.adminRemarks}
                  </div>
                )}
            </div>
          )}

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
                      className="w-16 h-20 object-cover bg-stone-100 border border-stone-200 shrink-0"
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
            <div className="p-4 bg-[#FAF7F2] border border-[#EDE4D8]">
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
            <div className="p-4 bg-[#FAF7F2] border border-[#EDE4D8] space-y-2 text-xs">
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

        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-none w-full max-w-md p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center gap-3 text-rose-700 mb-3">
              <div className="w-10 h-10 bg-rose-100 flex items-center justify-center shrink-0">
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
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-none focus:outline-none focus:border-[#6D021B] text-stone-900"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-none hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-none transition-colors cursor-pointer shadow-sm disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Request Modal with Photo Proof Upload */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-none w-full max-w-lg max-h-[92vh] flex flex-col p-4 sm:p-6 shadow-2xl border border-stone-300 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 text-[#6D021B] min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#6D021B]/10 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-[#6D021B]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-normal text-sm sm:text-base font-bold text-stone-900 truncate">
                    Request Return for #{order.orderId}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-stone-500 truncate">
                    Eligible: within {returnWindowDays} days of delivery ({daysRemaining}d remaining).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="my-3 sm:my-4 space-y-3 sm:space-y-4 overflow-y-auto flex-1 pr-0.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Select Reason for Return <span className="text-red-500">*</span>:
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-none focus:outline-none focus:border-[#6D021B] text-stone-900 bg-white"
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
                  Additional Details &amp; Return Comments (Optional):
                </label>
                <textarea
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  placeholder="Please describe the issue or any specific pickup instructions..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-none focus:outline-none focus:border-[#6D021B] text-stone-900"
                />
              </div>

              {/* Photo Proof Upload Section */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Upload Photo Proof of the Product <span className="text-red-500">*</span>
                </label>
                <p className="text-[11px] text-stone-500 mb-2">
                  Please upload clear photos of the saree, fold, tags, or defect so our inspection team can approve your return request.
                </p>

                <div className="flex flex-wrap gap-2 mb-2">
                  {proofImages.map((img, i) => (
                    <div key={i} className="relative group w-14 h-14 sm:w-16 sm:h-16 border border-stone-300 shrink-0">
                      <img src={getCmsImageUrl(img)} alt={`Proof ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeProofImage(i)}
                        className="absolute top-0 right-0 bg-red-600 text-white w-4 h-4 flex items-center justify-center text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <label className="w-14 h-14 sm:w-16 sm:h-16 border border-dashed border-stone-300 hover:border-[#6D021B] flex flex-col items-center justify-center cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors shrink-0">
                    <Upload className="w-4 h-4 text-stone-400 mb-0.5" />
                    <span className="text-[9px] text-stone-500 font-semibold">
                      {uploadingImage ? '...' : '+ Add'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleProofUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
                {proofImages.length === 0 && (
                  <p className="text-[11px] text-amber-700 font-medium">
                    * Photo proof is required to submit your return.
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-stone-200 shrink-0">
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                disabled={returning}
                className="w-full sm:w-auto px-4 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-none hover:bg-stone-50 transition-colors cursor-pointer uppercase tracking-wider text-center"
              >
                Keep Saree
              </button>
              <button
                type="button"
                onClick={handleRequestReturn}
                disabled={returning || uploadingImage || proofImages.length === 0}
                className="w-full sm:w-auto px-5 py-2 bg-[#6D021B] hover:bg-[#580014] text-white text-xs font-semibold rounded-none transition-colors cursor-pointer shadow-sm disabled:opacity-50 uppercase tracking-wider text-center"
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
