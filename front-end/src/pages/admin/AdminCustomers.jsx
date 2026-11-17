import { useState, useEffect, useRef } from 'react'
import {
  Search,
  Mail,
  Phone,
  Eye,
  Calendar,
  X,
  MapPin,
  RefreshCw,
  Users,
  ShieldCheck,
  Ban,
  CheckCircle,
  Trash2,
} from 'lucide-react'
import {
  AdminTableContainer,
  AdminTableHead,
  AdminTableBody,
  AdminPagination,
} from '../../components/admin/AdminUI'
import { formatIndianDate } from '../../utils/dateHelper'
import { useConfirm } from '../../context/ConfirmModalContext'
import notify from '../../utils/toast'

export default function AdminCustomers() {
  const confirm = useConfirm()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState(null)

  // Drag-to-scroll for table on desktop/tablet
  const tableScrollRef = useRef(null)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const [isHoldingMouse, setIsHoldingMouse] = useState(false)

  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a')) return
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
    const walk = (x - startXRef.current) * 1.5
    container.scrollLeft = scrollLeftRef.current - walk
  }

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false
    setIsHoldingMouse(false)
  }

  // Fetch real customers from backend DB
  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('vastraa_admin_token')
      const API_BASE = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api'
      const q = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''

      const res = await fetch(`${API_BASE}/customers/admin/all${q}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await res.json()

      if (result.success && Array.isArray(result.data)) {
        setCustomers(result.data)
      } else {
        setCustomers([])
      }
    } catch (err) {
      console.error('Failed to fetch customers:', err)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [searchQuery])

  // Handle Block / Unblock customer
  const handleToggleCustomerStatus = async (customer, e) => {
    if (e) e.stopPropagation()
    const isCurrentlyBlocked = customer.status === 'Blocked'
    const nextStatus = isCurrentlyBlocked ? 'Active' : 'Blocked'

    const isConfirmed = await confirm({
      title: isCurrentlyBlocked ? 'Unblock Customer Account' : 'Block Customer Account',
      message: isCurrentlyBlocked
        ? `Are you sure you want to unblock ${customer.name || customer.email}? They will regain access to log in and place orders immediately.`
        : `Are you sure you want to block ${customer.name || customer.email}? They will be immediately logged out and will not be able to log in.`,
      confirmText: isCurrentlyBlocked ? 'Yes, Unblock' : 'Yes, Block Account',
      cancelText: 'Cancel',
      type: isCurrentlyBlocked ? 'info' : 'danger',
    })

    if (!isConfirmed) return

    setTogglingId(customer._id)
    try {
      const token = localStorage.getItem('vastraa_admin_token')
      const API_BASE = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api'
      const res = await fetch(`${API_BASE}/customers/admin/${customer._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      })
      const result = await res.json()

      if (result.success) {
        notify.success(
          isCurrentlyBlocked
            ? `${customer.name || customer.email} has been unblocked.`
            : `${customer.name || customer.email} has been blocked and logged out.`
        )
        setCustomers((prev) =>
          prev.map((c) => (c._id === customer._id ? { ...c, status: nextStatus } : c))
        )
        if (selectedCustomer && selectedCustomer._id === customer._id) {
          setSelectedCustomer((prev) => ({ ...prev, status: nextStatus }))
        }
      } else {
        notify.error(result.message || 'Failed to update customer status.')
      }
    } catch (err) {
      notify.error(err.message || 'Failed to update customer status.')
    } finally {
      setTogglingId(null)
    }
  }

  // Handle Delete customer
  const [deletingId, setDeletingId] = useState(null)
  const handleDeleteCustomer = async (customer, e) => {
    if (e) e.stopPropagation()

    const ok = await confirm({
      title: 'Delete Customer Account',
      message: `Are you sure you want to permanently delete the customer account for "${customer.name || customer.email}"? This action cannot be undone.`,
      confirmText: 'Delete Customer',
      confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
    })
    if (!ok) return

    setDeletingId(customer._id)
    try {
      const token = localStorage.getItem('vastraa_admin_token')
      const API_BASE = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api'
      const res = await fetch(`${API_BASE}/customers/admin/${customer._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const result = await res.json()

      if (result.success) {
        notify.success(`Customer "${customer.name || customer.email}" deleted successfully.`)
        setCustomers((prev) => prev.filter((c) => c._id !== customer._id))
        if (selectedCustomer && selectedCustomer._id === customer._id) {
          setSelectedCustomer(null)
        }
      } else {
        notify.error(result.message || 'Failed to delete customer.')
      }
    } catch (err) {
      notify.error(err.message || 'Failed to delete customer.')
    } finally {
      setDeletingId(null)
    }
  }

  // Pagination calculation
  const totalItems = customers.length
  const startIndex = (currentPage - 1) * pageSize
  const displayedCustomers = customers.slice(startIndex, startIndex + pageSize)

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1F1713] tracking-tight">
            Customers
          </h1>

        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-[#FAF7F2] border border-[#EDE4D8] text-xs font-semibold text-stone-700">
            Total Customers: <strong className="text-[#6D021B]">{totalItems}</strong>
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-4 border border-[#EDE4D8] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search by name, email, phone..."
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EDE4D8] text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-[#6D021B]"
          />
        </div>

      </div>

      {/* ─── DESKTOP & TABLET VIEW: Scrollable Responsive Table with Drag-to-Scroll ─── */}
      <div className="hidden md:block">
        <div
          ref={tableScrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`bg-white border border-[#EDE4D8] shadow-2xs overflow-x-auto select-none transition-shadow ${isHoldingMouse ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          style={{ scrollBehavior: isHoldingMouse ? 'auto' : 'smooth' }}
        >
          <table className="w-full text-left border-collapse text-xs min-w-[800px] lg:min-w-full">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#EDE4D8] text-[#73655B] uppercase font-bold tracking-wider text-[11px]">
                <th className="py-3 px-4 text-left">Customer</th>
                <th className="py-3 px-4 text-left">Email Address</th>
                <th className="py-3 px-4 text-left">Phone Number</th>
                <th className="py-3 px-4 text-left">Location</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Registered Date</th>
                <th className="py-3 px-4 text-left">Saved Addresses</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <AdminTableBody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-xs text-stone-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-stone-400" />
                    <span>Loading registered customers from database...</span>
                  </td>
                </tr>
              ) : displayedCustomers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-xs text-stone-500">
                    <Users className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p className="font-semibold text-stone-700">No registered customers found</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      When users sign in via Google or OTP, they are saved here automatically.
                    </p>
                  </td>
                </tr>
              ) : (
                displayedCustomers.map((c) => {
                  const defaultAddr = c.addresses?.find((a) => a.isDefault) || c.addresses?.[0]
                  const joinedDate = formatIndianDate(c.createdAt || Date.now())
                  const isBlocked = c.status === 'Blocked'

                  return (
                    <tr
                      key={c._id}
                      onClick={() => setSelectedCustomer(c)}
                      className={`hover:bg-amber-50/40 border-b border-stone-100 transition-colors cursor-pointer ${isBlocked ? 'bg-red-50/20' : ''
                        }`}
                    >
                      {/* Customer Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-[#FAF7F2] border ${isBlocked ? 'border-red-400 text-red-700' : 'border-[#DEA53B]/40 text-[#6D021B]'
                            } flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden`}>
                            {c.avatar ? (
                              <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                            ) : (
                              (c.name || 'C').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0 max-w-[160px] lg:max-w-xs">
                            <span className="font-bold text-xs text-stone-900 block truncate">
                              {c.name || 'Customer'}
                            </span>
                            <span className="text-[10px] text-stone-400 uppercase font-semibold">
                              {c.authProvider || 'google'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Direct Click-to-Email */}
                      <td className="py-3 px-4 text-xs">
                        {c.email ? (
                          <a
                            href={`mailto:${c.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-stone-800 hover:text-[#6D021B] hover:underline font-medium transition-colors"
                            title={`Send direct email to ${c.email}`}
                          >
                            <Mail className="w-3.5 h-3.5 text-[#6D021B] shrink-0" />
                            <span className="truncate max-w-[180px] block">{c.email}</span>
                          </a>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>

                      {/* Direct Click-to-Call */}
                      <td className="py-3 px-4 text-xs">
                        {(c.phone || defaultAddr?.phone) ? (
                          <a
                            href={`tel:${c.phone || defaultAddr?.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-stone-800 hover:text-[#6D021B] font-mono font-medium hover:underline transition-colors"
                            title={`Click to call ${c.phone || defaultAddr?.phone}`}
                          >
                            <Phone className="w-3.5 h-3.5 text-[#DEA53B] shrink-0" />
                            <span>{c.phone || defaultAddr?.phone}</span>
                          </a>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>

                      {/* Location / City */}
                      <td className="py-3 px-4 text-xs text-stone-600">
                        <span className="truncate block max-w-[140px]">
                          {defaultAddr?.city || '—'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-xs">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                            <Ban className="w-3 h-3" />
                            Blocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3 px-4 text-xs text-stone-600 font-medium whitespace-nowrap">
                        {joinedDate}
                      </td>

                      {/* Address Count */}
                      <td className="py-3 px-4 text-xs text-stone-700 font-semibold whitespace-nowrap">
                        {c.addresses?.length || 0} saved
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Block / Unblock Button */}
                          <button
                            type="button"
                            disabled={togglingId === c._id}
                            onClick={(e) => handleToggleCustomerStatus(c, e)}
                            className={`px-2.5 py-1.5 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors border ${isBlocked
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                                : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                              }`}
                            title={isBlocked ? 'Click to Unblock Customer' : 'Click to Block Customer & Force Logout'}
                          >
                            {isBlocked ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Unblock</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-3.5 h-3.5" />
                                <span>Block</span>
                              </>
                            )}
                          </button>

                          {/* Details Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(c)}
                            className="px-2.5 py-1.5 bg-[#6D021B] hover:bg-[#850320] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          {/* Delete Customer Button */}
                          <button
                            type="button"
                            disabled={deletingId === c._id}
                            onClick={(e) => handleDeleteCustomer(c, e)}
                            className="p-1.5 bg-stone-50 hover:bg-red-50 text-stone-400 hover:text-red-700 border border-stone-200 hover:border-red-300 transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete Customer Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* ─── MOBILE VIEW: Responsive Stacked Cards (Below 768px) ─── */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="bg-white p-8 border border-[#EDE4D8] text-center text-xs text-stone-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-stone-400" />
            <span>Loading customers...</span>
          </div>
        ) : displayedCustomers.length === 0 ? (
          <div className="bg-white p-8 border border-[#EDE4D8] text-center text-xs text-stone-500">
            <Users className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="font-semibold text-stone-700">No registered customers found</p>
          </div>
        ) : (
          displayedCustomers.map((c) => {
            const defaultAddr = c.addresses?.find((a) => a.isDefault) || c.addresses?.[0]
            const joinedDate = formatIndianDate(c.createdAt || Date.now())
            const isBlocked = c.status === 'Blocked'

            return (
              <div
                key={c._id}
                onClick={() => setSelectedCustomer(c)}
                className={`bg-white border p-3.5 shadow-2xs space-y-3 cursor-pointer transition-colors ${isBlocked ? 'border-red-300 bg-red-50/20' : 'border-[#EDE4D8] hover:border-[#6D021B]'
                  }`}
              >
                {/* Header: Avatar, Name & Status Badge */}
                <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-10 h-10 rounded-full bg-[#FAF7F2] border ${isBlocked ? 'border-red-400 text-red-700' : 'border-[#DEA53B]/50 text-[#6D021B]'
                      } flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden`}>
                      {c.avatar ? (
                        <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        (c.name || 'C').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-stone-900 truncate">
                        {c.name || 'Customer'}
                      </h4>
                      {c.email ? (
                        <a
                          href={`mailto:${c.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-[#6D021B] hover:underline truncate block"
                          title={`Email ${c.email}`}
                        >
                          {c.email}
                        </a>
                      ) : (
                        <p className="text-[11px] text-stone-500 truncate">No email</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {isBlocked ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold bg-red-100 text-red-700 border border-red-200">
                        <Ban className="w-2.5 h-2.5" /> Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle className="w-2.5 h-2.5" /> Active
                      </span>
                    )}
                    <span className="text-[9px] text-stone-400 uppercase font-semibold">
                      {c.authProvider || 'google'}
                    </span>
                  </div>
                </div>

                {/* Details Strip */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#FAF7F2] p-2.5 border border-[#EDE4D8]">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Contact</span>
                    {(c.phone || defaultAddr?.phone) ? (
                      <a
                        href={`tel:${c.phone || defaultAddr?.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono text-[#6D021B] font-semibold hover:underline block truncate"
                        title={`Call ${c.phone || defaultAddr?.phone}`}
                      >
                        {c.phone || defaultAddr?.phone}
                      </a>
                    ) : (
                      <span className="font-mono text-stone-500 font-medium block truncate">
                        Not provided
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Location</span>
                    <span className="text-stone-700 block truncate">
                      {defaultAddr?.city || 'No address yet'}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Joined</span>
                    <span className="text-stone-700 block">{joinedDate}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Addresses</span>
                    <span className="text-stone-900 font-bold block">{c.addresses?.length || 0} saved</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-1 gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={togglingId === c._id}
                    onClick={(e) => handleToggleCustomerStatus(c, e)}
                    className={`px-3 py-1 text-[11px] font-bold flex items-center gap-1 border transition-colors ${isBlocked
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                        : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                      }`}
                  >
                    {isBlocked ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>Unblock</span>
                      </>
                    ) : (
                      <>
                        <Ban className="w-3 h-3" />
                        <span>Block</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(c)}
                      className="px-3 py-1 bg-[#6D021B] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Profile</span>
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === c._id}
                      onClick={(e) => handleDeleteCustomer(c, e)}
                      className="p-1 bg-stone-50 hover:bg-red-50 text-stone-400 hover:text-red-700 border border-stone-200 cursor-pointer disabled:opacity-50"
                      title="Delete Customer Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      <AdminPagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={(p) => setCurrentPage(p)}
        onPageSizeChange={(sz) => {
          setPageSize(sz)
          setCurrentPage(1)
        }}
      />

      {/* ─── CUSTOMER DETAILS MODAL (Fully Responsive with max-h and smooth scroll) ─── */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg shadow-2xl border border-[#EDE4D8] overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#FAF7F2] border-b border-[#EDE4D8] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#1F1713]">
                  Customer Profile
                </h3>
                {selectedCustomer.status === 'Blocked' ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                    Blocked
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Active
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-5 text-xs overflow-y-auto flex-1">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#FAF7F2] border-2 ${selectedCustomer.status === 'Blocked' ? 'border-red-400 text-red-700' : 'border-[#DEA53B] text-[#6D021B]'
                  } flex items-center justify-center font-bold text-base sm:text-lg overflow-hidden shrink-0`}>
                  {selectedCustomer.avatar ? (
                    <img src={selectedCustomer.avatar} alt={selectedCustomer.name} className="w-full h-full object-cover" />
                  ) : (
                    (selectedCustomer.name || 'C').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm sm:text-base text-stone-900 truncate">
                    {selectedCustomer.name || 'Customer'}
                  </h4>
                  {selectedCustomer.email ? (
                    <a
                      href={`mailto:${selectedCustomer.email}`}
                      className="text-stone-600 hover:text-[#6D021B] hover:underline truncate flex items-center gap-1.5 mt-1 transition-colors"
                      title={`Send email to ${selectedCustomer.email}`}
                    >
                      <Mail className="w-3.5 h-3.5 text-[#6D021B] shrink-0" />
                      <span>{selectedCustomer.email}</span>
                    </a>
                  ) : (
                    <p className="text-stone-400 truncate flex items-center gap-1.5 mt-1">
                      <Mail className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                      <span>Email not registered</span>
                    </p>
                  )}

                  {selectedCustomer.phone ? (
                    <a
                      href={`tel:${selectedCustomer.phone}`}
                      className="text-stone-800 hover:text-[#6D021B] hover:underline font-mono flex items-center gap-1.5 mt-1 transition-colors font-medium"
                      title={`Call ${selectedCustomer.phone}`}
                    >
                      <Phone className="w-3.5 h-3.5 text-[#DEA53B] shrink-0" />
                      <span>{selectedCustomer.phone}</span>
                    </a>
                  ) : (
                    <p className="text-stone-400 font-mono flex items-center gap-1.5 mt-1">
                      <Phone className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                      <span>Phone not added</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Account Meta */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#FAF7F2] border border-[#EDE4D8] text-[11px]">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Authentication</span>
                  <span className="font-semibold text-stone-800 uppercase">{selectedCustomer.authProvider || 'google'}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Member Since</span>
                  <span className="font-semibold text-stone-800">{formatIndianDate(selectedCustomer.createdAt || Date.now())}</span>
                </div>
              </div>

              {/* Saved Addresses List */}
              <div className="space-y-2 pt-2 border-t border-[#EDE4D8]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800 uppercase text-[10px] block">
                    Saved Delivery Addresses ({selectedCustomer.addresses?.length || 0})
                  </span>
                </div>

                {(!selectedCustomer.addresses || selectedCustomer.addresses.length === 0) ? (
                  <div className="p-4 bg-stone-50 border border-stone-200 text-center text-stone-400 text-[11px]">
                    <MapPin className="w-5 h-5 mx-auto mb-1 text-stone-300" />
                    No delivery addresses saved yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {selectedCustomer.addresses.map((addr, idx) => (
                      <div key={idx} className="p-3 bg-[#FAF7F2] border border-[#EDE4D8] text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-stone-900">{addr.name} ({addr.type || 'Home'})</span>
                          {addr.isDefault && (
                            <span className="px-1.5 py-0.2 bg-[#6D021B] text-white text-[9px] font-bold uppercase">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-stone-600 leading-relaxed">{addr.street}</p>
                        <p className="text-stone-600 font-medium">{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-stone-500 font-mono text-[11px] mt-1 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{addr.phone}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 bg-[#FAF7F2] border-t border-[#EDE4D8] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={togglingId === selectedCustomer._id}
                  onClick={() => handleToggleCustomerStatus(selectedCustomer)}
                  className={`px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 border transition-colors cursor-pointer ${selectedCustomer.status === 'Blocked'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                      : 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                    }`}
                >
                  {selectedCustomer.status === 'Blocked' ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Unblock Account</span>
                    </>
                  ) : (
                    <>
                      <Ban className="w-3.5 h-3.5" />
                      <span>Block & Log Out</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={deletingId === selectedCustomer._id}
                  onClick={() => handleDeleteCustomer(selectedCustomer)}
                  className="px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 bg-stone-100 hover:bg-red-50 text-red-700 border border-red-300 transition-colors cursor-pointer disabled:opacity-50"
                  title="Permanently delete this customer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Customer</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
