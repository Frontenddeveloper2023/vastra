import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  PackageX,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import { allProductsList } from '../user/collections'
import Toast from '../../components/Toast'

export default function AdminNotifications() {
  // Initial low stock and out of stock items
  const [items, setItems] = useState([
    {
      id: 1,
      title: 'Maroon Zari Katan Saree',
      sku: 'VAS-BAN-MAR-4991',
      category: 'Banarasi',
      stock: 2,
      lowStockAlert: 5,
      price: 4999,
      image: allProductsList[0]?.image || '',
      status: 'Low Stock',
      lastRestocked: '2 days ago',
    },
    {
      id: 2,
      title: 'Festive Gold Temple Saree',
      sku: 'VAS-KAN-FES-5492',
      category: 'Kanjivaram',
      stock: 1,
      lowStockAlert: 4,
      price: 5499,
      image: allProductsList[1]?.image || '',
      status: 'Low Stock',
      lastRestocked: '5 days ago',
    },
    {
      id: 3,
      title: 'Rose Floral Tissue Organza',
      sku: 'VAS-ORG-ROS-3894',
      category: 'Organza',
      stock: 0,
      lowStockAlert: 5,
      price: 3899,
      image: allProductsList[3]?.image || '',
      status: 'Out of Stock',
      lastRestocked: '12 days ago',
    },
    {
      id: 4,
      title: 'Chanderi Gold Foil Zari Saree',
      sku: 'VAS-CHA-CHA-3490',
      category: 'Chanderi',
      stock: 0,
      lowStockAlert: 3,
      price: 3499,
      image: allProductsList[9]?.image || allProductsList[0]?.image,
      status: 'Out of Stock',
      lastRestocked: '2 weeks ago',
    },
    {
      id: 5,
      title: 'Pastel Lavender Chiffon Drape',
      sku: 'VAS-CHI-PAS-2991',
      category: 'Chiffon',
      stock: 3,
      lowStockAlert: 6,
      price: 2999,
      image: allProductsList[10]?.image || allProductsList[1]?.image,
      status: 'Low Stock',
      lastRestocked: 'Yesterday',
    },
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('All') // 'All' | 'Low Stock' | 'Out of Stock'
  const [restoreModalItem, setRestoreModalItem] = useState(null)
  const [restoreQuantity, setRestoreQuantity] = useState(15)
  const [successToast, setSuccessToast] = useState('')

  const handleOpenRestore = (item) => {
    setRestoreModalItem(item)
    setRestoreQuantity(15)
  }

  const handleConfirmRestore = (e) => {
    e.preventDefault()
    if (!restoreModalItem) return
    const qty = Number(restoreQuantity) || 10

    setItems((prev) =>
      prev.map((it) => {
        if (it.id === restoreModalItem.id) {
          const newStock = it.stock + qty
          return {
            ...it,
            stock: newStock,
            status: newStock <= it.lowStockAlert ? 'Low Stock' : 'Restocked',
            lastRestocked: 'Just now',
          }
        }
        return it
      })
    )

    setSuccessToast(`Successfully restored ${qty} units for "${restoreModalItem.title}"!`)
    setRestoreModalItem(null)
    setTimeout(() => {
      setSuccessToast('')
    }, 3500)
  }

  const handleQuickAdd = (itemId, addQty) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const newStock = it.stock + addQty
          return {
            ...it,
            stock: newStock,
            status: newStock <= it.lowStockAlert ? 'Low Stock' : 'Restocked',
            lastRestocked: 'Just now',
          }
        }
        return it
      })
    )
    const target = items.find((i) => i.id === itemId)
    setSuccessToast(`+${addQty} units added to "${target?.title}"`)
    setTimeout(() => setSuccessToast(''), 3000)
  }

  // Filtered
  const filtered = items.filter((it) => {
    const matchesSearch =
      !searchQuery.trim() ||
      it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.category.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterType === 'All' || it.status === filterType
    return matchesSearch && matchesFilter
  })

  const lowCount = items.filter((i) => i.status === 'Low Stock').length
  const outCount = items.filter((i) => i.status === 'Out of Stock').length

  return (
    <div className="space-y-6">
      {/* ─── Success Notification Toast ─── */}
      <Toast message={successToast} onClose={() => setSuccessToast('')} />

      {/* ─── Page Title & Stat Summary ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EDE4D8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-normal text-2xl sm:text-3xl font-bold text-[#1F1713]">
              Stock Notifications & Alerts
            </h1>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 border border-red-200">
              {lowCount + outCount} Alerts
            </span>
          </div>
        
        </div>

        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#6D021B] bg-white border border-[#EDE4D8] hover:border-[#6D021B] transition-colors rounded-none self-start sm:self-auto"
        >
          <span>Manage All Products</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#DEA53B]" />
        </Link>
      </div>

      {/* ─── Metric Overview Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-[#EDE4D8] shadow-2xs rounded-none flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Out of Stock</p>
            <p className="text-2xl font-bold font-normal text-red-600 mt-1">{outCount}</p>
          </div>
          <div className="w-10 h-10 bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
            <PackageX className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white border border-[#EDE4D8] shadow-2xs rounded-none flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Low Stock Warnings</p>
            <p className="text-2xl font-bold font-normal text-amber-600 mt-1">{lowCount}</p>
          </div>
          <div className="w-10 h-10 bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white border border-[#EDE4D8] shadow-2xs rounded-none flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Restored in this session</p>
            <p className="text-2xl font-bold font-normal text-emerald-600 mt-1">
              {items.filter((i) => i.status === 'Restocked').length}
            </p>
          </div>
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── Filter & Search Bar ─── */}
      <div className="bg-white border border-[#EDE4D8] p-4 shadow-2xs rounded-none flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by saree title, SKU or category..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF7F2] border border-[#EDE4D8] focus:outline-none focus:border-[#6D021B] rounded-none text-stone-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-stone-400 shrink-0" />
          <div className="flex items-center gap-1 border border-[#EDE4D8] p-1 bg-[#FAF7F2] rounded-none">
            {['All', 'Out of Stock', 'Low Stock'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 text-xs font-semibold rounded-none transition-colors cursor-pointer ${
                  filterType === t
                    ? 'bg-[#6D021B] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-[#1F1713]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Clean Structured Stock Alert Table ─── */}
      <div className="bg-white border border-[#EDE4D8] shadow-2xs rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#EDE4D8] text-[#73655B] uppercase font-bold tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Alert Quantity</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4">Quick Add</th>
                <th className="py-3.5 px-4 text-right">Restore Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE4D8]/60">
              {filtered.map((item) => {
                const isOutOfStock = item.stock <= 0
                const isRestocked = item.status === 'Restocked'

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#FFFDF9] transition-colors ${
                      isOutOfStock ? 'bg-red-50/15' : ''
                    }`}
                  >
                    {/* Saree Info & Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 bg-stone-100 border border-[#EDE4D8] overflow-hidden shrink-0 rounded-none">
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300">
                              <PackageX className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#1F1713] text-sm leading-tight hover:text-[#6D021B] transition-colors">
                            {item.title}
                          </p>
                          <p className="text-[11px] font-mono text-stone-400 mt-0.5">{item.sku}</p>
                          <p className="text-[11px] font-bold text-[#6D021B] font-sans mt-0.5">
                            ₹{item.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 text-stone-700 font-semibold">
                      {item.category}
                    </td>

                    {/* Current Stock */}
                    <td className="py-3 px-4 font-mono font-bold text-sm">
                      <span className={isOutOfStock ? 'text-red-600' : 'text-stone-900'}>
                        {item.stock} units
                      </span>
                    </td>

                    {/* Low Stock Alert Setting */}
                    <td className="py-3 px-4 text-stone-500 font-mono">
                     Less then {item.lowStockAlert} units
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4">
                      {isRestocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-none">
                          <CheckCircle2 className="w-3 h-3" />
                          Restocked ({item.stock})
                        </span>
                      ) : isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-300 rounded-none">
                          <PackageX className="w-3 h-3" />
                          Out of Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 rounded-none">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock ({item.stock})
                        </span>
                      )}
                    </td>

                    {/* Quick Add Increment Buttons */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(item.id, 5)}
                          className="px-2 py-1 bg-white hover:bg-stone-50 border border-[#EDE4D8] text-[11px] font-bold text-stone-700 transition-colors cursor-pointer rounded-none"
                          title="Add 5 units quickly"
                        >
                          +5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(item.id, 10)}
                          className="px-2 py-1 bg-white hover:bg-stone-50 border border-[#EDE4D8] text-[11px] font-bold text-stone-700 transition-colors cursor-pointer rounded-none"
                          title="Add 10 units quickly"
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdd(item.id, 20)}
                          className="px-2 py-1 bg-white hover:bg-stone-50 border border-[#EDE4D8] text-[11px] font-bold text-stone-700 transition-colors cursor-pointer rounded-none"
                          title="Add 20 units quickly"
                        >
                          +20
                        </button>
                      </div>
                    </td>

                    {/* Action: Custom Restore Modal */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenRestore(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#6D021B] hover:bg-[#580115] text-white text-xs font-semibold rounded-none cursor-pointer transition-all shadow-xs"
                      >
                        <RotateCcw className="w-3 h-3 text-[#DEA53B]" />
                        <span>Restore Stock</span>
                      </button>
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-stone-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-sm">No products!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Restore Quantity Popup Modal ─── */}
      {restoreModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#EDE4D8] w-full max-w-md shadow-2xl rounded-none p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-[#EDE4D8] pb-3">
              <div>
                
                <h3 className="font-normal text-lg font-bold text-[#1F1713] mt-0.5">
                  Restore Stock
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRestoreModalItem(null)}
                className="text-stone-400 hover:text-stone-800 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#FAF7F2] border border-[#EDE4D8] rounded-none flex items-center gap-3">
              <div className="w-12 h-14 bg-white border border-[#EDE4D8] overflow-hidden shrink-0">
                <img src={restoreModalItem.image} alt={restoreModalItem.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-[#1F1713] text-xs">{restoreModalItem.title}</p>
                <p className="text-[11px] font-mono text-stone-500">{restoreModalItem.sku}</p>
                <p className="text-[11px] text-stone-600 mt-0.5">
                  Current Stock: <strong className="text-red-600 font-mono">{restoreModalItem.stock}</strong> units
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmRestore} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Units To Add to Inventory <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={restoreQuantity}
                  onChange={(e) => setRestoreQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-[#EDE4D8] focus:outline-none focus:border-[#6D021B] font-bold text-base text-stone-800 rounded-none bg-white"
                  placeholder="e.g. 15"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  New stock total will become:{' '}
                  <strong className="text-emerald-700 font-mono font-bold">
                    {restoreModalItem.stock + (Number(restoreQuantity) || 0)}
                  </strong>{' '}
                  units
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-stone-500 font-bold uppercase">Presets:</span>
                {[10, 20, 50, 100].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRestoreQuantity(preset)}
                    className="px-2.5 py-1 text-xs border border-[#EDE4D8] bg-[#FAF7F2] hover:bg-white text-stone-700 font-semibold cursor-pointer rounded-none transition-colors"
                  >
                    +{preset}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-[#EDE4D8] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRestoreModalItem(null)}
                  className="px-4 py-2 border border-[#EDE4D8] text-stone-600 font-semibold hover:bg-stone-50 cursor-pointer rounded-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6D021B] text-white font-bold hover:bg-[#580115] shadow-xs cursor-pointer rounded-none"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

