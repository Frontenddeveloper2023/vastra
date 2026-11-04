import { useState } from 'react'
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
  Layers,
} from 'lucide-react'
import { ordersData } from '../../data/ordersData'
import Toast from '../../components/Toast'
import {
  AdminTableContainer,
  AdminTableHead,
  AdminTableBody,
  AdminPagination,
} from '../../components/admin/AdminUI'

// Flatten orders so EACH product item becomes an individual order record for inspection
const prepareIndividualProductOrders = () => {
  const records = []

  // 1. Process ordersData
  ordersData.forEach((order) => {
    const cust = order.shippingAddress
      ? {
          name: order.shippingAddress.name || 'Zubair Ahmed',
          email: 'zubair.ahmed@example.com',
          phone: order.shippingAddress.phone || '+91 98765 43210',
          address: `${order.shippingAddress.street || ''} ${order.shippingAddress.cityState || ''}`,
        }
      : {
          name: 'Priya Sharma',
          email: 'priya.sharma@example.com',
          phone: '+91 98401 23456',
          address: 'Villa 14, Royal Palm Meadows, Anna Nagar, Chennai - 600040',
        }

    const payMode = order.paymentMethod
      ? `${order.paymentMethod} • ${order.paymentStatus || 'Paid'}`
      : 'Online Prepaid (Razorpay / UPI)'

    const rawItems = order.items && order.items.length > 0 ? order.items : [
      {
        id: 1,
        title: 'Maroon Zari Katan Banarasi Saree',
        qty: 1,
        price: order.totalAmount || 8499,
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
      }
    ]

    rawItems.forEach((it, index) => {
      records.push({
        recordId: `${order.id}-${it.id || index + 1}`,
        orderId: order.id,
        orderDate: order.date || '02 Nov 2026',
        orderTime: index === 0 ? '11:42 AM' : index === 1 ? '03:15 PM' : '06:20 PM',
        paymentMethod: payMode,
        customer: cust,
        product: {
          id: it.id || index + 1,
          title: it.title || 'Pure Handloom Silk Saree',
          quantity: it.qty || it.quantity || 1,
          price: it.price || 6499,
          color: it.color || 'Royal Classic',
          image: it.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
        },
        status: order.status || 'Processing',
      })
    })
  })

  // 2. Add extra realistic sample items for admin review
  records.push(
    {
      recordId: 'ORD-3115-225118-1',
      orderId: 'ORD-3115-225118',
      orderDate: '02 Nov 2026',
      orderTime: '10:15 AM',
      paymentMethod: 'Razorpay UPI (Paid)',
      customer: {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        phone: '+91 98401 23456',
        address: 'Villa 14, Royal Palm Meadows, Anna Nagar, Chennai - 600040',
      },
      product: {
        id: 901,
        title: 'Crimson Bridal Kanjivaram Silk Saree',
        quantity: 1,
        price: 8999,
        color: 'Crimson Red',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=80',
      },
      status: 'Shipped',
    },
    {
      recordId: 'ORD-2980-114092-1',
      orderId: 'ORD-2980-114092',
      orderDate: '01 Nov 2026',
      orderTime: '02:40 PM',
      paymentMethod: 'Cash on Delivery',
      customer: {
        name: 'Ananya Deshmukh',
        email: 'ananya.d@example.com',
        phone: '+91 97890 54321',
        address: '42, Heritage Enclave, T. Nagar, Chennai - 600017',
      },
      product: {
        id: 902,
        title: 'Royal Indigo Kanjivaram Saree',
        quantity: 1,
        price: 7499,
        color: 'Indigo Blue',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
      },
      status: 'Delivered',
    },
    {
      recordId: 'ORD-5412-882103-1',
      orderId: 'ORD-5412-882103',
      orderDate: '03 Nov 2026',
      orderTime: '09:25 AM',
      paymentMethod: 'Net Banking (HDFC Bank)',
      customer: {
        name: 'Meera Iyer',
        email: 'meera.iyer@example.com',
        phone: '+91 98412 87654',
        address: 'Flat 3B, Temple View Apartments, Mylapore, Chennai - 600004',
      },
      product: {
        id: 903,
        title: 'Sunset Gold Pure Organza Saree',
        quantity: 1,
        price: 9499,
        color: 'Sunset Gold',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
      },
      status: 'Processing',
    }
  )

  return records
}

