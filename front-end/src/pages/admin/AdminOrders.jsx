import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  X,
  FileText,
  MapPin,
  User,
  Phone,
  Mail,
  Package,
  Calendar,
  CreditCard,
  RefreshCw,
  Edit2,
  Check,
  MoveHorizontal,
} from 'lucide-react'
import Toast from '../../components/Toast'
import {
  AdminTableContainer,
  AdminTableHead,
  AdminTableBody,
  AdminPagination,
} from '../../components/admin/AdminUI'
import { getCmsImageUrl } from '../../utils/imageHelper'
import { formatIndianDate, formatIndianTime } from '../../utils/dateHelper'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalOrders, setTotalOrders] = useState(0)

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Status update states
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [editStatus, setEditStatus] = useState('')

  // Cancel Reason Popup Modal States (for Admin Cancellation)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState(null)
  const [adminCancelReason, setAdminCancelReason] = useState('')

  // Drag-to-scroll (mouse hold to drag left <-> right)
  const tableScrollRef = useRef(null)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const [isHoldingMouse, setIsHoldingMouse] = useState(false)

  const handleMouseDown = (e) => {
    // Avoid triggering drag if clicking on buttons, inputs or links
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) return
    const container = tableScrollRef.current
    if (!container) return
    isDraggingRef.current = true
    setIsHoldingMouse(true)
    startXRef.current = e.pageX - container.offsetLeft
    scrollLeftRef.current = container.scrollLeft
  }

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return
    e.preventDefault()
    const container = tableScrollRef.current
    if (!container) return
    const x = e.pageX - container.offsetLeft
    const walk = (x - startXRef.current) * 1.5 // multiplier for smooth drag speed
    container.scrollLeft = scrollLeftRef.current - walk
  }

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false
    setIsHoldingMouse(false)
  }

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
  }

  // Fetch real orders from backend MongoDB
  const fetchOrders = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('vastraa_admin_token')
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(pageSize),
        status: statusFilter,
        search: searchQuery,
      })

      const res = await fetch(`${API_BASE}/orders/admin/all?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const result = await res.json()

      if (result.success && result.data) {
        setOrders(result.data.orders || [])
        setTotalOrders(result.data.total || 0)
      } else {
        setOrders([])
        setTotalOrders(0)
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err)
      showToast('Could not load orders from database.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [page, pageSize, statusFilter, searchQuery])

  // Allowed progressive transitions: Once changed, previous statuses cannot be selected
  const getAllowedNextStatuses = (currentStatus) => {
    const canonical = ['Placed', 'Processing'].includes(currentStatus) ? 'On process' : currentStatus
    switch (canonical) {
      case 'On process':
        return ['On process', 'Shipped', 'Cancelled']
      case 'Shipped':
        return ['Shipped', 'Delivered', 'Returned']
      case 'Delivered':
        return ['Delivered', 'Returned']
      case 'Cancelled':
        return ['Cancelled']
      case 'Returned':
        return ['Returned']
      default:
        return [currentStatus]
    }
  }

  // Open Details Modal
  const handleOpenDetails = (order) => {
    const canonical = ['Placed', 'Processing'].includes(order.status) ? 'On process' : order.status
    setSelectedOrder(order)
    setEditStatus(canonical)
    setIsModalOpen(true)
  }

  // Save Status to DB
  const handleUpdateStatus = async () => {
    if (!selectedOrder) return
    if (editStatus === selectedOrder.status) {
      showToast('Status is already set to ' + editStatus, 'info')
      return
    }
    setUpdatingStatus(true)
    try {
      const token = localStorage.getItem('vastraa_admin_token')
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

      const res = await fetch(`${API_BASE}/orders/admin/${selectedOrder._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: editStatus,
          message: `Order status updated to ${editStatus} by admin.`,
        }),
      })

      const result = await res.json()
      if (result.success && result.data) {
        showToast(`Order status updated to ${result.data.status} successfully!`)
        setSelectedOrder(result.data)
        // Refresh table
        fetchOrders()
      } else {
        showToast(result.message || 'Failed to update order status', 'error')
      }
    } catch (err) {
      showToast(err.message || 'Error updating order', 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Direct quick action to advance order status
  const handleDirectAdvanceStatus = async (order, targetStatus, customReason = '') => {
    // If admin is selecting 'Cancelled', prompt reason popup modal first
    if (targetStatus === 'Cancelled' && !customReason) {
      setOrderToCancel(order)
      setAdminCancelReason('')
      setCancelModalOpen(true)
      return
    }

    setUpdatingStatus(true)
    try {
      const token = localStorage.getItem('vastraa_admin_token')
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

      const res = await fetch(`${API_BASE}/orders/admin/${order._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: targetStatus,
          message: customReason ? customReason.trim() : `Order marked as ${targetStatus} by admin.`,
        }),
      })

      const result = await res.json()
      if (result.success && result.data) {
        showToast(
          targetStatus === 'Cancelled'
            ? `Order #${order.orderId} cancelled & notification email sent to customer!`
            : `Order #${order.orderId} updated to ${result.data.status} successfully!`
        )
        if (selectedOrder && selectedOrder._id === order._id) {
          setSelectedOrder(result.data)
        }
        fetchOrders()
      } else {
        showToast(result.message || 'Failed to update order status', 'error')
      }
    } catch (err) {
      showToast(err.message || 'Error updating order', 'error')
    } finally {
      setUpdatingStatus(false)
      setCancelModalOpen(false)
      setOrderToCancel(null)
    }
  }

  // Confirm cancel with custom reason
  const handleConfirmCancelWithReason = () => {
    if (!orderToCancel) return
    const reason = adminCancelReason.trim() || 'Quality control check or stock availability issue.'
    handleDirectAdvanceStatus(orderToCancel, 'Cancelled', reason)
  }

  // Unified Order rows: 1 Order Document = 1 Single Table Row (even with multiple items)
  const displayRows = useMemo(() => {
    return orders.map((order) => {
      const items = order.items && order.items.length > 0 ? order.items : []
      const totalItemsCount = items.reduce((acc, it) => acc + (it.quantity || 1), 0)
      return {
        order,
        orderId: order.orderId,
        items,
        totalItemsCount,
        orderDate: formatIndianDate(order.createdAt),
        orderTime: formatIndianTime(order.createdAt),
        customerName: order.customerInfo?.name || order.shippingAddress?.name || 'Customer',
        customerEmail: order.customerInfo?.email || 'N/A',
        customerPhone: order.customerInfo?.phone || order.shippingAddress?.phone || 'N/A',
        shippingCity: order.shippingAddress?.city || 'N/A',
        status: order.status,
        totalAmount: order.pricing?.finalTotal || 0,
      }
    })
  }, [orders])

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
      return 'bg-amber-50 text-amber-800 border-amber-200'
    }
    return 'bg-sky-50 text-sky-800 border-sky-200' // On process
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Orders Management
          </h1>
          
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-xs cursor-pointer self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search by Order ID, customer, email, city..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-400"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          {['All', 'On process', 'Shipped', 'Delivered', 'Cancelled', 'Returned'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st)
                setPage(1)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Container & Responsive View */}
      {/* Desktop / Tablet View (Horizontal Table with Drag-to-Scroll & Clickable Rows) */}
      <div className="hidden md:block space-y-2">
        <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
          <span className="flex items-center gap-1.5 font-medium">
            <MoveHorizontal className="w-3.5 h-3.5 text-stone-400" />
            <span>Hold mouse &amp; drag left/right to scroll • Click any order row to view modal</span>
          </span>
          <span className="text-[10px] text-stone-400">Total: {totalOrders} orders</span>
        </div>

        <div
          ref={tableScrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`bg-white border border-[#EDE4D8] rounded-xl shadow-2xs overflow-x-auto select-none transition-shadow ${
            isHoldingMouse ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ scrollBehavior: isHoldingMouse ? 'auto' : 'smooth' }}
        >
          <table className="w-full text-left border-collapse text-xs table-fixed min-w-[760px]">
            <colgroup>
              <col style={{ width: '28%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '17%' }} />
            </colgroup>
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#EDE4D8] text-[#73655B] uppercase font-bold tracking-wider text-[11px]">
                <th className="py-3 px-3 text-left">Order &amp; Items</th>
                <th className="py-3 px-3 text-left">Customer &amp; Contact</th>
                <th className="py-3 px-3 text-left">Date &amp; Time</th>
                <th className="py-3 px-3 text-left">Amount</th>
                <th className="py-3 px-3 text-left">Status</th>
                <th className="py-3 px-3 text-right">Change Status / Action</th>
              </tr>
            </thead>

            <AdminTableBody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-xs text-stone-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-stone-400" />
                    <span>Loading real orders from database...</span>
                  </td>
                </tr>
              ) : displayRows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-xs text-stone-500">
                    <Package className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="font-semibold text-stone-700">No orders found</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">When users place orders on the storefront, they appear here live.</p>
                  </td>
                </tr>
              ) : (
                displayRows.map((row) => {
                  const canonicalStatus = ['Placed', 'Processing'].includes(row.status) ? 'On process' : row.status
                  const isShipped = canonicalStatus === 'Shipped'
                  const isOnProcess = canonicalStatus === 'On process'
                  const isDelivered = canonicalStatus === 'Delivered'
                  const isTerminal = ['Cancelled', 'Returned'].includes(canonicalStatus)

                  return (
                    <tr
                      key={row.order._id}
                      onClick={() => handleOpenDetails(row.order)}
                      className="hover:bg-amber-50/40 border-b border-stone-100 transition-colors cursor-pointer group"
                    >
                      {/* Order & Items Preview */}
                      <td className="py-3 px-3 align-top">
                        <div className="flex items-start gap-2.5">
                          <div className="relative shrink-0 flex -space-x-3 overflow-hidden py-0.5 group-hover:scale-105 transition-transform">
                            {row.items.slice(0, 3).map((it, idx) => (
                              <img
                                key={idx}
                                src={getCmsImageUrl(it.image)}
                                alt={it.title}
                                className={`w-10 h-12 object-cover rounded bg-stone-100 border border-white shadow-2xs ${idx > 0 ? 'opacity-90' : ''}`}
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&auto=format&fit=crop&q=80'
                                }}
                              />
                            ))}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-xs font-bold text-stone-900 group-hover:text-[#6D021B] transition-colors">
                                #{row.orderId}
                              </span>
                              <span className="text-[10px] bg-stone-100 text-stone-700 font-semibold px-1.5 py-0.2 rounded border border-stone-200">
                                {row.totalItemsCount} {row.totalItemsCount === 1 ? 'item' : 'items'}
                              </span>
                            </div>

                            <p className="text-xs text-stone-800 font-medium line-clamp-1 mt-0.5" title={row.items.map(i => i.title).join(', ')}>
                              {row.items.map((i) => `${i.title} (x${i.quantity || 1})`).join(' + ')}
                            </p>

                            <span className="text-[10px] text-stone-400 block mt-0.5">
                              Click row to view full details
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Customer with Direct Call & Email Actions */}
                      <td className="py-3 px-3 align-top text-xs" onClick={(e) => e.stopPropagation()}>
                        <span className="font-bold text-stone-900 block truncate">{row.customerName}</span>
                        
                        {/* Direct Email Click Action */}
                        {row.customerEmail && row.customerEmail !== 'N/A' && (
                          <a
                            href={`mailto:${row.customerEmail}`}
                            className="inline-flex items-center gap-1 text-[11px] text-stone-600 hover:text-[#6D021B] hover:underline mt-0.5 max-w-full truncate group/email"
                            title={`Send email to ${row.customerEmail}`}
                          >
                            <Mail className="w-3 h-3 text-stone-400 group-hover/email:text-[#6D021B] shrink-0" />
                            <span className="truncate">{row.customerEmail}</span>
                          </a>
                        )}

                        {/* Direct Call Click Action */}
                        <div className="flex items-center gap-2 mt-1">
                          {row.customerPhone && row.customerPhone !== 'N/A' ? (
                            <a
                              href={`tel:${row.customerPhone}`}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
                              title={`Call ${row.customerPhone}`}
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span className="font-mono">{row.customerPhone}</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-stone-400">No phone</span>
                          )}
                          <span className="text-[10px] text-stone-400">• {row.shippingCity}</span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3 px-3 align-top text-xs text-stone-600">
                        <span className="block font-medium text-stone-800">{row.orderDate}</span>
                        <span className="text-[11px] text-stone-400 block">{row.orderTime}</span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 align-top text-xs font-bold text-stone-900">
                        ₹{row.totalAmount.toLocaleString('en-IN')}
                      </td>

                      {/* Status Pill */}
                      <td className="py-3 px-3 align-top">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(row.status)}`}>
                          {row.status}
                        </span>
                      </td>

                      {/* Status Dropdown & Action in Table */}
                      <td className="py-3 px-3 align-top text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                          {/* All-Statuses Dropdown (Shows all 5 statuses; past/illegal statuses are disabled so admin cannot revert) */}
                          <select
                            value={canonicalStatus}
                            disabled={updatingStatus || isTerminal}
                            onChange={(e) => handleDirectAdvanceStatus(row.order, e.target.value)}
                            className={`px-2 py-1 text-[11px] font-semibold rounded border focus:outline-none transition-colors cursor-pointer ${
                              isTerminal
                                ? 'bg-stone-100 text-stone-500 border-stone-200 cursor-not-allowed'
                                : 'bg-white text-stone-900 border-stone-300 hover:border-stone-500'
                            }`}
                            title={isTerminal ? `Order is ${canonicalStatus} and cannot be reverted.` : 'Change Order Status'}
                          >
                            {['On process', 'Shipped', 'Delivered', 'Cancelled', 'Returned'].map((st) => {
                              const isAllowed = getAllowedNextStatuses(canonicalStatus).includes(st)
                              return (
                                <option
                                  key={st}
                                  value={st}
                                  disabled={!isAllowed}
                                  className={!isAllowed ? 'text-stone-300 bg-stone-50' : 'text-stone-900 font-medium'}
                                >
                                  {st} {!isAllowed && st !== canonicalStatus ? '(Locked)' : ''}
                                </option>
                              )
                            })}
                          </select>

                          {/* Quick Manage Eye Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(row.order)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-xs font-semibold inline-flex items-center cursor-pointer transition-colors shrink-0"
                            title="View Full Order Details & Timeline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </AdminTableBody>
          </table>
        </div>
      </div>

      {/* Mobile Responsive Cards View (for screen widths under 768px) */}
      <div className="block md:hidden space-y-4">
        {loading ? (
          <div className="bg-white p-8 rounded-xl border border-stone-200 text-center text-xs text-stone-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-stone-400" />
            <span>Loading orders...</span>
          </div>
        ) : displayRows.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-stone-200 text-center text-xs text-stone-500">
            <Package className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="font-semibold text-stone-700">No orders found</p>
          </div>
        ) : (
          displayRows.map((row) => {
            const canonicalStatus = ['Placed', 'Processing'].includes(row.status) ? 'On process' : row.status
            const isShipped = canonicalStatus === 'Shipped'
            const isOnProcess = canonicalStatus === 'On process'
            const isDelivered = canonicalStatus === 'Delivered'
            const isTerminal = ['Cancelled', 'Returned'].includes(canonicalStatus)

            return (
              <div
                key={row.order._id}
                className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs space-y-3"
              >
                {/* Header: ID, Badge & Price */}
                <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                  <div>
                    <span className="font-mono text-xs font-bold text-stone-900 block">
                      #{row.orderId}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {row.orderDate} • {row.orderTime}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-[#6D021B] block">
                      ₹{row.totalAmount.toLocaleString('en-IN')}
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(row.status)}`}>
                      {row.status}
                    </span>
                  </div>
                </div>

                {/* Items Stack & Names */}
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0 flex -space-x-3 overflow-hidden">
                    {row.items.slice(0, 3).map((it, idx) => (
                      <img
                        key={idx}
                        src={getCmsImageUrl(it.image)}
                        alt={it.title}
                        className="w-11 h-13 object-cover rounded-md bg-stone-100 border border-white shadow-2xs"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&auto=format&fit=crop&q=80'
                        }}
                      />
                    ))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-stone-900 line-clamp-2">
                      {row.items.map((i) => `${i.title} (x${i.quantity || 1})`).join(' + ')}
                    </p>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      {row.totalItemsCount} {row.totalItemsCount === 1 ? 'item' : 'items'} in order
                    </span>
                  </div>
                </div>

                {/* Customer Details info strip with quick Call & Email buttons */}
                <div className="bg-stone-50 p-2.5 rounded-lg text-xs space-y-1.5">
                  <div className="flex justify-between text-stone-700">
                    <span className="text-stone-500">Customer:</span>
                    <span className="font-semibold text-stone-900">{row.customerName}</span>
                  </div>
                  <div className="flex justify-between text-stone-700 text-[11px]">
                    <span className="text-stone-500">City / State:</span>
                    <span>{row.shippingCity}</span>
                  </div>
                  
                  {/* Action links */}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 text-[11px]">
                    {row.customerPhone && row.customerPhone !== 'N/A' ? (
                      <a
                        href={`tel:${row.customerPhone}`}
                        className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span className="font-mono">{row.customerPhone}</span>
                      </a>
                    ) : (
                      <span className="text-stone-400">No phone</span>
                    )}

                    {row.customerEmail && row.customerEmail !== 'N/A' && (
                      <a
                        href={`mailto:${row.customerEmail}`}
                        className="inline-flex items-center gap-1 text-stone-600 hover:text-[#6D021B]"
                      >
                        <Mail className="w-3 h-3 text-stone-400" />
                        <span>Email</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Action Buttons in Mobile Card */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => handleOpenDetails(row.order)}
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* All-Statuses Dropdown on Mobile Card */}
                    <select
                      value={canonicalStatus}
                      disabled={updatingStatus || isTerminal}
                      onChange={(e) => handleDirectAdvanceStatus(row.order, e.target.value)}
                      className={`px-2 py-1.5 text-xs font-semibold rounded border focus:outline-none transition-colors cursor-pointer ${
                        isTerminal
                          ? 'bg-stone-100 text-stone-500 border-stone-200 cursor-not-allowed'
                          : 'bg-white text-stone-900 border-stone-300'
                      }`}
                    >
                      {['On process', 'Shipped', 'Delivered', 'Cancelled', 'Returned'].map((st) => {
                        const isAllowed = getAllowedNextStatuses(canonicalStatus).includes(st)
                        return (
                          <option
                            key={st}
                            value={st}
                            disabled={!isAllowed}
                            className={!isAllowed ? 'text-stone-300 bg-stone-50' : 'text-stone-900'}
                          >
                            {st} {!isAllowed && st !== canonicalStatus ? '(Locked)' : ''}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      <AdminPagination
        currentPage={page}
        totalItems={totalOrders}
        pageSize={pageSize}
        onPageChange={(p) => setPage(p)}
        onPageSizeChange={(sz) => {
          setPageSize(sz)
          setPage(1)
        }}
      />

      {/* ─── ORDER DETAILS & STATUS UPDATE MODAL ─── */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  Order Management
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Order #{selectedOrder.orderId}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status Notification & Cancellation Reason Display */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                      Current Order Status
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Status progression is managed directly in the Orders table dropdown.
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                {/* If the order was cancelled, clearly show the recorded cancellation reason */}
                {selectedOrder.status === 'Cancelled' && (
                  <div className="mt-2.5 p-3 bg-rose-50 border border-rose-200 rounded-lg">
                    <span className="text-[10px] font-bold uppercase text-rose-800 tracking-wider block mb-1">
                      Cancellation Reason Recorded
                    </span>
                    <p className="text-xs text-rose-950 font-medium italic">
                      &quot;{selectedOrder.timeline?.find((t) => t.status === 'Cancelled')?.message || 'Cancelled by store administration.'}&quot;
                    </p>
                  </div>
                )}
              </div>

              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                  <span className="font-bold text-stone-800 uppercase text-[10px] block mb-2">
                    Customer Contact
                  </span>
                  <p className="font-bold text-stone-900">{selectedOrder.customerInfo?.name || selectedOrder.shippingAddress?.name}</p>
                  <p className="text-stone-600">{selectedOrder.customerInfo?.email}</p>
                  <p className="text-stone-600 font-mono">{selectedOrder.customerInfo?.phone || selectedOrder.shippingAddress?.phone}</p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                  <span className="font-bold text-stone-800 uppercase text-[10px] block mb-2">
                    Shipping Destination
                  </span>
                  <p className="text-stone-900">{selectedOrder.shippingAddress?.street}</p>
                  <p className="text-stone-600">{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-white border border-stone-200 text-[10px] rounded font-semibold text-stone-700">
                    {selectedOrder.shippingAddress?.type || 'Home'} Delivery
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="font-bold text-xs uppercase text-stone-800 block">
                  Ordered Products ({selectedOrder.items?.length || 0})
                </span>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl p-3 bg-white">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={getCmsImageUrl(item.image)}
                          alt={item.title}
                          className="w-10 h-12 object-cover rounded bg-stone-100"
                        />
                        <div>
                          <p className="font-semibold text-stone-900">{item.title}</p>
                          <p className="text-[10px] text-stone-500">
                            {item.color && `Color: ${item.color} • `}
                            Qty: {item.quantity || 1} × ₹{Number(item.price || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-stone-900">
                        ₹{(Number(item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="p-4 bg-stone-50 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span>₹{(selectedOrder.pricing?.subtotal || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping Fee:</span>
                  <span>₹{(selectedOrder.pricing?.shippingFee || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-stone-200 pt-1.5 flex justify-between font-bold text-sm text-stone-900">
                  <span>Total Paid:</span>
                  <span className="text-[#6D021B]">₹{(selectedOrder.pricing?.finalTotal || 0).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADMIN ORDER CANCELLATION REASON POPUP MODAL ─── */}
      {cancelModalOpen && orderToCancel && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
                <XCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="min-w-0">
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Reject / Cancel Order #{orderToCancel.orderId}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Enter the reason why our store is rejecting this order. An automated professional email will be dispatched to <strong>{orderToCancel.customerInfo?.email || orderToCancel.shippingAddress?.email}</strong> with ordered item details and this explanation.
                </p>
              </div>
            </div>

            {/* Quick Summary of Products in Order */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">Items to be cancelled:</span>
              <p className="font-semibold text-stone-900 truncate">
                {orderToCancel.items?.map((i) => i.title).join(' • ')}
              </p>
              <span className="text-[11px] text-[#6D021B] font-bold block mt-1">
                Total Value: ₹{(orderToCancel.pricing?.finalTotal || 0).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Reason input box */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5">
                Rejection Reason for Customer <span className="text-rose-600">*</span>:
              </label>
              <textarea
                value={adminCancelReason}
                onChange={(e) => setAdminCancelReason(e.target.value)}
                placeholder="e.g. Saree fabric weave failed final pre-dispatch quality inspection, or raw material currently out of stock."
                rows={3}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#6D021B] resize-none"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                * Note: Once cancelled, this order status becomes terminal and cannot be reverted backwards.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => {
                  setCancelModalOpen(false)
                  setOrderToCancel(null)
                }}
                className="px-4 py-2 border border-stone-300 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={updatingStatus}
                onClick={handleConfirmCancelWithReason}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-60"
              >
                {updatingStatus ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Send Notice &amp; Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
