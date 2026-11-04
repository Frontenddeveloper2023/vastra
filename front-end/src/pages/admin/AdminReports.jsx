import { useState, useMemo } from 'react'
import {
  FileText,
  FileSpreadsheet,
  Calendar,
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  X,
  Filter,
} from 'lucide-react'
import Toast from '../../components/Toast'
import { AdminPagination } from '../../components/admin/AdminUI'

// Base sales orders data with normalized ISO date strings
const rawSalesData = [
  { id: 'ORD-9821', isoDate: '2026-10-28', date: '28 Oct 2026', customer: 'Priya Sharma', items: 'Banarasi Pure Katan Saree', category: 'Banarasi', amount: 12499, payment: 'UPI', status: 'Delivered' },
  { id: 'ORD-8930', isoDate: '2026-09-12', date: '12 Sep 2026', customer: 'Priya Sharma', items: 'Kanjivaram Silk Temple Border', category: 'Kanjivaram', amount: 9890, payment: 'Card', status: 'Delivered' },
  { id: 'ORD-7612', isoDate: '2026-10-14', date: '14 Oct 2026', customer: 'Ananya Deshmukh', items: 'Raktambari Crimson Saree', category: 'Banarasi', amount: 7899, payment: 'Net Banking', status: 'Delivered' },
  { id: 'ORD-9912', isoDate: '2026-11-01', date: '01 Nov 2026', customer: 'Meera Iyer', items: 'Bridal Heritage Saree', category: 'Bridal', amount: 14999, payment: 'UPI', status: 'Shipped' },
  { id: 'ORD-5541', isoDate: '2026-10-19', date: '19 Oct 2026', customer: 'Deepa Varma', items: 'Maroon Zari Katan Saree', category: 'Banarasi', amount: 7499, payment: 'COD', status: 'Delivered' },
  { id: 'ORD-6211', isoDate: '2026-09-20', date: '20 Sep 2026', customer: 'Kavita Sundaram', items: 'Organza Tissue Embroidered', category: 'Organza', amount: 8299, payment: 'UPI', status: 'Cancelled' },
  { id: 'ORD-4410', isoDate: '2026-10-22', date: '22 Oct 2026', customer: 'Pooja Reddy', items: 'Chanderi Gold Foil Zari Saree', category: 'Chanderi', amount: 4899, payment: 'Card', status: 'Delivered' },
  { id: 'ORD-3321', isoDate: '2026-10-26', date: '26 Oct 2026', customer: 'Sneha Patel', items: 'Pastel Lavender Chiffon Drape', category: 'Chiffon', amount: 3999, payment: 'UPI', status: 'Delivered' },
  { id: 'ORD-2104', isoDate: '2026-11-03', date: '03 Nov 2026', customer: 'Gayatri Nair', items: 'Temple Border Festive Kanjivaram', category: 'Kanjivaram', amount: 6199, payment: 'UPI', status: 'Delivered' },
]

