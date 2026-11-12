import { useState, useEffect } from 'react'
import {
  RotateCcw,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Package,
  Eye,
  X,
  ExternalLink,
  Save,
  HelpCircle,
  Truck,
  IndianRupee,
  AlertTriangle,
} from 'lucide-react'
import notify from '../../utils/toast'
import { getCmsImageUrl } from '../../utils/imageHelper'
import { formatIndianDate, formatIndianTime } from '../../utils/dateHelper'
import getSocket from '../../services/socket'

export default function AdminReturns() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Global Return Window Setting
  const [returnWindowDays, setReturnWindowDays] = useState(7)
  const [returnPolicyText, setReturnPolicyText] = useState('')
  const [savingPolicy, setSavingPolicy] = useState(false)

  // Details Modal
  const [selectedReturn, setSelectedReturn] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeImagePreview, setActiveImagePreview] = useState(null)

  // Action states (Approve / Reject / Completed / Refund Issue)
  const [actionType, setActionType] = useState('Approved') // 'Approved' | 'Completed' | 'Refund Issue' | 'Rejected'
  const [pickupDate, setPickupDate] = useState('')
  const [refundDays, setRefundDays] = useState(5)
  const [refundAmount, setRefundAmount] = useState(0)
  const [refundTransactionId, setRefundTransactionId] = useState('')
  const [refundIssueReason, setRefundIssueReason] = useState('')
  const [adminRemarks, setAdminRemarks] = useState('')
  const [processingAction, setProcessingAction] = useState(false)

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const token = localStorage.getItem('vastraa_admin_token')

  // Fetch Settings & Orders
  const fetchData = async () => {
    setLoading(true)
    try {
      // 1. Fetch Store Settings for return window
      const settingsRes = await fetch(`${API_BASE}/settings`)
      const settingsData = await settingsRes.json()
      if (settingsData?.success && settingsData.data?.returnPolicy) {
        setReturnWindowDays(settingsData.data.returnPolicy.returnWindowDays ?? 7)
        setReturnPolicyText(settingsData.data.returnPolicy.returnPolicyText || '')
      }

      // 2. Fetch Orders
      const ordersRes = await fetch(`${API_BASE}/orders/admin/all?limit=500`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const ordersData = await ordersRes.json()
      if (ordersData?.success && ordersData.data?.orders) {
        // Filter for orders with return activity or requested/approved/rejected/returned status
        const returnOrders = ordersData.data.orders.filter((o) => {
          const retStatus = o.returnDetails?.returnStatus || o.returnDetails?.status
          return (
            (retStatus && retStatus !== 'None') ||
            Boolean(o.returnDetails?.isReturnRequested) ||
            ['Return Requested', 'Return Approved', 'Returned', 'Return Rejected'].includes(o.status)
          )
        })
        setOrders(returnOrders)
      }
    } catch (err) {
      console.error('Failed to load return management data:', err)
      notify.error('Could not load returns data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Realtime Socket.IO Listeners
    const socket = getSocket()
    socket.emit('join:admin')

    const onReturnNew = (data) => {
      notify.info(data.message || 'New customer return request received!')
      fetchData()
    }

    const onOrderStatusUpdated = () => {
      fetchData()
    }

    socket.on('return:new', onReturnNew)
    socket.on('order:status-updated', onOrderStatusUpdated)

    return () => {
      socket.off('return:new', onReturnNew)
      socket.off('order:status-updated', onOrderStatusUpdated)
    }
  }, [])

  // Save Global Return Window Settings
  const handleSavePolicy = async (e) => {
    e.preventDefault()
    setSavingPolicy(true)
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          returnPolicy: {
            returnWindowDays: Number(returnWindowDays),
            returnPolicyText,
          },
        }),
      })
      const data = await res.json()
      if (data?.success) {
        notify.success(`Global return window set to ${returnWindowDays} days!`)
      } else {
        notify.error(data.message || 'Failed to update return policy')
      }
    } catch (err) {
      console.error(err)
      notify.error('Failed to update return settings')
    } finally {
      setSavingPolicy(false)
    }
  }

  // Handle Action Submit (Approve / Reject / Completed / Refund Issue)
  const handleActionSubmit = async (e) => {
    e.preventDefault()
    if (!selectedReturn) return

    if (actionType === 'Approved' && !pickupDate) {
      notify.error('Please pick the courier pickup collection date')
      return
    }

    if (actionType === 'Refund Issue' && !refundIssueReason.trim()) {
      notify.error('Please state the refund issue reason so customer understands')
      return
    }

    setProcessingAction(true)
    try {
      const res = await fetch(`${API_BASE}/orders/admin/${selectedReturn._id}/return-action`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: actionType,
          pickupDate,
          refundDays: Number(refundDays),
          adminRemarks,
          refundAmount: Number(refundAmount) || selectedReturn.pricing?.finalTotal || 0,
          refundTransactionId,
          refundIssueReason,
        }),
      })
      const data = await res.json()
      if (data?.success) {
        notify.success(`Return status set to "${actionType}" successfully!`)
        setIsModalOpen(false)
        setSelectedReturn(null)
        setPickupDate('')
        setAdminRemarks('')
        setRefundIssueReason('')
        fetchData()
      } else {
        notify.error(data.message || 'Failed to process return request')
      }
    } catch (err) {
      console.error(err)
      notify.error('Error processing return')
    } finally {
      setProcessingAction(false)
    }
  }

  // Filter returns
  const filteredReturns = orders.filter((order) => {
    const matchesSearch =
      order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerInfo?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerInfo?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.returnDetails?.reason?.toLowerCase().includes(searchQuery.toLowerCase())

    const currentStatus = order.returnDetails?.returnStatus || order.returnDetails?.status || order.status
    const matchesStatus =
      statusFilter === 'All'
        ? true
        : statusFilter === 'Requested'
        ? currentStatus === 'Requested' || order.status === 'Return Requested'
        : statusFilter === 'Approved'
        ? currentStatus === 'Approved' || order.status === 'Return Approved'
        : statusFilter === 'Rejected'
        ? currentStatus === 'Rejected' || order.status === 'Return Rejected'
        : statusFilter === 'Completed'
        ? currentStatus === 'Completed' || order.status === 'Returned'
        : true

    return matchesSearch && matchesStatus
  })

  // Open modal with prefilled data
  const openActionModal = (order) => {
    setSelectedReturn(order)
    const currentStatus =
      order.returnDetails?.returnStatus ||
      order.returnDetails?.status ||
      order.status

    if (currentStatus === 'Approved' || order.status === 'Return Approved') {
      setActionType('Completed') // Default to marking completed if already approved
    } else if (currentStatus === 'Refund Issue') {
      setActionType('Refund Issue')
    } else if (currentStatus === 'Completed' || order.status === 'Returned') {
      setActionType('Completed')
    } else if (currentStatus === 'Rejected' || order.status === 'Return Rejected') {
      setActionType('Rejected')
    } else {
      setActionType('Approved')
    }
    setPickupDate(order.returnDetails?.pickupDate || '')
    setRefundDays(order.returnDetails?.refundDays || 5)
    setRefundAmount(order.returnDetails?.refundAmount || order.pricing?.finalTotal || 0)
    setRefundTransactionId(order.returnDetails?.refundTransactionId || `REF-${Math.floor(100000 + Math.random() * 900000)}`)
    setRefundIssueReason(order.returnDetails?.refundIssueReason || '')
    setAdminRemarks(order.returnDetails?.adminRemarks || '')
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* ─── Header & Title ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-normal font-bold text-[#1F1713] flex items-center gap-2.5">
            <RotateCcw className="w-6 h-6 text-[#6D021B]" />
            Return Management
          </h1>
         
        </div>
      </div>

      {/* ─── Global Return Policy Bar ─── */}
      <div className="bg-white border border-stone-200 p-5 shadow-xs">
        <form onSubmit={handleSavePolicy} className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-[#1F1713] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#DEA53B]" />
              Global Product Return days management
            </h2>
    
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center border border-stone-300 bg-stone-50 px-3 py-2">
              <input
                type="number"
                min="1"
                max="90"
                value={returnWindowDays}
                onChange={(e) => setReturnWindowDays(e.target.value)}
                className="w-16 bg-transparent font-bold text-sm text-[#1F1713] focus:outline-hidden text-center"
                required
              />
              <span className="text-xs font-semibold text-stone-500 ml-1">Days</span>
            </div>

            <button
              type="submit"
              disabled={savingPolicy}
              className="px-4 py-2 bg-[#6D021B] hover:bg-[#580014] text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              {savingPolicy ? 'Saving...' : 'Save Policy'}
            </button>
          </div>
        </form>
      </div>

      {/* ─── Filter & Search Bar ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-stone-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer, Reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-stone-200 focus:outline-hidden focus:border-[#6D021B]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Requested', 'Approved', 'Rejected', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors shrink-0 ${
                statusFilter === tab
                  ? 'bg-[#1F1713] text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Returns Table ─── */}
      <div className="bg-white border border-stone-200 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Order ID & Date</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Product Details</th>
              <th className="py-3 px-4">Return Reason & Proof</th>
              <th className="py-3 px-4">Pickup & Refund Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-stone-400">
                  <RotateCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#6D021B]" />
                  Loading return requests...
                </td>
              </tr>
            ) : filteredReturns.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-stone-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  No return requests found matching criteria.
                </td>
              </tr>
            ) : (
              filteredReturns.map((order) => {
                const ret = {
                  ...order.returnDetails,
                  status: order.returnDetails?.returnStatus || order.returnDetails?.status,
                }
                const currentStatus = ret.status || order.status || 'Requested'
                const isRequested = currentStatus === 'Requested' || order.status === 'Return Requested'
                const isApproved = currentStatus === 'Approved' || order.status === 'Return Approved'
                const isRefundIssue = currentStatus === 'Refund Issue'
                const isRejected = currentStatus === 'Rejected' || order.status === 'Return Rejected'
                const isCompleted = currentStatus === 'Completed' || order.status === 'Returned'

                return (
                  <tr key={order._id} className="hover:bg-stone-50/70 transition-colors">
                    {/* Order ID & Date */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-[#1F1713]">#{order.orderId}</div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        Delivered: {order.deliveredAt ? formatIndianDate(order.deliveredAt) : 'Delivered'}
                      </div>
                      <div className="text-[11px] text-stone-400">
                        Req: {ret.requestedAt ? formatIndianDate(ret.requestedAt) : formatIndianDate(order.updatedAt)}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-stone-800">
                        {order.customerInfo?.name || order.shippingAddress?.name || 'Customer'}
                      </div>
                      <div className="text-stone-500 text-[11px]">
                        {order.customerInfo?.phone || order.shippingAddress?.phone}
                      </div>
                      <div className="text-stone-400 text-[10px]">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}
                      </div>
                    </td>

                    {/* Product Details */}
                    <td className="py-3.5 px-4 align-top max-w-[200px]">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 mb-1.5 last:mb-0">
                          <img
                            src={getCmsImageUrl(item.image)}
                            alt={item.title}
                            className="w-9 h-11 object-cover bg-stone-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-stone-800 truncate text-[11px]">{item.title}</p>
                            <p className="text-[10px] text-stone-500">
                              Qty: {item.quantity} • ₹{item.price?.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </td>

                    {/* Reason & Proof */}
                    <td className="py-3.5 px-4 align-top max-w-[220px]">
                      <div className="font-semibold text-[#6D021B] text-[11px]">
                        {ret.reason || 'Customer Return Request'}
                      </div>
                      {ret.comments && (
                        <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5 italic">
                          "{ret.comments}"
                        </p>
                      )}

                      {/* Photo Proof Thumbnails */}
                      {ret.proofImages && ret.proofImages.length > 0 ? (
                        <div className="flex items-center gap-1.5 mt-2">
                          {ret.proofImages.map((img, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setActiveImagePreview(getCmsImageUrl(img))}
                              className="relative group border border-stone-200 hover:border-[#6D021B] transition-colors"
                            >
                              <img
                                src={getCmsImageUrl(img)}
                                alt={`Proof ${i + 1}`}
                                className="w-8 h-8 object-cover"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="w-3 h-3 text-white" />
                              </div>
                            </button>
                          ))}
                          <span className="text-[10px] text-stone-400 ml-1">
                            {ret.proofImages.length} photo{ret.proofImages.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-stone-400 mt-1 block">No proof attached</span>
                      )}
                    </td>

                    {/* Status & Courier Info */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="inline-flex items-center gap-1 font-bold uppercase tracking-wider text-[11px]">
                        {isRequested && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1">
                            Pending Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1">
                            ✓ Pickup Approved
                          </span>
                        )}
                        {isRefundIssue && (
                          <span className="bg-amber-500 text-white border border-amber-600 px-2.5 py-1 font-bold">
                            ⚠️ Refund Issue Reported
                          </span>
                        )}
                        {isRejected && (
                          <span className="bg-red-100 text-red-900 border border-red-300 px-2.5 py-1">
                            ✕ Return Rejected
                          </span>
                        )}
                        {isCompleted && (
                          <span className="bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-1">
                            ✓ Refund Completed
                          </span>
                        )}
                      </div>

                      {ret.pickupDate && (
                        <div className="text-[11px] text-stone-600 mt-1.5 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-[#DEA53B]" />
                          Pickup: <span className="font-semibold text-stone-900">{ret.pickupDate}</span>
                        </div>
                      )}

                      {ret.refundDays && isApproved && (
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          Refund in: <span className="font-semibold text-stone-800">{ret.refundDays} days</span>
                        </div>
                      )}

                      {ret.refundIssueReason && (
                        <div className="text-[11px] text-amber-800 bg-amber-50 p-1.5 mt-1 border border-amber-200">
                          <strong>Issue:</strong> {ret.refundIssueReason}
                        </div>
                      )}

                      {ret.refundTransactionId && isCompleted && (
                        <div className="text-[11px] text-blue-800 font-mono mt-1">
                          Ref: {ret.refundTransactionId}
                        </div>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="py-3.5 px-4 align-top text-right">
                      {isCompleted || isRejected ? (
                        <button
                          type="button"
                          onClick={() => openActionModal(order)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-[11px] font-semibold uppercase tracking-wider transition-colors"
                        >
                          View Details
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openActionModal(order)}
                          className="px-3 py-1.5 bg-[#1F1713] hover:bg-[#6D021B] text-white text-[11px] font-semibold uppercase tracking-wider transition-colors"
                        >
                          {isRequested ? 'Review Request' : 'Update Return'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Lightbox for Proof Image Preview ─── */}
      {activeImagePreview && (
        <div
          onClick={() => setActiveImagePreview(null)}
          className="fixed inset-0 z-70 bg-black/85 flex items-center justify-center p-4"
        >
          <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setActiveImagePreview(null)}
              className="absolute -top-10 right-0 text-white hover:text-stone-300 p-1 cursor-pointer"
            >
              <X className="w-7 h-7" />
            </button>
            <img
              src={activeImagePreview}
              alt="Proof full preview"
              className="max-h-[85vh] w-auto max-w-full mx-auto object-contain shadow-2xl border border-white/20 bg-black"
            />
          </div>
        </div>
      )}

      {/* ─── Action Modal (Approve / Reject / Pickup Date / Refund Days) ─── */}
      {isModalOpen && selectedReturn && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2 sm:p-4 md:p-6 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white max-w-xl w-full max-h-[92vh] flex flex-col border border-stone-300 shadow-2xl my-auto">
            {/* Modal Header */}
            <div className="bg-[#FAF7F2] p-3 sm:p-4 border-b border-stone-200 flex items-center justify-between shrink-0">
              <div className="min-w-0 pr-2">
                <h3 className="text-sm sm:text-base font-normal font-bold text-[#1F1713] flex items-center gap-2 truncate">
                  <RotateCcw className="w-4 h-4 text-[#6D021B] shrink-0" />
                  <span>Return Action: Order #{selectedReturn.orderId}</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5 truncate">
                  Customer: {selectedReturn.customerInfo?.name || selectedReturn.shippingAddress?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable on small screens) */}
            {(() => {
              const currentStatus =
                selectedReturn.returnDetails?.returnStatus ||
                selectedReturn.returnDetails?.status ||
                selectedReturn.status

              const isLockedFinal =
                currentStatus === 'Completed' ||
                selectedReturn.status === 'Returned' ||
                currentStatus === 'Rejected' ||
                selectedReturn.status === 'Return Rejected'

              return (
                <form onSubmit={handleActionSubmit} className="p-3 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto flex-1">
                  {/* Return Details Summary */}
                  <div className="bg-stone-50 p-2.5 sm:p-3 border border-stone-200 text-xs space-y-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-stone-500">Reason:</span>
                      <span className="font-semibold text-[#6D021B]">
                        {selectedReturn.returnDetails?.reason || 'Customer request'}
                      </span>
                    </div>
                    {selectedReturn.returnDetails?.customerComments && (
                      <div>
                        <span className="text-stone-500 block mb-0.5">Customer Comment:</span>
                        <p className="text-blue-600 bg-white p-2 border border-stone-200 text-xs break-words">
                          "{selectedReturn.returnDetails.customerComments}"
                        </p>
                      </div>
                    )}

                    {/* Proof Thumbnails inside Modal */}
                    {selectedReturn.returnDetails?.proofImages?.length > 0 && (
                      <div>
                        <span className="text-stone-500 block mb-1">Uploaded Proof Photos:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedReturn.returnDetails.proofImages.map((img, i) => (
                            <img
                              key={i}
                              src={getCmsImageUrl(img)}
                              alt="Proof"
                              onClick={() => setActiveImagePreview(getCmsImageUrl(img))}
                              className="w-12 h-12 sm:w-14 sm:h-14 object-cover border border-stone-300 cursor-pointer hover:opacity-80 shrink-0"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notice if already finalized */}
                  {isLockedFinal ? (
                    <div className="p-3 bg-stone-100 border border-stone-300 text-xs text-stone-700 flex items-center justify-between">
                      <span className="font-semibold">
                        Current Status: <strong className="text-stone-900">{currentStatus}</strong> (Updated to customer)
                      </span>
                      <span className="text-[11px] text-stone-500 font-medium">Locked (Cannot be edited)</span>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-center justify-between">
                      <span>
                        Current Status: <strong className="font-bold">{currentStatus || 'Pending Review'}</strong>
                      </span>
                      <span className="text-[11px] text-blue-700">Select an action below to update</span>
                    </div>
                  )}

                  {/* Action Decision Toggle (Disabled once Completed or Rejected) */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                      Update Return Status
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        disabled={isLockedFinal}
                        onClick={() => setActionType('Approved')}
                        className={`py-2 px-1 text-center text-[11px] font-semibold uppercase tracking-wider border transition-colors ${
                          actionType === 'Approved'
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : isLockedFinal
                            ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                            : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100 cursor-pointer'
                        }`}
                      >
                        1. Approve Pickup
                      </button>
                      <button
                        type="button"
                        disabled={isLockedFinal}
                        onClick={() => setActionType('Completed')}
                        className={`py-2 px-1 text-center text-[11px] font-semibold uppercase tracking-wider border transition-colors ${
                          actionType === 'Completed'
                            ? 'bg-blue-700 text-white border-blue-700'
                            : isLockedFinal
                            ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                            : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100 cursor-pointer'
                        }`}
                      >
                        2. Refund Done ✓
                      </button>
                      <button
                        type="button"
                        disabled={isLockedFinal}
                        onClick={() => setActionType('Refund Issue')}
                        className={`py-2 px-1 text-center text-[11px] font-semibold uppercase tracking-wider border transition-colors ${
                          actionType === 'Refund Issue'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : isLockedFinal
                            ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                            : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100 cursor-pointer'
                        }`}
                      >
                        3. Refund Issue ⚠️
                      </button>
                      <button
                        type="button"
                        disabled={isLockedFinal}
                        onClick={() => {
                          setActionType('Rejected')
                          setAdminRemarks('')
                        }}
                        className={`py-2 px-1 text-center text-[11px] font-semibold uppercase tracking-wider border transition-colors ${
                          actionType === 'Rejected'
                            ? 'bg-red-700 text-white border-red-700'
                            : isLockedFinal
                            ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                            : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100 cursor-pointer'
                        }`}
                      >
                        4. Reject Return ✕
                      </button>
                    </div>
                  </div>

                  {/* If 1. Approved: Pickup Date & Refund Days Inputs */}
                  {actionType === 'Approved' && (
                    <div className="space-y-3 pt-2 border-t border-stone-200">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Courier Pickup Date (Calendar date only) *
                        </label>
                        <input
                          type="date"
                          disabled={isLockedFinal}
                          min={new Date().toISOString().split('T')[0]}
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-stone-300 focus:outline-hidden focus:border-[#6D021B] disabled:bg-stone-100 disabled:cursor-not-allowed"
                          required
                        />
                        <p className="text-[11px] text-stone-500 mt-1">
                          The date our courier executive will arrive to collect the package from the customer.
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Refund Amount Credit in customer Account (Days)
                        </label>
                        <div className="flex items-center border border-stone-300 px-3 py-1.5 w-full sm:w-40 bg-white">
                          <input
                            type="number"
                            disabled={isLockedFinal}
                            min="1"
                            max="30"
                            value={refundDays}
                            onChange={(e) => setRefundDays(e.target.value)}
                            className="w-full bg-transparent text-xs font-bold text-[#1F1713] focus:outline-hidden disabled:cursor-not-allowed"
                            required
                          />
                          <span className="text-xs text-stone-500 ml-1">Days</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1">
                          Customer is notified: "Refund will be credited within X days after pickup."
                        </p>
                      </div>
                    </div>
                  )}

                  {/* If 2. Completed: Refund Amount & Bank Ref ID */}
                  {actionType === 'Completed' && (
                    <div className="space-y-3 pt-2 border-t border-stone-200 bg-blue-50/50 p-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Refund Amount Credited (₹) *
                        </label>
                        <input
                          type="number"
                          disabled={isLockedFinal}
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-stone-300 focus:outline-hidden focus:border-blue-700 font-bold disabled:bg-stone-100 disabled:cursor-not-allowed"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          Bank Reference / Transaction ID *
                        </label>
                        <input
                          type="text"
                          disabled={isLockedFinal}
                          value={refundTransactionId}
                          onChange={(e) => setRefundTransactionId(e.target.value)}
                          placeholder="e.g. REF-789421 or Bank UTR"
                          className="w-full px-3 py-2 text-xs bg-white border border-stone-300 focus:outline-hidden focus:border-blue-700 font-mono disabled:bg-stone-100 disabled:cursor-not-allowed"
                          required
                        />
                        <p className="text-[11px] text-stone-500 mt-1">
                          Customer will see: "Refund Completed Successfully - Bank Ref: {refundTransactionId}"
                        </p>
                      </div>
                    </div>
                  )}

                  {/* If 3. Refund Issue: Reason explanation */}
                  {actionType === 'Refund Issue' && (
                    <div className="space-y-3 pt-2 border-t border-stone-200 bg-amber-50/60 p-3">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">
                          What is the refund issue? (Shown clearly to customer) *
                        </label>
                        <textarea
                          rows="2"
                          disabled={isLockedFinal}
                          value={refundIssueReason}
                          onChange={(e) => setRefundIssueReason(e.target.value)}
                          placeholder="e.g. Bank transfer failed - Account not reachable. Please call support with alternate UPI."
                          className="w-full p-2.5 text-xs bg-white border border-amber-300 focus:outline-hidden focus:border-amber-600 disabled:bg-stone-100 disabled:cursor-not-allowed"
                          required
                        />
                        <p className="text-[11px] text-stone-500 mt-1">
                          This message explains to the customer why the refund is delayed and what they need to do.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Admin Remarks: Only show when action is 'Rejected' */}
                  {actionType === 'Rejected' && (
                    <div className="space-y-1.5 pt-2 border-t border-stone-200">
                      <label className="block text-xs font-semibold text-stone-700">
                        Reason for Rejection (Shown to Customer) *
                      </label>
                      <textarea
                        rows="2"
                        disabled={isLockedFinal}
                        value={adminRemarks}
                        onChange={(e) => setAdminRemarks(e.target.value)}
                        placeholder="e.g. Product tags missing or return window expired."
                        className="w-full p-2.5 text-xs border border-red-300 focus:outline-hidden focus:border-red-600 disabled:bg-stone-100 disabled:cursor-not-allowed"
                        required
                      />
                      <p className="text-[11px] text-stone-500">
                        This reason will explain to the customer why their return request was rejected.
                      </p>
                    </div>
                  )}

                  {/* Modal Actions */}
                  <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="w-full sm:w-auto px-4 py-2 border border-stone-300 text-xs font-semibold text-stone-600 hover:bg-stone-50 uppercase tracking-wider text-center cursor-pointer"
                    >
                      {isLockedFinal ? 'Close' : 'Cancel'}
                    </button>
                    {!isLockedFinal && (
                      <button
                        type="submit"
                        disabled={processingAction}
                        className={`w-full sm:w-auto px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors disabled:opacity-50 text-center cursor-pointer ${
                          actionType === 'Approved'
                            ? 'bg-[#6D021B] hover:bg-[#580014]'
                            : actionType === 'Completed'
                            ? 'bg-blue-700 hover:bg-blue-800'
                            : actionType === 'Refund Issue'
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-red-700 hover:bg-red-800'
                        }`}
                      >
                        {processingAction ? 'Processing...' : `Confirm ${actionType}`}
                      </button>
                    )}
                  </div>
                </form>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}

