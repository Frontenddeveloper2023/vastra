import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import ConfirmationModal from './ConfirmationModal'
import { getCmsImageUrl } from '../utils/imageHelper'

export default function CartDrawer() {
  const navigate = useNavigate()
  const {
    cartItems,
    selectedItemIds = [],
    selectedCartItems = [],
    toggleItemSelection,
    toggleSelectAll,
    selectOnlyItem,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    totalCount,
    subtotal,
    shipping,
    finalTotal,
    selectedTotalCount,
    selectedSubtotal,
    selectedFinalTotal,
  } = useCart()

  const [itemToDelete, setItemToDelete] = useState(null)

  // Prevent background scrolling when cart drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isCartOpen])

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCartOpen, closeCart])

  const formatPrice = (val) => {
    return '₹' + Number(val).toLocaleString('en-IN')
  }

  return (
    <>
      {/* ─── Backdrop Blur Overlay ─── */}
      <div
        onClick={closeCart}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      />

      {/* ─── Slide-over Drawer ─── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-[440px] sm:max-w-[470px] bg-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out transform ${isCartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* ─── 1. DRAWER HEADER ─── */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-stone-200/80 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="font-sans text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                My Cart
              </h2>
              <span className="bg-[#FAF3EA] text-primary border border-secondary/30 text-xs font-semibold px-2.5 py-0.5 rounded-none-full">
                {totalCount} {totalCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={closeCart}
              type="button"
              aria-label="Close cart"
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-none-full transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Select All Toggle for Checkout */}
          {cartItems.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs select-none">
              <label
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-stone-700 font-semibold cursor-pointer hover:text-[#6D021B]"
              >
                <div
                  className={`w-4 h-4 rounded-none flex items-center justify-center border transition-colors ${
                    selectedItemIds.length === cartItems.length
                      ? 'bg-[#6D021B] border-[#6D021B] text-white'
                      : selectedItemIds.length > 0
                      ? 'bg-[#6D021B]/20 border-[#6D021B] text-[#6D021B]'
                      : 'border-stone-300 bg-white'
                  }`}
                >
                  {selectedItemIds.length === cartItems.length && (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                  {selectedItemIds.length > 0 && selectedItemIds.length < cartItems.length && (
                    <span className="w-2 h-0.5 bg-[#6D021B] block" />
                  )}
                </div>
                <span>
                  Select All ({selectedItemIds.length}/{cartItems.length} selected)
                </span>
              </label>

              <span className="text-[11px] text-stone-400">
                Choose items to checkout
              </span>
            </div>
          )}
        </div>

        {/* ─── 2. SCROLLABLE CART ITEMS LIST ─── */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-3.5">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-20 h-20 rounded-none-full bg-[#FAF3EA] flex items-center justify-center text-primary mb-4 border border-secondary/30">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                </svg>
              </div>
              <h3 className="font-sans text-lg font-bold text-stone-900 mb-1">Your cart is empty</h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-xs mb-6">
                Discover our luxurious handwoven sarees and add your favorite creations.
              </p>
              <button
                onClick={closeCart}
                className="bg-primary hover:bg-primary-dark text-white font-medium text-xs sm:text-sm px-6 py-2.5 rounded-none-full transition-colors cursor-pointer shadow-sm hover:shadow"
              >
                Explore Sarees
              </button>
            </div>
          ) : (
            cartItems.map((item) => {
              const itemKey = item.cartItemId || item.id
              const isSelected = selectedItemIds.includes(itemKey)

              return (
                <div
                  key={itemKey}
                  className={`group relative flex items-center gap-3 p-3 rounded-none border transition-all duration-200 ${
                    isSelected
                      ? 'border-[#6D021B]/40 bg-white shadow-xs'
                      : 'border-stone-200 bg-stone-50/50 opacity-80'
                  }`}
                >
                  {/* Item Checkbox for Checkout Selection */}
                  <button
                    type="button"
                    onClick={() => toggleItemSelection(itemKey)}
                    className="p-1 cursor-pointer focus:outline-none shrink-0"
                    title={isSelected ? 'Uncheck for checkout' : 'Check to include in checkout'}
                  >
                    <div
                      className={`w-4 h-4 rounded-none flex items-center justify-center border transition-colors ${
                        isSelected
                          ? 'bg-[#6D021B] border-[#6D021B] text-white'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Product Thumbnail */}
                  <div className="relative w-16 h-20 sm:w-18 sm:h-22 rounded-none overflow-hidden bg-stone-100 shrink-0 border border-stone-200/50">
                    <img
                      src={getCmsImageUrl(item.image)}
                      alt={item.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className="font-medium text-xs sm:text-sm text-stone-900 truncate tracking-tight">
                      {item.title}
                    </h4>
                    <div className="mt-0.5 flex items-center gap-2 text-xs">
                      <span className="font-bold text-stone-900">{formatPrice(item.price)}</span>
                    </div>

                    {/* Prominently Show Chosen Color, Design & Material */}
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                      {item.color && (
                        <span className="bg-[#FAF7F2] text-[#6D021B] font-bold px-1.5 py-0.5 border border-[#6D021B]/15">
                          Color: {item.color}
                        </span>
                      )}
                      {item.design && (
                        <span className="bg-stone-100 text-stone-700 font-medium px-1.5 py-0.5">
                          {item.design}
                        </span>
                      )}
                      {(item.material || item.fabric) && (
                        <span className="bg-stone-100 text-stone-700 font-medium px-1.5 py-0.5">
                          {item.material || item.fabric}
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      {/* Quantity Stepper */}
                      <div className="inline-flex items-center rounded-none border border-stone-200 bg-stone-50/70 p-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity === 1) {
                              setItemToDelete(item)
                            } else {
                              updateQuantity(itemKey, -1)
                            }
                          }}
                          aria-label="Decrease quantity"
                          className="w-6 h-6 flex items-center justify-center rounded-none text-stone-600 hover:bg-white hover:text-primary transition-colors cursor-pointer text-xs"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                          </svg>
                        </button>
                        <span className="w-7 text-center text-xs font-semibold text-stone-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemKey, 1)}
                          aria-label="Increase quantity"
                          className="w-6 h-6 flex items-center justify-center rounded-none text-stone-600 hover:bg-white hover:text-primary transition-colors cursor-pointer text-xs"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </button>
                      </div>

                      {/* Buy Only This Product Option */}
                  
                    </div>
                  </div>

                  {/* Delete / Trash Button (Triggers Confirmation Modal) */}
                  <button
                    type="button"
                    onClick={() => setItemToDelete(item)}
                    aria-label={`Remove ${item.title} from cart`}
                    className="absolute right-2 top-2 p-1.5 rounded-none text-stone-400 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* ─── 3. DRAWER FOOTER: ORDER SUMMARY & CHECKOUT ─── */}
        {cartItems.length > 0 && (
          <div className="border-t border-stone-200/90 bg-white px-5 sm:px-6 pt-4 pb-5 space-y-4 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
            {/* Price Calculations */}
            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Selected Items Subtotal ({selectedTotalCount} items)</span>
                <span className="font-semibold text-stone-900">{formatPrice(selectedSubtotal)}</span>
              </div>

            

              <div className="pt-2.5 border-t border-stone-200 flex justify-between items-baseline">
                <span className="font-sans text-base font-bold text-stone-900">Product Total Pice</span>
                <span className="font-sans text-xl font-bold text-[#6D021B] tabular-nums">
                  {formatPrice(selectedFinalTotal)}
                </span>
              </div>
            </div>

            {/* Big Action: Proceed to Checkout Button */}
            <button
              type="button"
              disabled={selectedCartItems.length === 0}
              onClick={() => {
                if (selectedCartItems.length === 0) return
                closeCart()
                navigate('/checkout')
              }}
              className="w-full bg-[#6D021B] hover:bg-[#850320] text-white font-medium text-sm sm:text-base py-3.5 px-6 rounded-none flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span>
                {selectedCartItems.length === 0
                  ? 'Select Items to Checkout'
                  : `Proceed to Checkout (${selectedTotalCount} items)`}
              </span>
              <svg
                className="w-4 h-4 transform transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </button>


          </div>
        )}
      </aside>

      {/* ─── Common Confirmation Modal for Cart Removal ─── */}
      <ConfirmationModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            removeFromCart(itemToDelete.cartItemId || itemToDelete.id)
            setItemToDelete(null)
          }
        }}
        title="Remove Item from Cart?"
        message={`Are you sure you want to remove "${itemToDelete?.title}" from your cart?`}
        confirmText="Remove"
        cancelText="Keep Item"
        variant="danger"
      />
    </>
  )
}