export default function AdminOrders() {
  const [orders, setOrders] = useState(prepareIndividualProductOrders)
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const ORDERS_PER_PAGE = 8

  const statusList = ['All', 'Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
  const orderStatusOptions = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

  const filteredOrders = orders.filter((o) => {
    const matchStatus =
      selectedStatus === 'All' || o.status.toLowerCase() === selectedStatus.toLowerCase()
    const query = searchQuery.trim().toLowerCase()
    const matchSearch =
      !query ||
      o.orderId.toLowerCase().includes(query) ||
      o.recordId.toLowerCase().includes(query) ||
      o.product.title.toLowerCase().includes(query) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(query)) ||
      (o.customer?.email && o.customer.email.toLowerCase().includes(query)) ||
      (o.customer?.phone && o.customer.phone.includes(query))
    return matchStatus && matchSearch
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE) || 1
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  )

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'processing':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200'
    }
  }

  // Admin updates order status
  const updateOrderStatus = (orderRecord, newStatus) => {
    const updated = { ...orderRecord, status: newStatus }

    setOrders((prev) =>
      prev.map((o) => (o.recordId === orderRecord.recordId ? updated : o))
    )

    if (selectedOrder && selectedOrder.recordId === orderRecord.recordId) {
      setSelectedOrder(updated)
    }

    setToastMessage(`Order status changed to "${newStatus}"`)
    setTimeout(() => setToastMessage(''), 2500)
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      {/* ─── Page Title ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-normal text-2xl sm:text-3xl font-bold text-[#1F1713]">
            Customer Orders
          </h1>
          <p className="text-xs text-[#73655B] mt-1">
            Click on any order to view customer details, order date/time, and payment method, then update order fulfillment status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-stone-600 bg-white border border-[#EDE4D8] px-3.5 py-2 rounded-none">
            Total Orders: <strong className="text-[#6D021B]">{orders.length}</strong>
          </div>
        </div>
      </div>

      {/* ─── Filter & Search Bar ─── */}
      <div className="bg-white border border-[#EDE4D8] rounded-none p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search by Order ID, customer, product..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#EDE4D8] rounded-none focus:outline-none focus:border-[#6D021B] text-stone-800"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {statusList.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setSelectedStatus(st)
                setCurrentPage(1)
              }}
              className={`px-3 py-1.5 rounded-none text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === st
                  ? 'bg-[#6D021B] text-white shadow-2xs'
                  : 'bg-[#FAF7F2] text-stone-600 hover:text-stone-900 border border-[#EDE4D8]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Orders Table ─── */}
      <div className="bg-white border border-[#EDE4D8] rounded-none shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#EDE4D8] text-[#73655B] uppercase font-bold tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Order ID & Date Time</th>
                <th className="py-3.5 px-4">Product Saree</th>
                <th className="py-3.5 px-4">Customer Details</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Order Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE4D8]/60">
              {paginatedOrders.map((order) => (
                <tr
                  key={order.recordId}
                  onClick={() => setSelectedOrder(order)}
                  className="hover:bg-[#FFFDF9] transition-colors cursor-pointer group"
                >
                  {/* Order ID & Date Time */}
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#1F1713]">{order.orderId}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {order.orderDate} • <span className="text-stone-400">{order.orderTime}</span>
                    </p>
                  </td>

                  {/* Single Product Details */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={order.product.image}
                        alt={order.product.title}
                        className="w-11 h-13 object-cover border border-[#EDE4D8] rounded-none shrink-0"
                      />
                      <div>
                        <p className="font-bold text-stone-900 line-clamp-1">{order.product.title}</p>
                        <p className="text-[11px] text-stone-500">
                          Qty: <strong>{order.product.quantity}</strong> • {order.product.color}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-stone-800">{order.customer?.name || 'Customer'}</p>
                    <p className="text-[11px] text-stone-500">{order.customer?.phone}</p>
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 px-4 text-stone-700 font-medium">
                    <span className="inline-block px-2 py-0.5 bg-stone-50 border border-stone-200 text-stone-700 text-[10px] font-semibold">
                      {order.paymentMethod}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 px-4 font-bold font-sans text-[#1F1713]">
                    ₹{order.product.price.toLocaleString('en-IN')}
                  </td>

                  {/* Order Status Dropdown */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order, e.target.value)}
                      className={`px-2.5 py-1 text-[11px] font-bold border rounded-none focus:outline-none focus:border-[#6D021B] cursor-pointer ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : order.status === 'Shipped'
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : order.status === 'Cancelled'
                          ? 'bg-red-50 text-red-800 border-red-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      {orderStatusOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Action: Inspect */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#6D021B] hover:text-white border border-[#EDE4D8] rounded-none font-semibold text-[#6D021B] transition-colors cursor-pointer text-xs"
                    >
                      View Order
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-stone-500">
                    <p className="font-semibold text-sm">No orders match your search or filter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination Controls ─── */}
        <AdminPagination
          currentPage={currentPage}
          totalCount={filteredOrders.length}
          pageSize={ORDERS_PER_PAGE}
          onPageChange={handlePageChange}
          itemName="orders"
        />
      </div>

      {/* ─── Verify Order Details Modal ─── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-none border border-[#EDE4D8] w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EDE4D8] flex items-center justify-between bg-[#FAF7F2]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#DEA53B] tracking-wider">
                  Order Details & Fulfillment
                </span>
                <h2 className="text-lg font-bold text-[#1F1713]">
                  Order ID: {selectedOrder.orderId}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              {/* Product Card */}
              <div className="p-4 bg-white border border-[#EDE4D8] rounded-none">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[#EDE4D8]/60">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedOrder.product.image}
                      alt={selectedOrder.product.title}
                      className="w-16 h-20 rounded-none object-cover border border-[#EDE4D8] shrink-0"
                    />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6D021B] tracking-wider">
                        Ordered Saree Product
                      </span>
                      <h3 className="text-sm font-bold text-stone-900 mt-0.5">
                        {selectedOrder.product.title}
                      </h3>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Quantity: <strong className="text-stone-800">{selectedOrder.product.quantity}</strong> • Color: {selectedOrder.product.color}
                      </p>
                      <p className="text-sm font-bold text-[#6D021B] mt-1 font-sans">
                        ₹{selectedOrder.product.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>


                {/* Change Order Status Section */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF7F2] -mx-4 -mb-4 p-4 mt-3">
                  <div>
                    <p className="font-bold text-stone-800">Admin Change Order Status</p>
                    <p className="text-[11px] text-stone-500">
                      Current status: <strong className="text-[#6D021B]">{selectedOrder.status}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {orderStatusOptions.map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateOrderStatus(selectedOrder, st)}
                        className={`px-3 py-1.5 text-xs font-bold transition-all cursor-pointer rounded-none border ${
                          selectedOrder.status === st
                            ? 'bg-[#6D021B] text-white border-[#6D021B] shadow-2xs'
                            : 'bg-white border-[#EDE4D8] text-stone-700 hover:border-[#6D021B]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Date, Time & Payment Verification Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-[#EDE4D8] rounded-none">
                  <h4 className="font-bold text-stone-800 flex items-center gap-1.5 mb-2">
                    <Calendar className="w-3.5 h-3.5 text-[#6D021B]" />
                    Order Date & Time
                  </h4>
                  <p className="text-stone-700 font-medium">Date: <strong className="text-stone-900">{selectedOrder.orderDate}</strong></p>
                  <p className="text-stone-700 font-medium mt-1">Time: <strong className="text-stone-900">{selectedOrder.orderTime}</strong></p>
                  <p className="text-[11px] text-stone-400 mt-2">
                    Order Reference: #{selectedOrder.orderId}
                  </p>
                </div>

                <div className="p-4 bg-white border border-[#EDE4D8] rounded-none">
                  <h4 className="font-bold text-stone-800 flex items-center gap-1.5 mb-2">
                    <CreditCard className="w-3.5 h-3.5 text-[#6D021B]" />
                    Payment Method
                  </h4>
                  <p className="text-stone-800 font-bold">{selectedOrder.paymentMethod}</p>
                  <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-none bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Payment Verified & Received
                  </span>
                </div>
              </div>

              {/* Customer Details & Delivery Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-[#EDE4D8] rounded-none">
                  <h4 className="font-bold text-stone-800 flex items-center gap-1.5 mb-2">
                    <User className="w-3.5 h-3.5 text-[#6D021B]" />
                    Customer Details
                  </h4>
                  <p className="font-semibold text-stone-800">{selectedOrder.customer?.name || 'Customer'}</p>
                  <p className="text-stone-500 mt-1">{selectedOrder.customer?.email || 'customer@example.com'}</p>
                  <p className="text-stone-500">{selectedOrder.customer?.phone || '+91 98401 23456'}</p>
                </div>

                <div className="p-4 bg-white border border-[#EDE4D8] rounded-none">
                  <h4 className="font-bold text-stone-800 flex items-center gap-1.5 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-[#6D021B]" />
                    Delivery Address
                  </h4>
                  <p className="text-stone-600 leading-relaxed">
                    {selectedOrder.customer?.address ||
                      'Plot No 1, 3rd Street, Tambaram, Urapakkam, Chennai - 603 210'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-[#EDE4D8] flex items-center justify-between bg-[#FAF7F2]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-600 font-medium">Status:</span>
                <span
                  className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-none ${
                    selectedOrder.status === 'Delivered'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : selectedOrder.status === 'Shipped'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : selectedOrder.status === 'Cancelled'
                      ? 'bg-red-50 text-red-800 border-red-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {selectedOrder.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-1.5 bg-[#6D021B] text-white rounded-none font-semibold text-xs hover:bg-[#850320] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
