import { useState } from 'react'
import { Plus, Layers, Image as ImageIcon } from 'lucide-react'
import {
  AdminEditButton,
  AdminDeleteButton,
  AdminSaveButton,
  AdminCancelButton,
} from '../../components/admin/AdminUI'

export default function AdminCategories() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Banarasi Sarees', count: 18, description: 'Royal brocades and rich zari weaves from Varanasi', active: true },
    { id: 2, name: 'Kanjivaram Silk', count: 24, description: 'Pure temple silks from Kanchipuram with contrast borders', active: true },
    { id: 3, name: 'Bridal Edit', count: 14, description: 'Heirloom bridal wedding drapes in royal crimson and vermilion', active: true },
    { id: 4, name: 'Handloom Sarees', count: 16, description: 'Artisan hand-woven breathable organic silks and tussar', active: true },
    { id: 5, name: 'Organza Tissue', count: 12, description: 'Delicate, ethereal sheer weaves with metallic gold accents', active: true },
    { id: 6, name: 'Chanderi Weaves', count: 10, description: 'Lightweight historic Madhya Pradesh cotton-silk drapes', active: true },
    { id: 7, name: 'Chiffon & Georgette', count: 9, description: 'Flowing romantic silhouettes for intimate cocktails and soirees', active: true },
    { id: 8, name: 'Bandhani & Patola', count: 8, description: 'Intricate tie-and-dye master craftsmanship from Gujarat', active: true },
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const handleOpenAdd = () => {
    setEditingCategory(null)
    setName('')
    setDescription('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (c) => {
    setEditingCategory(c)
    setName(c.name)
    setDescription(c.description)
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this category? Sarees in this category will become unassigned.')) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
    }
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? { ...c, name, description } : c))
      )
    } else {
      setCategories((prev) => [
        ...prev,
        {
          id: Date.now(),
          name,
          description,
          count: 0,
          active: true,
        },
      ])
    }
    setIsModalOpen(false)
  }

  const toggleActive = (id) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    )
  }

  return (
    <div className="space-y-6">
      {/* ─── Page Title ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-normal text-2xl sm:text-3xl font-bold text-[#1F1713]">
            Saree Categories & Collections
          </h1>

        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#6D021B] text-white rounded-none-xl text-xs font-semibold shadow-xs hover:bg-[#580115] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#DEA53B]" />
          <span>New Category</span>
        </button>
      </div>

      {/* ─── Category Cards Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white border border-[#EDE4D8] rounded-none-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="w-10 h-10 rounded-none-xl bg-[#FAF7F2] border border-[#EDE4D8] flex items-center justify-center text-[#6D021B]">
                  <Layers className="w-5 h-5 text-[#DEA53B]" />
                </div>

                <div className="flex items-center gap-2">
                  <span
                    onClick={() => toggleActive(cat.id)}
                    className={`cursor-pointer px-2.5 py-0.5 rounded-none-full text-[10px] font-bold border ${cat.active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-stone-100 text-stone-500 border-stone-200'
                      }`}
                  >
                    {cat.active ? 'Visible on Store' : 'Hidden'}
                  </span>
                </div>
              </div>

              <h3 className="font-serif text-base font-bold text-[#1F1713] mt-3">
                {cat.name}
              </h3>
              <p className="text-xs text-[#73655B] mt-1 leading-relaxed">
                {cat.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#EDE4D8] flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">
                {cat.count} Sarees cataloged
              </span>

              <div className="flex items-center gap-1.5">
                <AdminEditButton onClick={() => handleOpenEdit(cat)} />
                <AdminDeleteButton onClick={() => handleDelete(cat.id)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Add / Edit Category Modal ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-none-2xl border border-[#EDE4D8] w-full max-w-md shadow-xl">
            <div className="px-6 py-4 border-b border-[#EDE4D8] flex items-center justify-between">
              <h2 className="font-serif text-base font-bold text-[#1F1713]">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-none-lg hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tussar & Muga Silk"
                  className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Short Description</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers about the weave, origin, or fabric..."
                  className="w-full px-3 py-2 border border-[#EDE4D8] rounded-none-xl focus:outline-none focus:border-[#6D021B]"
                />
              </div>

              <div className="pt-3 border-t border-[#EDE4D8] flex items-center justify-end gap-2">
                <AdminCancelButton onClick={() => setIsModalOpen(false)} />
                <AdminSaveButton type="submit">
                  {editingCategory ? 'Update Category' : 'Save Category'}
                </AdminSaveButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

