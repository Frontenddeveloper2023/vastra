import { useState, useMemo, useEffect } from 'react'
import {
  FileText,
  FileSpreadsheet,
  Calendar,
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  X,
  Filter,
  RefreshCw,
} from 'lucide-react'
import Toast from '../../components/Toast'
import { AdminPagination } from '../../components/admin/AdminUI'
import { formatIndianDate } from '../../utils/dateHelper'

export default function AdminReports() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('all') // 'all' | 'today' | 'week' | 'month' | 'year' | 'custom'
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [downloadToast, setDownloadToast] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Fetch real order reports from backend DB
  const fetchReportOrders = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('vastraa_admin_token')
      const API_BASE = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '') + '/api'
      const res = await fetch(`${API_BASE}/orders/admin/all?limit=500`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await res.json()

      if (result.success && result.data && Array.isArray(result.data.orders)) {
        setOrders(result.data.orders)
      } else {
        setOrders([])
      }
    } catch (err) {
      console.error('Failed to fetch real reports orders:', err)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportOrders()
  }, [])

  // Transform backend orders into report rows
  const normalizedData = useMemo(() => {
    return orders.map((ord) => {
      const isoDate = ord.createdAt ? ord.createdAt.slice(0, 10) : ''
      const customerName =
        ord.customerInfo?.name || ord.shippingAddress?.name || 'Customer'
      const itemsTitle =
        ord.items?.map((it) => `${it.title} (x${it.quantity || 1})`).join(', ') ||
        'Saree'
      const category = ord.items?.[0]?.material || ord.items?.[0]?.design || 'Silk'
      const amount = ord.pricing?.finalTotal || 0
      const payment = ord.payment?.method || 'ONLINE'
      const status = ['Placed', 'Processing'].includes(ord.status)
        ? 'On process'
        : ord.status || 'On process'

      return {
        id: ord.orderId || ord._id,
        rawOrder: ord,
        isoDate,
        date: formatIndianDate(ord.createdAt || Date.now()),
        customer: customerName,
        items: itemsTitle,
        category,
        amount,
        payment,
        status,
        timestamp: new Date(ord.createdAt || Date.now()).getTime(),
      }
    })
  }, [orders])

  // Filtered dataset reflecting both preset periods and manual calendar dates
  const filteredData = useMemo(() => {
    const now = new Date()
    const todayIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10)

    return normalizedData.filter((row) => {
      // Status filter
      if (selectedStatus !== 'All' && row.status !== selectedStatus) {
        return false
      }

      // Custom Calendar Range Filter
      if (dateRange === 'custom') {
        if (startDate && row.isoDate < startDate) return false
        if (endDate && row.isoDate > endDate) return false
        return true
      }

      // Quick Preset Time Filters
      if (dateRange === 'today') {
        return row.isoDate === todayIso
      }

      if (dateRange === 'week') {
        const sevenDaysAgo = new Date(now)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return row.timestamp >= sevenDaysAgo.getTime()
      }

      if (dateRange === 'month') {
        const thirtyDaysAgo = new Date(now)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return row.timestamp >= thirtyDaysAgo.getTime()
      }

      if (dateRange === 'year') {
        const currentYear = now.getFullYear().toString()
        return row.isoDate.startsWith(currentYear)
      }

      // 'all'
      return true
    })
  }, [normalizedData, dateRange, startDate, endDate, selectedStatus])

  // Dynamic calculated metric totals matching filtered records
  const totalSalesRevenue = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + (curr.amount || 0), 0)
  }, [filteredData])

  const deliveredCount = useMemo(() => {
    return filteredData.filter((s) => s.status === 'Delivered').length
  }, [filteredData])

  const inTransitCount = useMemo(() => {
    return filteredData.filter((s) => ['Shipped', 'On process'].includes(s.status)).length
  }, [filteredData])

  // Export to CSV / Excel format (Exports EXACTLY the filtered records)
  const downloadExcel = () => {
    if (filteredData.length === 0) {
      alert('No records found for the selected filter to download.')
      return
    }

    let csvContent = 'data:text/csv;charset=utf-8,'
    csvContent +=
      'Order ID,Date,Customer Name,Saree Product,Category,Amount (INR),Payment Mode,Order Status\n'
    filteredData.forEach((row) => {
      csvContent += `"${row.id}","${row.date}","${row.customer}","${row.items}","${row.category}","${row.amount}","${row.payment}","${row.status}"\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    const filterTag =
      dateRange === 'custom'
        ? `${startDate || 'start'}_to_${endDate || 'end'}`
        : dateRange
    link.setAttribute('download', `Vastraa_sales_report_${filterTag}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setDownloadToast(`Excel file downloaded (${filteredData.length} records exported)!`)
    setTimeout(() => setDownloadToast(''), 3500)
  }

  // Export to PDF (Exports EXACTLY the filtered records)
  const downloadPdf = () => {
    if (filteredData.length === 0) {
      alert('No records found for the selected filter to download.')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const title = 'Vastraa Sales & Orders Report'
    const tableHeader =
      '<tr><th>Order ID</th><th>Date</th><th>Customer</th><th>Product</th><th>Category</th><th>Amount</th><th>Status</th></tr>'

    let tableRows = ''
    filteredData.forEach((row) => {
      tableRows += `<tr>
        <td>${row.id}</td>
        <td>${row.date}</td>
        <td>${row.customer}</td>
        <td>${row.items}</td>
        <td>${row.category}</td>
        <td>₹${row.amount.toLocaleString('en-IN')}</td>
        <td>${row.status}</td>
      </tr>`
    })

    const rangeLabel =
      dateRange === 'custom'
        ? `Custom Range: ${startDate || 'From Start'} to ${endDate || 'Latest'}`
        : `Period: ${dateRange.toUpperCase()}`

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #1F1713; }
            .header { border-bottom: 2px solid #6D021B; padding-bottom: 12px; margin-bottom: 20px; }
            h1 { color: #6D021B; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
            p { color: #73655B; margin: 4px 0; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th { background-color: #FAF7F2; color: #6D021B; text-align: left; padding: 8px 10px; border-bottom: 1px solid #EDE4D8; }
            td { padding: 8px 10px; border-bottom: 1px solid #EDE4D8; }
            .summary { margin-top: 15px; padding: 10px; background-color: #FAF7F2; font-size: 12px; }
            .footer { margin-top: 30px; font-size: 11px; color: #8A796E; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>VASTRAA SILK STUDIO</h1>
            <p>Official Store Sales Report • ${rangeLabel}</p>
            <p>Total Filtered Records: ${filteredData.length} | Generated on: ${formatIndianDate(new Date())}</p>
          </div>
          <table>
            <thead>${tableHeader}</thead>
            <tbody>${tableRows}</tbody>
          </table>
          <div class="summary">
            <strong>Total Filtered Revenue: ₹${totalSalesRevenue.toLocaleString('en-IN')}</strong> | Delivered: ${deliveredCount} | In Transit: ${inTransitCount}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Vastraa. Confidential Store Sales Report.</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 400)

    setDownloadToast(`PDF print ready (${filteredData.length} filtered records)!`)
    setTimeout(() => setDownloadToast(''), 3500)
  }

  const handleResetFilters = () => {
    setDateRange('all')
    setStartDate('')
    setEndDate('')
    setSelectedStatus('All')
    setCurrentPage(1)
  }

  // Pagination calculation
  const totalItems = filteredData.length
  const startIndex = (currentPage - 1) * pageSize
  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, startIndex, pageSize])

  const isFiltered =
    dateRange !== 'all' || selectedStatus !== 'All' || startDate || endDate

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      <Toast message={downloadToast} onClose={() => setDownloadToast('')} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EDE4D8]">
        <div>
          <h1 className="font-normal text-2xl sm:text-3xl font-bold text-[#1F1713]">
            Reports
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time sales revenue, live order reports, and accounting exports
          </p>
        </div>

        {/* Action Download Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">


          <button
            type="button"
            onClick={downloadExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer transition-colors shadow-xs"
            title={`Download ${filteredData.length} records as Excel`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel ({filteredData.length})</span>
          </button>


        </div>
      </div>

      {/* Dynamic Summary Cards (Live Updates Based On Real Filtered Results) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-[#EDE4D8] rounded-none shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-stone-700">
              Filtered Sales Value
            </span>
            <div className="w-8 h-8 bg-[#FAF7F2] border border-[#EDE4D8] flex items-center justify-center text-[#6D021B]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-normal text-[#1F1713] mt-2">
            ₹{totalSalesRevenue.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-stone-400 mt-0.5 block">
            Across {filteredData.length} total orders
          </span>
        </div>

        <div className="p-4 bg-white border border-[#EDE4D8] rounded-none shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-stone-700">
              Orders Delivered
            </span>
            <div className="w-8 h-8 bg-[#FAF7F2] border border-[#EDE4D8] flex items-center justify-center text-emerald-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-normal text-emerald-700 mt-2">
            {deliveredCount} Orders
          </p>
          <span className="text-[11px] text-stone-400 mt-0.5 block">
            Successfully completed
          </span>
        </div>

        <div className="p-4 bg-white border border-[#EDE4D8] rounded-none shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-stone-700">
              Orders In Progress / Shipped
            </span>
            <div className="w-8 h-8 bg-[#FAF7F2] border border-[#EDE4D8] flex items-center justify-center text-blue-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-normal text-blue-700 mt-2">
            {inTransitCount} {inTransitCount === 1 ? 'Order' : 'Orders'}
          </p>
          <span className="text-[11px] text-stone-400 mt-0.5 block">
            Active orders currently in fulfillment
          </span>
        </div>
      </div>

      {/* Date & Filter Control Bar */}
      <div className="bg-white border border-[#EDE4D8] p-4 rounded-none shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mr-1">
              <Calendar className="w-4 h-4 text-[#6D021B]" />
              <span>Time Period:</span>
            </div>

            <div className="flex items-center border border-[#EDE4D8] bg-[#FAF7F2] rounded-none flex-wrap">
              {[
                { label: 'All Time', value: 'all' },
                { label: 'Today', value: 'today' },
                { label: 'This Week', value: 'week' },
                { label: 'This Month', value: 'month' },
                { label: 'This Year', value: 'year' },
                { label: 'Custom Calendar', value: 'custom' },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setDateRange(p.value)
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-none cursor-pointer transition-colors ${dateRange === p.value
                      ? 'bg-[#6D021B] text-white shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs font-semibold text-stone-600">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-1.5 bg-[#FAF7F2] border border-[#EDE4D8] text-xs font-medium focus:outline-none focus:border-[#6D021B] rounded-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="On process">On process</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Returned">Returned</option>
            </select>

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 px-2.5 py-1.5 border border-red-200 hover:bg-red-50 cursor-pointer ml-1"
                title="Reset all filters to default"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Manual Calendar Date Pickers (Active when 'custom' is selected) */}
        {dateRange === 'custom' && (
          <div className="pt-3 border-t border-[#EDE4D8] flex flex-col sm:flex-row sm:items-center gap-3 bg-[#FAF7F2] p-3">
            <span className="text-xs font-bold text-stone-700">Choose Custom Date Range:</span>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-stone-500 font-semibold">From:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-2.5 py-1 text-xs border border-[#EDE4D8] bg-white rounded-none focus:outline-none focus:border-[#6D021B]"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-stone-500 font-semibold">To:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-2.5 py-1 text-xs border border-[#EDE4D8] bg-white rounded-none focus:outline-none focus:border-[#6D021B]"
              />
            </div>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                  setCurrentPage(1)
                }}
                className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
              >
                Clear Dates
              </button>
            )}
          </div>
        )}
      </div>

      {/* Report Data Table */}
      <div className="bg-white border border-[#EDE4D8] rounded-none shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 bg-[#FAF7F2] border-b border-[#EDE4D8] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1F1713]">
              Sales & Orders Record Sheet
            </h3>
            <p className="text-[11px] text-stone-500">Live transaction records from database</p>
          </div>
          <span className="text-xs font-bold text-stone-600">
            {filteredData.length} {filteredData.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[750px]">
            <thead>
              <tr className="border-b border-[#EDE4D8] bg-white text-[#73655B] uppercase font-bold tracking-wider text-[11px]">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Saree Product</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Order Amount</th>
                <th className="py-3 px-4">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE4D8]/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-stone-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-stone-400" />
                    <p className="font-semibold text-xs">Loading sales reports...</p>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FFFDF9] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-stone-800">{row.id}</td>
                    <td className="py-3 px-4 text-stone-500 whitespace-nowrap">{row.date}</td>
                    <td className="py-3 px-4 font-bold text-[#1F1713]">{row.customer}</td>
                    <td className="py-3 px-4 text-stone-800 font-medium max-w-[200px] truncate" title={row.items}>
                      {row.items}
                    </td>
                    <td className="py-3 px-4 text-stone-600">{row.category}</td>
                    <td className="py-3 px-4 text-stone-500 font-mono text-[11px]">{row.payment}</td>
                    <td className="py-3 px-4 font-bold font-sans text-[#6D021B] whitespace-nowrap">
                      ₹{row.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-none ${row.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : row.status === 'Shipped'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : row.status === 'On process'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-red-50 text-red-800 border-red-200'
                          }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-stone-500">
                    <p className="font-semibold text-sm">No orders match your selected filter.</p>
                    <p className="text-xs text-stone-400 mt-1">Try selecting a different date range or click Reset.</p>
                    {isFiltered && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-3 px-3 py-1.5 bg-[#6D021B] text-white text-xs font-semibold rounded-none cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination Controls ─── */}
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
      </div>
    </div>
  )
}
