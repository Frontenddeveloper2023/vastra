import { useState, useEffect } from 'react'
import {
  Search,
  Mail,
  Phone,
  ShoppingBag,
  Eye,
  Calendar,
  X,
  MapPin,
  RefreshCw,
  Users,
} from 'lucide-react'
import {
  AdminTableContainer,
  AdminTableHead,
  AdminTableBody,
  AdminPagination,
} from '../../components/admin/AdminUI'
import { formatIndianDate } from '../../utils/dateHelper'

export default function AdminCustomers() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(8)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch real customers from backend DB
  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('vastraa_admin_token')
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
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

  // Pagination calculation
  const totalItems = customers.length
  const startIndex = (currentPage - 1) * pageSize
  const displayedCustomers = customers.slice(startIndex, startIndex + pageSize)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real registered patrons authenticated via Google and Email OTP.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCustomers}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-xs cursor-pointer self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search by customer name, email, phone..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:bg-white focus:outline-none focus:border-stone-400"
          />
        </div>
        <span className="text-xs text-stone-500 font-medium">
          Total Patrons: <strong className="text-stone-900">{totalItems}</strong>
        </span>
      </div>

      {/* Customers Table */}
      <AdminTableContainer>
        <AdminTableHead>
          <tr>
            <th className="py-3 px-4 text-left text-[11px] font-bold uppercase tracking-wider text-stone-600">
              Customer Profile
            </th>
            <th className="py-3 px-4 text-left text-[11px] font-bold uppercase tracking-wider text-stone-600">
              Contact
            </th>
            <th className="py-3 px-4 text-left text-[11px] font-bold uppercase tracking-wider text-stone-600">
              Auth Method
            </th>
            <th className="py-3 px-4 text-left text-[11px] font-bold uppercase tracking-wider text-stone-600">
              Registered Date
            </th>
            <th className="py-3 px-4 text-left text-[11px] font-bold uppercase tracking-wider text-stone-600">
              Saved Addresses
            </th>
            <th className="py-3 px-4 text-right text-[11px] font-bold uppercase tracking-wider text-stone-600">
              Action
            </th>
          </tr>
        </AdminTableHead>

        <AdminTableBody>
          {loading ? (
            <tr>
              <td colSpan="6" className="py-12 text-center text-xs text-stone-500">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-stone-400" />
                <span>Loading registered customers from database...</span>
              </td>
            </tr>
          ) : displayedCustomers.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-12 text-center text-xs text-stone-500">
                <Users className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="font-semibold text-stone-700">No registered customers found</p>
                <p className="text-[11px] text-stone-400 mt-0.5">When users sign in via Google or OTP, they are saved here automatically.</p>
              </td>
            </tr>
          ) : (
            displayedCustomers.map((c) => {
              const defaultAddr = c.addresses?.find((a) => a.isDefault) || c.addresses?.[0]
              const joinedDate = formatIndianDate(c.createdAt || Date.now())

              return (
                <tr key={c._id} className="hover:bg-stone-50/70 border-b border-stone-100 transition-colors">
                  {/* Name & Avatar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#DEA53B]/40 flex items-center justify-center text-[#6D021B] font-bold text-xs shrink-0 overflow-hidden">
                        {c.avatar ? (
                          <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          (c.name || 'C').charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-stone-900 block truncate">
                          {c.name || 'Customer'}
                        </span>
                        <span className="text-[11px] text-stone-500 truncate block">
                          {c.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3.5 px-4 text-xs">
                    <span className="text-stone-900 block font-mono">{c.phone || defaultAddr?.phone || 'Not provided'}</span>
                    <span className="text-stone-400 text-[11px] block">{defaultAddr?.city || 'No city registered'}</span>
                  </td>

                  {/* Auth Provider */}
                  <td className="py-3.5 px-4 text-xs">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-stone-100 text-stone-700 uppercase">
                      {c.authProvider || 'google'}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="py-3.5 px-4 text-xs text-stone-600 font-medium">
                    {joinedDate}
                  </td>

                  {/* Address Count */}
                  <td className="py-3.5 px-4 text-xs text-stone-700 font-semibold">
                    {c.addresses?.length || 0} saved
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(c)}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              )
            })
          )}
        </AdminTableBody>
      </AdminTableContainer>

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

      {/* ─── CUSTOMER DETAILS MODAL ─── */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Customer Profile
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#FAF7F2] border-2 border-[#DEA53B] flex items-center justify-center text-[#6D021B] font-bold text-lg overflow-hidden shrink-0">
                  {selectedCustomer.avatar ? (
                    <img src={selectedCustomer.avatar} alt={selectedCustomer.name} className="w-full h-full object-cover" />
                  ) : (
                    (selectedCustomer.name || 'C').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-base text-stone-900">{selectedCustomer.name || 'Customer'}</h4>
                  <p className="text-stone-500">{selectedCustomer.email}</p>
                  <p className="text-stone-400 font-mono mt-0.5">{selectedCustomer.phone || 'Phone not added'}</p>
                </div>
              </div>

              {/* Saved Addresses List */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <span className="font-bold text-stone-800 uppercase text-[10px] block">
                  Saved Delivery Addresses ({selectedCustomer.addresses?.length || 0})
                </span>
                {(!selectedCustomer.addresses || selectedCustomer.addresses.length === 0) ? (
                  <p className="text-stone-400 text-[11px]">No addresses saved yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedCustomer.addresses.map((addr, idx) => (
                      <div key={idx} className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-stone-800">{addr.name} ({addr.type})</span>
                          {addr.isDefault && (
                            <span className="px-1.5 py-0.2 bg-[#6D021B] text-white rounded text-[9px] font-bold uppercase">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-stone-600">{addr.street}</p>
                        <p className="text-stone-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-stone-500 font-mono text-[11px] mt-0.5">Phone: {addr.phone}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
