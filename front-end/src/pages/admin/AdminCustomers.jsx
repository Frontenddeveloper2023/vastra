import { useState } from 'react'
import {
  Search,
  Mail,
  Phone,
  ShoppingBag,
  Eye,
  Calendar,
  UserCheck,
  UserX,
  X,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Clock,
  PackageCheck
} from 'lucide-react'
import {
  AdminTableContainer,
  AdminTableHead,
  AdminTableBody,
  AdminPagination,
} from '../../components/admin/AdminUI'

export default function AdminCustomers() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const CUSTOMERS_PER_PAGE = 8

  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 98401 23456',
      city: 'Chennai',
      state: 'Tamil Nadu',
      address: 'Plot 42, Green Avenue, Anna Nagar',
      pincode: '600040',
      ordersCount: 4,
      totalSpent: '₹34,890',
      joinedDate: '15 Aug 2026',
      status: 'Active',
      recentOrders: [
        { id: 'ORD-9821', date: '28 Oct 2026', amount: '₹12,499', status: 'Delivered', items: 'Banarasi Pure Katan Saree' },
        { id: 'ORD-8930', date: '12 Sep 2026', amount: '₹9,890', status: 'Delivered', items: 'Kanjivaram Silk Temple Border' },
      ],
    },
    {
      id: 2,
      name: 'Ananya Deshmukh',
      email: 'ananya.d@example.com',
      phone: '+91 97890 54321',
      city: 'Mumbai',
      state: 'Maharashtra',
      address: 'Flat 12B, Sea Crest Towers, Bandra West',
      pincode: '400050',
      ordersCount: 3,
      totalSpent: '₹22,497',
      joinedDate: '02 Sep 2026',
      status: 'Active',
      recentOrders: [
        { id: 'ORD-7612', date: '14 Oct 2026', amount: '₹7,899', status: 'Delivered', items: 'Raktambari Crimson Saree' },
      ],
    },
    {
      id: 3,
      name: 'Kavita Sundaram',
      email: 'kavita.s@example.com',
      phone: '+91 98123 45678',
      city: 'Bangalore',
      state: 'Karnataka',
      address: 'Villa 7, Palm Meadows, Whitefield',
      pincode: '560066',
      ordersCount: 2,
      totalSpent: '₹16,598',
      joinedDate: '10 Sep 2026',
      status: 'Blocked',
      recentOrders: [
        { id: 'ORD-6211', date: '20 Sep 2026', amount: '₹8,299', status: 'Cancelled', items: 'Organza Tissue Embroidered' },
      ],
    },
    {
      id: 4,
      name: 'Meera Iyer',
      email: 'meera.iyer@example.com',
      phone: '+91 99400 11223',
      city: 'Chennai',
      state: 'Tamil Nadu',
      address: '24/1, Besant Avenue Road, Adyar',
      pincode: '600020',
      ordersCount: 5,
      totalSpent: '₹41,295',
      joinedDate: '24 Jul 2026',
      status: 'Active',
      recentOrders: [
        { id: 'ORD-9912', date: '01 Nov 2026', amount: '₹14,999', status: 'Shipped', items: 'Bridal Heritage Saree' },
      ],
    },
    {
      id: 5,
      name: 'Deepa Varma',
      email: 'deepa.v@example.com',
      phone: '+91 94440 99887',
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Road No 36, Jubilee Hills',
      pincode: '500033',
      ordersCount: 1,
      totalSpent: '₹7,499',
      joinedDate: '18 Oct 2026',
      status: 'Active',
      recentOrders: [
        { id: 'ORD-5541', date: '19 Oct 2026', amount: '₹7,499', status: 'Delivered', items: 'Maroon Zari Katan Saree' },
      ],
    },
    {
      id: 6,
      name: 'Pooja Reddy',
      email: 'pooja.reddy@example.com',
      phone: '+91 98450 33445',
      city: 'Hyderabad',
      state: 'Telangana',
      address: 'Banjara Hills, Road No 12',
      pincode: '500034',
      ordersCount: 2,
      totalSpent: '₹14,890',
      joinedDate: '05 Sep 2026',
      status: 'Active',
      recentOrders: [
        { id: 'ORD-4410', date: '22 Oct 2026', amount: '₹4,899', status: 'Delivered', items: 'Chanderi Gold Foil Zari Saree' },
      ],
    },
    {
      id: 7,
      name: 'Sneha Patel',
      email: 'sneha.patel@example.com',
      phone: '+91 98250 67890',
      city: 'Ahmedabad',
      state: 'Gujarat',
      address: 'Satellite Road, Near Iscon Cross Road',
      pincode: '380015',
      ordersCount: 3,
      totalSpent: '₹19,250',
      joinedDate: '11 Aug 2026',
      status: 'Active',
      recentOrders: [
        { id: 'ORD-3321', date: '26 Oct 2026', amount: '₹3,999', status: 'Delivered', items: 'Pastel Lavender Chiffon Drape' },
      ],
    },
    {
      id: 8,
      name: 'Gayatri Nair',
      email: 'gayatri.nair@example.com',
      phone: '+91 94470 12345',
      city: 'Kochi',
      state: 'Kerala',
      address: 'Marine Drive Waterfront Residence',
      pincode: '682031',
      ordersCount: 2,
      totalSpent: '₹15,490',
      joinedDate: '01 Oct 2026',
      status: 'Active',
      recentOrders: [
        { id: 'ORD-2104', date: '03 Nov 2026', amount: '₹6,199', status: 'Delivered', items: 'Temple Border Festive Kanjivaram' },
      ],
    },
    {
      id: 9,
      name: 'Ritu Sen',
      email: 'ritu.sen@example.com',
      phone: '+91 98300 98765',
      city: 'Kolkata',
      state: 'West Bengal',
      address: 'Salt Lake City, Sector 2',
      pincode: '700091',
      ordersCount: 4,
      totalSpent: '₹31,450',
      joinedDate: '14 Jul 2026',
      status: 'Active',
      recentOrders: [
        { id: 'ORD-1902', date: '15 Oct 2026', amount: '₹8,999', status: 'Delivered', items: 'Shikargah Heritage Saree' },
      ],
    },
    {
      id: 10,
      name: 'Aishwarya Rao',
      email: 'aishwarya.rao@example.com',
      phone: '+91 98860 55443',
      city: 'Bangalore',
      state: 'Karnataka',
      address: 'Indiranagar 100ft Road',
      pincode: '560038',
      ordersCount: 3,
      totalSpent: '₹24,800',
      joinedDate: '29 Aug 2026',
      status: 'Active',
      recentOrders: [
        { id: 'ORD-1765', date: '21 Sep 2026', amount: '₹7,899', status: 'Delivered', items: 'Maroon Royal Katan Saree' },
      ],
    },
  ])

  const toggleCustomerBlock = (customerId, e) => {
    if (e) e.stopPropagation()
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newStatus = c.status === 'Blocked' ? 'Active' : 'Blocked'
          return { ...c, status: newStatus }
        }
        return c
      })
    )

    // Sync selected customer modal state if open
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer((prev) => ({
        ...prev,
        status: prev.status === 'Blocked' ? 'Active' : 'Blocked',
      }))
    }
  }

  const filtered = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim()
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.city.toLowerCase().includes(q)
    )
  })

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / CUSTOMERS_PER_PAGE) || 1
  const paginatedCustomers = filtered.slice(
    (currentPage - 1) * CUSTOMERS_PER_PAGE,
    currentPage * CUSTOMERS_PER_PAGE
  )

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  return (
    <div className="space-y-6">
      {/* ─── Page Title ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-normal text-2xl sm:text-3xl font-bold text-[#1F1713]">
            Customers
          </h1>
          <p className="text-xs sm:text-sm text-[#73655B] mt-0.5">
            Click on any customer to view full profile details and manage block/unblock access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-stone-600 bg-white border border-[#EDE4D8] px-3.5 py-2 rounded-none-xl">
            Active: <strong className="text-emerald-700">{customers.filter((c) => c.status !== 'Blocked').length}</strong>
          </div>
          <div className="text-xs text-stone-600 bg-white border border-[#EDE4D8] px-3.5 py-2 rounded-none-xl">
            Blocked: <strong className="text-red-700">{customers.filter((c) => c.status === 'Blocked').length}</strong>
          </div>
        </div>
      </div>

      {/* ─── Search Bar ─── */}
      <div className="bg-white border border-[#EDE4D8] rounded-none-2xl p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search by name, email, phone or city..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#EDE4D8] rounded-none focus:outline-none focus:border-[#6D021B] text-stone-800"
          />
        </div>
      </div>

      {/* ─── Customer Table ─── */}
      <div className="bg-white border border-[#EDE4D8] rounded-none-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#EDE4D8] text-[#73655B] uppercase font-bold tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Orders Placed</th>
                <th className="py-3.5 px-4">Total Spent</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE4D8]/60">
              {paginatedCustomers.map((c) => {
                const isBlocked = c.status === 'Blocked'

                return (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-[#FFFDF9] transition-colors cursor-pointer group"
                  >
                    {/* Name with Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-none-full border flex items-center justify-center font-bold shrink-0 transition-colors ${isBlocked
                              ? 'bg-red-50 border-red-200 text-red-600'
                              : 'bg-[#FAF7F2] border-[#EDE4D8] text-[#6D021B]'
                            }`}
                        >
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#1F1713] group-hover:text-[#6D021B] transition-colors">
                            {c.name}
                          </p>
                          <p className="text-[11px] text-stone-400">Joined {c.joinedDate}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-3.5 px-4">
                      <p className="text-stone-800 font-medium">{c.email}</p>
                      <p className="text-[11px] text-stone-500">{c.phone}</p>
                    </td>

                    {/* City */}
                    <td className="py-3.5 px-4 text-stone-700 font-medium">
                      {c.city}
                    </td>

                    {/* Orders */}
                    <td className="py-3.5 px-4 font-semibold text-stone-800">
                      {c.ordersCount} orders
                    </td>

                    {/* Spent */}
                    <td className="py-3.5 px-4 font-bold font-sans text-[#6D021B]">
                      {c.totalSpent}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-none-full text-[10px] font-bold border ${isBlocked
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                      >
                        {isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>

                    {/* Actions: View Details & Block/Unblock */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(c)}
                          className="px-2.5 py-1.5 rounded-none-lg border border-[#EDE4D8] text-xs font-semibold text-stone-700 hover:text-[#6D021B] hover:bg-stone-50 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#DEA53B]" />
                          <span>View</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => toggleCustomerBlock(c.id, e)}
                          className={`px-2.5 py-1.5 rounded-none-lg border text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${isBlocked
                              ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-white'
                              : 'border-red-200 text-red-600 hover:bg-red-50 bg-white'
                            }`}
                        >
                          {isBlocked ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Unblock</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                              <span>Block</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination Controls ─── */}
        <AdminPagination
          currentPage={currentPage}
          totalCount={filtered.length}
          pageSize={CUSTOMERS_PER_PAGE}
          onPageChange={handlePageChange}
          itemName="customers"
        />
      </div>

      {/* ─── Customer Details Modal ─── */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-none-2xl border border-[#EDE4D8] w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EDE4D8] flex items-center justify-between bg-[#FAF7F2]">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-none-full border flex items-center justify-center font-bold text-sm shrink-0 ${selectedCustomer.status === 'Blocked'
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'bg-[#6D021B]/10 border-[#6D021B]/20 text-[#6D021B]'
                    }`}
                >
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-normal text-base font-bold text-[#1F1713]">
                    {selectedCustomer.name}
                  </h2>
                  <p className="text-[11px] text-stone-500">
                    Customer Joined Date {selectedCustomer.joinedDate}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-none-lg hover:bg-stone-200/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Status Alert Banner */}
              <div
                className={`p-3 rounded-none-xl border flex items-center justify-between ${selectedCustomer.status === 'Blocked'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
              >
                <div className="flex items-center gap-2">
                  {selectedCustomer.status === 'Blocked' ? (
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  )}
                  <span className="font-bold">
                    Account Status: {selectedCustomer.status === 'Blocked' ? 'Suspended / Blocked' : 'Active Account'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => toggleCustomerBlock(selectedCustomer.id, e)}
                  className={`px-3 py-1 rounded-none-lg text-xs font-bold border transition-colors cursor-pointer ${selectedCustomer.status === 'Blocked'
                      ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                      : 'bg-red-600 text-white border-red-700 hover:bg-red-700'
                    }`}
                >
                  {selectedCustomer.status === 'Blocked' ? 'Unblock Customer' : 'Block Customer'}
                </button>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <h3 className="font-normal text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Contact Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none-xl flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#DEA53B] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-stone-400 font-semibold uppercase">Email Address</p>
                      <p className="font-bold text-stone-800 truncate">{selectedCustomer.email}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none-xl flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#DEA53B] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-stone-400 font-semibold uppercase">Phone Number</p>
                      <p className="font-bold text-stone-800">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-2">
                <h3 className="font-normal text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Shipping Address
                </h3>
                <div className="p-3 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none-xl flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#DEA53B] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-stone-800">{selectedCustomer.address}</p>
                    <p className="text-stone-600 mt-0.5">
                      {selectedCustomer.city}, {selectedCustomer.state} - {selectedCustomer.pincode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Statistics */}
              <div className="space-y-2">
                <h3 className="font-normal text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Purchase Summary
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-[#EDE4D8] rounded-none-xl">
                    <p className="text-[10px] text-stone-400 font-bold uppercase">Total Orders</p>
                    <p className="text-lg font-bold text-stone-800 mt-0.5">{selectedCustomer.ordersCount}</p>
                  </div>
                  <div className="p-3 bg-white border border-[#EDE4D8] rounded-none-xl">
                    <p className="text-[10px] text-stone-400 font-bold uppercase">Total Amount Spent</p>
                    <p className="text-lg font-bold font-sans text-[#6D021B] mt-0.5">{selectedCustomer.totalSpent}</p>
                  </div>
                </div>
              </div>

              {/* Recent Orders List */}
              {selectedCustomer.recentOrders && selectedCustomer.recentOrders.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-normal text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Recent Orders
                  </h3>
                  <div className="space-y-2">
                    {selectedCustomer.recentOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 border border-[#EDE4D8] rounded-none-xl bg-white flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-800">{ord.id}</span>
                            <span className="text-[10px] text-stone-400">• {ord.date}</span>
                          </div>
                          <p className="text-[11px] text-stone-600 mt-0.5">{ord.items}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-bold font-sans text-[#6D021B]">{ord.amount}</p>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-none-full border border-emerald-200">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>


          </div>
        </div>
      )}
    </div>
  )
}

