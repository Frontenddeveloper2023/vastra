import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import ConfirmationModal from '../../components/ConfirmationModal'
import AccountSidebar from '../../components/AccountSidebar'

export default function Addresses() {
  const navigate = useNavigate()
  const { openCart, totalCount } = useCart()

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      name: 'Jani Doe',
      type: 'Home',
      isDefault: true,
      street: '124, Lotus Heritage Residency, 4th Cross',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560038',
      phone: '+91 98765 43210',
    },
    {
      id: 2,
      name: 'Jani Doe',
      type: 'Office',
      isDefault: false,
      street: 'Tower B, 7th Floor, Vasraa Silk Tech Park',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560100',
      phone: '+91 98765 43210',
    },
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [addressToDelete, setAddressToDelete] = useState(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const [newAddr, setNewAddr] = useState({
    name: 'Jani Doe',
    type: 'Home',
    street: '',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '',
    phone: '+91 98765 43210',
  })

  const handleAddAddress = (e) => {
    e.preventDefault()
    if (!newAddr.street || !newAddr.pincode) return
    setAddresses((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...newAddr,
        isDefault: false,
      },
    ])
    setShowAddModal(false)
    setNewAddr({
      name: 'Jani Doe',
      type: 'Home',
      street: '',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '',
      phone: '+91 98765 43210',
    })
  }

  const setDefault = (id) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    )
  }

  const deleteAddress = (id) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  const handleDeleteClick = (addr) => {
    setAddressToDelete(addr)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (addressToDelete) {
      deleteAddress(addressToDelete.id)
    }
    setIsDeleteModalOpen(false)
    setAddressToDelete(null)
  }

  return (
    <div className="w-full bg-[#FAF7F2] min-h-[calc(100vh-140px)] pt-[78px] xs:pt-[82px] sm:pt-[90px] md:pt-[140px] lg:pt-[148px] pb-12 sm:pb-16 px-3 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* ─── GRID CONTAINER: Side-by-side from md (768px) and above ─── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-6 lg:gap-8 items-start">

          {/* ─── REUSABLE ACCOUNT SIDEBAR (Mobile button & Desktop Sidebar) ─── */}
          <AccountSidebar active="addresses" />


          {/* ─── RIGHT CONTENT: Addresses List ─── */}
          <div className="w-full md:col-span-8 lg:col-span-8 bg-white rounded-none-2xl sm:rounded-none-3xl border border-[#EDE4D8] p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE1D5]">
              <div>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#1F1713]">
                  My Addresses
                </h1>

              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-none-xl bg-primary hover:bg-primary-dark text-white text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer self-start sm:self-auto"
              >
                <span>+ Add New Address</span>
              </button>
            </div>

            {/* Address Cards List */}
            <div className="mt-6 space-y-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-5 rounded-none-2xl border transition-all duration-200 ${addr.isDefault
                      ? 'border-primary/40 bg-[#FAF4EC]/40 shadow-xs ring-1 ring-primary/20'
                      : 'border-[#EDE4D8] bg-white hover:border-[#D5C7B7]'
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-serif text-base font-bold text-[#1F1713]">
                          {addr.name}
                        </span>

                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none-md bg-stone-100 text-stone-700">
                          {addr.type}
                        </span>

                        {addr.isDefault && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Default Address
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-xs sm:text-sm text-[#40342C] leading-relaxed">
                        {addr.street}, {addr.city}, {addr.state} -{' '}
                        <span className="font-semibold text-[#1F1713]">{addr.pincode}</span>
                      </p>

                      <p className="mt-1 text-xs text-[#73655B]">
                        Contact: <span className="font-medium text-[#221A15]">{addr.phone}</span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => setDefault(addr.id)}
                          className="text-xs font-semibold text-stone-600 hover:text-primary underline cursor-pointer"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(addr)}
                        aria-label="Delete address"
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-none-lg transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ─── Add Address Modal ─── */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-none-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#EDE4D8] animate-fade-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE1D5]">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1F1713]">
                Add New Delivery Address
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-none-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1F1713] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newAddr.name}
                  onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-none-xl border border-stone-200 text-xs sm:text-sm text-[#1F1713] focus:outline-none focus:border-primary"
                />
              </div>



              <div>
                <label className="block text-xs font-semibold text-[#1F1713] mb-1">
                  Street Address / House No.
                </label>
                <textarea
                  rows="2"
                  required
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  placeholder="Flat / House No., Building Name, Street"
                  className="w-full px-3.5 py-2.5 rounded-none-xl border border-stone-200 text-xs sm:text-sm text-[#1F1713] focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1F1713] mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-none-xl border border-stone-200 text-xs sm:text-sm text-[#1F1713] focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F1713] mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-none-xl border border-stone-200 text-xs sm:text-sm text-[#1F1713] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1F1713] mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-none-xl border border-stone-200 text-xs sm:text-sm text-[#1F1713] focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F1713] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-none-xl border border-stone-200 text-xs sm:text-sm text-[#1F1713] focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-none-xl border border-stone-200 text-stone-600 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-none-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Common Reusable Confirmation Modal ─── */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setAddressToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Delivery Address?"
        message={`Are you sure you want to remove your ${addressToDelete?.type || ''} address (${addressToDelete?.street || ''})? This action cannot be undone.`}
        confirmText="Delete Address"
        cancelText="Keep Address"
        variant="danger"
      />
    </div>
  )
}