export default function AdminReports() {
  const [dateRange, setDateRange] = useState('all') // 'all' | 'today' | 'week' | 'month' | 'year' | 'custom'
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [downloadToast, setDownloadToast] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const RECORDS_PER_PAGE = 8

  // Filtered dataset reflecting both preset periods and manual calendar dates
  const filteredData = useMemo(() => {
    // Fixed reference anchor for demo: 2026-11-03
    const refDate = new Date('2026-11-03T23:59:59')

    return rawSalesData.filter((row) => {
      // Status filter
      if (selectedStatus !== 'All' && row.status !== selectedStatus) {
        return false
      }

      const rowDate = new Date(row.isoDate + 'T00:00:00')

      // Custom Calendar Range Filter
      if (dateRange === 'custom') {
        if (startDate && row.isoDate < startDate) return false
        if (endDate && row.isoDate > endDate) return false
        return true
      }

      // Quick Preset Time Filters
      if (dateRange === 'today') {
        return row.isoDate === '2026-11-03'
      }

      if (dateRange === 'week') {
        // Last 7 days
        const sevenDaysAgo = new Date(refDate)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        return rowDate >= sevenDaysAgo && rowDate <= refDate
      }

      if (dateRange === 'month') {
        // November 2026 + October 2026 recent month window
        const thirtyDaysAgo = new Date(refDate)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return rowDate >= thirtyDaysAgo && rowDate <= refDate
      }

      if (dateRange === 'year') {
        return row.isoDate.startsWith('2026')
      }

      // 'all'
      return true
    })
  }, [dateRange, startDate, endDate, selectedStatus])

  // Dynamic calculated metric totals matching filtered records
  const totalSalesRevenue = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.amount, 0)
  }, [filteredData])

  const deliveredCount = useMemo(() => {
    return filteredData.filter((s) => s.status === 'Delivered').length
  }, [filteredData])

  const inTransitCount = useMemo(() => {
    return filteredData.filter((s) => s.status === 'Shipped').length
  }, [filteredData])

  // Export to CSV / Excel format (Exports EXACTLY the filtered records)
  const downloadExcel = () => {
    if (filteredData.length === 0) {
      alert('No records found for the selected filter to download.')
      return
    }

    let csvContent = 'data:text/csv;charset=utf-8,'
    csvContent += 'Order ID,Date,Customer Name,Saree Product,Category,Amount (INR),Payment Mode,Order Status\n'
    filteredData.forEach((row) => {
      csvContent += `"${row.id}","${row.date}","${row.customer}","${row.items}","${row.category}","${row.amount}","${row.payment}","${row.status}"\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    const filterTag = dateRange === 'custom' ? `${startDate || 'start'}_to_${endDate || 'end'}` : dateRange
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
    const tableHeader = '<tr><th>Order ID</th><th>Date</th><th>Customer</th><th>Product</th><th>Category</th><th>Amount</th><th>Status</th></tr>'

    let tableRows = ''
    filteredData.forEach((row) => {
      tableRows += `<tr>
        <td>${row.id}</td>
        <td>${row.date}</td>
        <td>${row.customer}</td>
        <td>${row.items}</td>
        <td>${row.category}</td>
        <td>₹${row.amount.toLocaleString()}</td>
        <td>${row.status}</td>
      </tr>`
    })

    const rangeLabel = dateRange === 'custom' ? `Custom Range: ${startDate || 'From Start'} to ${endDate || 'Latest'}` : `Period: ${dateRange.toUpperCase()}`

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
            <p>Total Filtered Records: ${filteredData.length} | Generated on: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
          <table>
            <thead>${tableHeader}</thead>
            <tbody>${tableRows}</tbody>
          </table>
          <div class="summary">
            <strong>Total Filtered Revenue: ₹${totalSalesRevenue.toLocaleString()}</strong> | Delivered: ${deliveredCount} | In Transit: ${inTransitCount}
          </div>
          <div class="footer">
            <p>© 2026 Vastraa. Confidential Store Sales Report.</p>
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
  const totalPages = Math.ceil(filteredData.length / RECORDS_PER_PAGE) || 1
  const paginatedData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * RECORDS_PER_PAGE,
      currentPage * RECORDS_PER_PAGE
    )
  }, [filteredData, currentPage])

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
  }

  const isFiltered = dateRange !== 'all' || selectedStatus !== 'All' || startDate || endDate

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      <Toast message={downloadToast} onClose={() => setDownloadToast('')} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EDE4D8]">
        <div>
          <h1 className="font-normal text-2xl sm:text-3xl font-bold text-[#1F1713]">
            Sales & Orders Reports
          </h1>
         
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

          <button
            type="button"
            onClick={downloadPdf}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#6D021B] hover:bg-[#580115] text-white text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer transition-colors shadow-xs border border-[#DEA53B]/50"
            title={`Download ${filteredData.length} records as PDF`}
          >
            <FileText className="w-4 h-4 text-[#DEA53B]" />
            <span>Download PDF ({filteredData.length})</span>
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards (Live Updates Based On Filtered Results) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-[#EDE4D8] rounded-none shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-stone-700">Filtered Sales Value</span>
            <div className="w-8 h-8 bg-[#FAF7F2] border border-[#EDE4D8] flex items-center justify-center text-[#6D021B]">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-normal text-[#1F1713] mt-2">
            ₹{totalSalesRevenue.toLocaleString('en-IN')}
          </p>
        
        </div>

        <div className="p-4 bg-white border border-[#EDE4D8] rounded-none shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-stone-700">Orders Delivered</span>
            <div className="w-8 h-8 bg-[#FAF7F2] border border-[#EDE4D8] flex items-center justify-center text-emerald-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-normal text-emerald-700 mt-2">
            {deliveredCount} Orders
          </p>
        </div>

        <div className="p-4 bg-white border border-[#EDE4D8] rounded-none shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold uppercase tracking-wider text-stone-700">Orders In Transit</span>
            <div className="w-8 h-8 bg-[#FAF7F2] border border-[#EDE4D8] flex items-center justify-center text-blue-700">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold font-normal text-blue-700 mt-2">
            {inTransitCount} {inTransitCount === 1 ? 'Order' : 'Orders'}
          </p>
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
                  className={`px-3 py-1.5 text-xs font-semibold rounded-none cursor-pointer transition-colors ${
                    dateRange === p.value
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
              <option value="Delivered">Delivered</option>
              <option value="Shipped">Shipped</option>
              <option value="Cancelled">Cancelled</option>
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
            <h3 className=" text-sm font-normal text-[#1F1713]">
              Sales & Orders Record Sheet
            </h3>
           
          </div>
          <span className="text-xs font-bold text-stone-600">
            {filteredData.length} {filteredData.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
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
              {paginatedData.map((row) => (
                <tr key={row.id} className="hover:bg-[#FFFDF9] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-stone-800">{row.id}</td>
                  <td className="py-3 px-4 text-stone-500">{row.date}</td>
                  <td className="py-3 px-4 font-bold text-[#1F1713]">{row.customer}</td>
                  <td className="py-3 px-4 text-stone-800 font-medium">{row.items}</td>
                  <td className="py-3 px-4 text-stone-600">{row.category}</td>
                  <td className="py-3 px-4 text-stone-500">{row.payment}</td>
                  <td className="py-3 px-4 font-bold font-sans text-[#6D021B]">
                    ₹{row.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded-none ${
                        row.status === 'Delivered'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : row.status === 'Shipped'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-stone-500">
                    <p className="font-semibold text-sm">No orders match your selected filter.</p>
                    <p className="text-xs text-stone-400 mt-1">Try selecting a different date range or click Reset.</p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-3 px-3 py-1.5 bg-[#6D021B] text-white text-xs font-semibold rounded-none cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ─── Pagination Controls ─── */}
        <AdminPagination
          currentPage={currentPage}
          totalCount={filteredData.length}
          pageSize={RECORDS_PER_PAGE}
          onPageChange={handlePageChange}
          itemName="orders"
        />
      </div>
    </div>
  )
}
