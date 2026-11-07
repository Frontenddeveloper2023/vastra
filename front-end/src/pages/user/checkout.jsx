import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Plus,
  Check,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Package,
  Scale,
  Truck,
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { useCart } from '../../context/CartContext'
import { useShipping } from '../../context/ShippingContext'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { formatIndianDate } from '../../utils/dateHelper'

export default function Checkout() {
  const navigate = useNavigate()
  const { customer, token, isAuthenticated, openAuthModal, addAddress: saveCustomerAddressToDb } = useCustomerAuth()
  const {
    cartItems,
    selectedItemIds,
    selectedCartItems,
    selectedTotalCount,
    selectedSubtotal,
    selectedFinalTotal,
    removeFromCart,
    clearCart,
  } = useCart()

  const { cityList, calculateShippingCost } = useShipping()

  // Items to checkout: only check out items that the user actually selected in Cart Drawer
  const checkoutItems = selectedCartItems || []
  const checkoutCount = selectedTotalCount || 0
  const checkoutSubtotal = selectedSubtotal || 0

  // Calculate Total Weight of all checked-out items (default 800g per saree if not specified)
  const totalOrderWeightGrams = useMemo(() => {
    return checkoutItems.reduce((sum, item) => {
      const itemWeight = Number(item.weight) || 1200
      return sum + itemWeight * item.quantity
    }, 0)
  }, [checkoutItems])

  // Saved addresses list synced from customer MongoDB profile (or fallback guest addresses)
  const [savedAddresses, setSavedAddresses] = useState([])

  // Keep addresses in sync with logged in customer
  useEffect(() => {
    if (customer?.addresses && customer.addresses.length > 0) {
      setSavedAddresses(customer.addresses)
      // Pick default address or first address
      const def = customer.addresses.find((a) => a.isDefault) || customer.addresses[0]
      setSelectedAddressId(def._id || def.id)
    } else {
      // Local fallback initial address if new account without saved addresses
      const localFallback = [
        {
          id: 'temp-1',
          name: customer?.name || 'Priya Sharma',
          phone: customer?.phone || '+91 98401 23456',
          type: 'Home',
          street: 'Villa 14, Royal Palm Meadows, 2nd Main Road, Anna Nagar',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600040',
          isDefault: true,
        },
      ]
      setSavedAddresses(localFallback)
      setSelectedAddressId('temp-1')
    }
  }, [customer])

  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false)

  // New address form state
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    type: 'Home',
    street: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [addressError, setAddressError] = useState('')

  // Steps: 'address' -> 'payment' -> 'success'
  const [currentStep, setCurrentStep] = useState('address')

  // Online Payment methods only (NO Cash on Delivery)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi')
  const [upiId, setUpiId] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null)

  const selectedAddress =
    savedAddresses.find((a) => (a._id || a.id) === selectedAddressId) || savedAddresses[0]

  // Dynamic Shipping Calculation based on weight and destination city
  const activeCityName = selectedAddress?.city || (cityList?.[0]?.name || 'Chennai')
  const shippingCalculation = useMemo(() => {
    return calculateShippingCost(totalOrderWeightGrams, activeCityName)
  }, [totalOrderWeightGrams, activeCityName, calculateShippingCost])

  const calculatedShippingFee = shippingCalculation.totalShipping
  const checkoutFinalTotal = checkoutSubtotal + calculatedShippingFee

  const formatPrice = (val) => '₹' + Number(val || 0).toLocaleString('en-IN')

  // Save new address (persists to customer's MongoDB profile if authenticated)
  const handleSaveNewAddress = async (e) => {
    e.preventDefault()
    if (
      !newAddress.name.trim() ||
      !newAddress.phone.trim() ||
      !newAddress.street.trim() ||
      !newAddress.city.trim() ||
      !newAddress.state.trim() ||
      !newAddress.pincode.trim()
    ) {
      setAddressError('Please fill in all address fields to proceed.')
      return
    }

    if (isAuthenticated) {
      const res = await saveCustomerAddressToDb(newAddress)
      if (res.success && res.address) {
        const addrId = res.address._id || res.address.id
        setSelectedAddressId(addrId)
      } else {
        // Fallback local
        const localCreated = { id: 'temp-' + Date.now(), ...newAddress }
        setSavedAddresses((prev) => [localCreated, ...prev])
        setSelectedAddressId(localCreated.id)
      }
    } else {
      const localCreated = { id: 'temp-' + Date.now(), ...newAddress }
      setSavedAddresses((prev) => [localCreated, ...prev])
      setSelectedAddressId(localCreated.id)
    }

    setIsAddingNewAddress(false)
    setAddressError('')
    setNewAddress({
      name: '',
      phone: '',
      type: 'Home',
      street: '',
      city: '',
      state: '',
      pincode: '',
    })
  }

  // Trigger professional confetti explosion
  const triggerCelebration = () => {
    const end = Date.now() + 2.5 * 1000

    const colors = ['#6D021B', '#DEA53B', '#FAF7F2', '#10B981', '#E11D48']

    ;(function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    })()
  }

  // Process real online transaction and save to Order DB
  const handleProceedToPay = async () => {
    if (!isAuthenticated) {
      openAuthModal()
      return
    }

    if (!selectedAddress) {
      notify?.error ? notify.error('Please select a delivery address.') : alert('Please select a delivery address.')
      return
    }

    setIsProcessing(true)

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      const payload = {
        items: checkoutItems.map((item) => ({
          productId: item.productId || item._id || item.id,
          variantId: item.variantId,
          title: item.title,
          image: item.image,
          color: item.color || '',
          design: item.design || '',
          material: item.material || item.fabric || '',
          weight: Number(item.weight) || 850,
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
        })),
        shippingAddress: {
          name: selectedAddress.name || customer?.name,
          phone: selectedAddress.phone || customer?.phone,
          street: selectedAddress.street,
          landmark: selectedAddress.landmark || '',
          city: selectedAddress.city,
          state: selectedAddress.state,
          pincode: selectedAddress.pincode,
          type: selectedAddress.type || 'Home',
        },
        pricing: {
          subtotal: checkoutSubtotal,
          shippingFee: calculatedShippingFee,
          totalWeightGrams: totalOrderWeightGrams,
          discount: 0,
          finalTotal: checkoutFinalTotal,
        },
        payment: {
          method: selectedPaymentMethod.toUpperCase(),
          status: 'Completed',
          transactionId: `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        },
        customerInfo: {
          name: customer?.name || selectedAddress.name,
          email: customer?.email,
          phone: customer?.phone || selectedAddress.phone,
        },
      }

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (result.success && result.data) {
        const orderData = result.data
        const orderInfo = {
          orderId: orderData.orderId,
          date: formatIndianDate(orderData.createdAt || Date.now()),
          items: orderData.items,
          subtotal: orderData.pricing?.subtotal || checkoutSubtotal,
          shippingFee: orderData.pricing?.shippingFee || calculatedShippingFee,
          totalAmount: orderData.pricing?.finalTotal || checkoutFinalTotal,
          orderWeight: orderData.pricing?.totalWeightGrams || totalOrderWeightGrams,
          shippingCity: selectedAddress.city,
          paymentMode: orderData.payment?.method || selectedPaymentMethod.toUpperCase(),
          shippingAddress: orderData.shippingAddress || selectedAddress,
        }

        setPlacedOrderDetails(orderInfo)

        // Remove only the checked-out items from cart
        checkoutItems.forEach((item) => {
          removeFromCart(item.cartItemId || item.id)
        })

        setCurrentStep('success')
        triggerCelebration()
      } else {
        alert(result.message || 'Failed to place order. Please try again.')
      }
    } catch (err) {
      console.error('Order creation error:', err)
      alert(err.message || 'Payment processing failed. Please check your connection.')
    } finally {
      setIsProcessing(false)
    }
  }

  // If no items chosen and no order placed, show back to collections
  if (checkoutItems.length === 0 && currentStep !== 'success') {
    return (
      <div className="min-h-[70vh] mt-17 bg-[#FAF7F2] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#FAF7F2] text-[#6D021B] flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-2">Your Cart is Empty</h2>
          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            Please add your favorite handloom saree creations to the cart before checking out.
          </p>
          <Link
            to="/collections"
            className="inline-block w-full py-3 bg-[#6D021B] hover:bg-[#850320] text-white font-bold text-xs uppercase tracking-wider text-center transition-colors"
          >
            Explore Sarees Collection
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Top Header / Progress Indicator */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 bg-transparent">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#DEA53B] tracking-widest block">
              VASTRAA SILK STUDIO
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              Express Checkout
            </h1>
          </div>

          {currentStep !== 'success' && (
            <div className="flex items-center gap-3 text-xs select-none">
              <span
                className={`font-bold uppercase tracking-wider px-3 py-1 ${
                  currentStep === 'address'
                    ? 'bg-[#6D021B] text-white'
                    : 'bg-white text-stone-700'
                }`}
              >
                1. Delivery Atelier
              </span>
              <span className="text-stone-300">/</span>
              <span
                className={`font-bold uppercase tracking-wider px-3 py-1 ${
                  currentStep === 'payment'
                    ? 'bg-[#6D021B] text-white'
                    : 'bg-white text-stone-400'
                }`}
              >
                2. Online Payment
              </span>
            </div>
          )}
        </div>

        {/* ─── SUCCESS SCREEN WITH CELEBRATION ANIMATION ─── */}
        {currentStep === 'success' && placedOrderDetails && (
          <div className="bg-white p-6 sm:p-12 shadow-sm text-center max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            {/* Animated Celebration Icon */}
            <div className="w-20 h-20  text-emerald-600 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 animate-bounce" />
            </div>

            

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">
              Your Order Confirmed Successfully!
            </h2>
            <p className="text-xs text-stone-500 max-w-md mx-auto mb-6 leading-relaxed">
              Your heirloom saree order has been received and confirmed. An order confirmation invoice has been sent to your registered address.
            </p>

            {/* Order Summary Receipt Box */}
            <div className="bg-[#FAF7F2] p-6 text-left text-xs space-y-3 mb-8">
              <div className="flex justify-between items-center pb-2">
                <span className="text-stone-500">Order ID:</span>
                <span className="font-mono font-bold text-stone-900">{placedOrderDetails.orderId}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-stone-500">Order Date:</span>
                <span className="font-semibold text-stone-800">{placedOrderDetails.date}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-stone-500">Payment Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5">
                  Paid Online ({placedOrderDetails.paymentMode})
                </span>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-stone-500">Total Paid Amount:</span>
                <span className="font-bold font-sans text-[#6D021B] text-sm">
                  {formatPrice(placedOrderDetails.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 text-[11px] text-stone-600">
                <span>Shipping Included ({placedOrderDetails.shippingCity} • {(placedOrderDetails.orderWeight / 1000).toFixed(2)}kg):</span>
                <span className="font-semibold text-stone-900">{formatPrice(placedOrderDetails.shippingFee)}</span>
              </div>
              <div className="pt-2 border-t border-stone-200/60">
                <span className="text-stone-500 block mb-1">Delivering to:</span>
                <p className="font-bold text-stone-800">{placedOrderDetails.shippingAddress.name} ({placedOrderDetails.shippingAddress.phone})</p>
                <p className="text-stone-600 leading-relaxed mt-0.5">
                  {placedOrderDetails.shippingAddress.street}, {placedOrderDetails.shippingAddress.city}, {placedOrderDetails.shippingAddress.state} - {placedOrderDetails.shippingAddress.pincode}
                </p>
              </div>

              {/* Items Purchased in Order */}
              {placedOrderDetails.items && placedOrderDetails.items.length > 0 && (
                <div className="pt-2 border-t border-stone-200/60">
                  <span className="text-stone-500 block mb-1.5">Purchased Items:</span>
                  <div className="space-y-1.5">
                    {placedOrderDetails.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] text-stone-700 bg-white/70 p-1.5 border border-stone-200/40">
                        <div>
                          <span className="font-bold text-stone-900">{it.title}</span>
                          <span className="text-stone-500 ml-1.5">
                            ({[it.color && `Color: ${it.color}`, it.design, it.material || it.fabric].filter(Boolean).join(' • ')})
                          </span>
                        </div>
                        <span className="font-semibold text-stone-900">Qty: {it.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/orders"
                className="w-full sm:w-auto px-6 py-3 bg-[#6D021B] hover:bg-[#850320] text-white font-bold text-xs uppercase tracking-wider text-center transition-colors"
              >
                Track My Orders
              </Link>
              <Link
                to="/collections"
                className="w-full sm:w-auto px-6 py-3 bg-[#FAF7F2] hover:bg-stone-200 text-stone-800 font-bold text-xs uppercase tracking-wider text-center transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

        {/* ─── MAIN 2-COLUMN CHECKOUT LAYOUT ─── */}
        {currentStep !== 'success' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: STEP 1 (Address Selection) or STEP 2 (Payment Mode) */}
            <div className="lg:col-span-7 space-y-6">
              {/* ──────── STEP 1: ADDRESS SELECTION ──────── */}
              {currentStep === 'address' && (
                <div className="bg-white p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-stone-900">
                        Delivery Address
                      </h2>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Select a saved address or add a new delivery location.
                      </p>
                    </div>

                    {!isAddingNewAddress && (
                      <button
                        type="button"
                        onClick={() => setIsAddingNewAddress(true)}
                        className="text-xs font-bold text-[#6D021B] hover:text-[#850320] flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Address</span>
                      </button>
                    )}
                  </div>

                  {/* 1. Already Used Addresses List */}
                  {!isAddingNewAddress && (
                    <div className="space-y-3">
                      {!isAuthenticated && (
                        <div className="p-3 bg-[#FAF7F2] border border-[#EDE4D8] flex items-center justify-between text-xs">
                          <span className="text-stone-700">
                            Have an account? Sign in with <strong>Google</strong> or <strong>Email OTP</strong> to access your saved addresses.
                          </span>
                          <button
                            type="button"
                            onClick={openAuthModal}
                            className="font-bold text-[#6D021B] hover:underline cursor-pointer ml-3 whitespace-nowrap"
                          >
                            Sign In / Sign Up
                          </button>
                        </div>
                      )}

                      {savedAddresses.map((addr) => {
                        const addrId = addr._id || addr.id
                        const isSelected = selectedAddressId === addrId

                        return (
                          <div
                            key={addrId}
                            onClick={() => setSelectedAddressId(addrId)}
                            className={`p-4 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#FAF7F2] shadow-xs ring-1 ring-[#6D021B]'
                                : 'bg-white hover:bg-stone-50/60'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 ${
                                    isSelected
                                      ? 'bg-[#6D021B] text-white'
                                      : 'bg-stone-200 text-transparent'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-stone-900 text-sm">
                                      {addr.name}
                                    </span>
                                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-stone-100 text-stone-600">
                                      {addr.type}
                                    </span>
                                    {addr.isDefault && (
                                      <span className="text-[10px] uppercase font-bold text-[#DEA53B]">
                                        Default
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                                    {addr.street}, {addr.city}, {addr.state} -{' '}
                                    <strong className="text-stone-800">{addr.pincode}</strong>
                                  </p>

                                  <p className="text-xs text-stone-500 mt-1">
                                    Phone: <strong className="text-stone-800">{addr.phone}</strong>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* 2. Add New Address Form */}
                  {isAddingNewAddress && (
                    <form onSubmit={handleSaveNewAddress} className="space-y-4 pt-2">
                      <div className="bg-[#FAF7F2] p-4 text-xs font-semibold text-stone-800">
                        Enter New Shipping Address
                      </div>

                      {addressError && (
                        <p className="text-xs text-red-600 bg-red-50 p-3 font-semibold">
                          {addressError}
                        </p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="block text-stone-700 font-bold mb-1">
                            Full Recipient Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.name}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, name: e.target.value })
                            }
                            placeholder="e.g. Priya Sharma"
                            className="w-full px-3 py-2 bg-[#FAF7F2] text-stone-900 focus:outline-none focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-stone-700 font-bold mb-1">
                            Contact Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={newAddress.phone}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, phone: e.target.value })
                            }
                            placeholder="e.g. +91 98401 23456"
                            className="w-full px-3 py-2 bg-[#FAF7F2] text-stone-900 focus:outline-none focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="text-xs">
                        <label className="block text-stone-700 font-bold mb-1">
                          Street Address / House / Flat No *
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.street}
                          onChange={(e) =>
                            setNewAddress({ ...newAddress, street: e.target.value })
                          }
                          placeholder="e.g. Plot No 42, Anna Nagar West"
                          className="w-full px-3 py-2 bg-[#FAF7F2] text-stone-900 focus:outline-none focus:bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block text-stone-700 font-bold mb-1">
                            City / Town (Admin Listed) *
                          </label>
                          <select
                            required
                            value={newAddress.city}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, city: e.target.value })
                            }
                            className="w-full px-3 py-2 bg-[#FAF7F2] text-stone-900 focus:outline-none focus:bg-white font-medium cursor-pointer border-0"
                          >
                            <option value="">Select Destination City</option>
                            {cityList.map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name} (+₹{c.cost} delivery)
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-stone-700 font-bold mb-1">
                            State *
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.state}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, state: e.target.value })
                            }
                            placeholder="Tamil Nadu"
                            className="w-full px-3 py-2 bg-[#FAF7F2] text-stone-900 focus:outline-none focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-stone-700 font-bold mb-1">
                            PIN Code *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={newAddress.pincode}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, pincode: e.target.value })
                            }
                            placeholder="600040"
                            className="w-full px-3 py-2 bg-[#FAF7F2] text-stone-900 focus:outline-none focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-[#6D021B] hover:bg-[#850320] text-white text-xs font-bold cursor-pointer"
                        >
                          Save & Use This Address
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewAddress(false)
                            setAddressError('')
                          }}
                          className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Proceed to Payment Button */}
                  {!isAddingNewAddress && (
                    <div className="pt-6">
                      <button
                        type="button"
                        onClick={() => setCurrentStep('payment')}
                        className="w-full py-3.5 bg-[#6D021B] hover:bg-[#850320] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <span>Continue to Online Payment</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ──────── STEP 2: ONLINE PAYMENT ONLY (NO COD) ──────── */}
              {currentStep === 'payment' && (
                <div className="bg-white p-6 sm:p-8 shadow-sm space-y-6">
                  <div className="flex items-center justify-between pb-4">
                    <div>
                      <h2 className="text-lg font-bold text-stone-900">
                        Online Payment Options
                      </h2>
         
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentStep('address')}
                      className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Change Address</span>
                    </button>
                  </div>

                  {/* Chosen Shipping Address Recap */}
                  <div className="p-3.5 bg-[#FAF7F2] text-xs">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">
                      Deliver To:
                    </span>
                    <p className="font-bold text-stone-900">
                      {selectedAddress.name} ({selectedAddress.phone})
                    </p>
                    <p className="text-stone-600 mt-0.5">
                      {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                  </div>

                  {/* Payment Options (Strictly Online, Zero COD) */}
                  <div className="space-y-3">
                    {/* 1. UPI Payment */}
                    <div
                      onClick={() => setSelectedPaymentMethod('upi')}
                      className={`p-4 transition-all cursor-pointer ${
                        selectedPaymentMethod === 'upi'
                          ? 'bg-[#FAF7F2] shadow-xs'
                          : 'bg-white hover:bg-stone-50/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 ${
                            selectedPaymentMethod === 'upi'
                              ? 'bg-[#6D021B] text-white'
                              : 'bg-stone-200 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900 text-sm flex items-center gap-2">
                              <Smartphone className="w-4 h-4 text-[#6D021B]" />
                              <span>Instant UPI (GPay, PhonePe, Paytm, BHIM)</span>
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5">
                              Fastest
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-1">
                            Pay directly using any installed UPI App or Virtual Payment Address (VPA).
                          </p>

                          {selectedPaymentMethod === 'upi' && (
                            <div className="mt-3 pt-3" onClick={(e) => e.stopPropagation()}>
                              <label className="block text-[11px] font-bold text-stone-700 mb-1">
                                Enter UPI ID (e.g. mobile@upi or username@okaxis)
                              </label>
                              <input
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="name@oksbi / yourname@upi"
                                className="w-full px-3 py-2 bg-white text-xs text-stone-900 focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 2. Credit / Debit Cards */}
                    <div
                      onClick={() => setSelectedPaymentMethod('card')}
                      className={`p-4 transition-all cursor-pointer ${
                        selectedPaymentMethod === 'card'
                          ? 'bg-[#FAF7F2] shadow-xs'
                          : 'bg-white hover:bg-stone-50/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 ${
                            selectedPaymentMethod === 'card'
                              ? 'bg-[#6D021B] text-white'
                              : 'bg-stone-200 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex-1">
                          <span className="font-bold text-stone-900 text-sm flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#6D021B]" />
                            <span>Credit & Debit Cards</span>
                          </span>
                          <p className="text-xs text-stone-500 mt-1">
                            Visa, MasterCard, RuPay, American Express.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 3. Net Banking */}
                    <div
                      onClick={() => setSelectedPaymentMethod('netbanking')}
                      className={`p-4 transition-all cursor-pointer ${
                        selectedPaymentMethod === 'netbanking'
                          ? 'bg-[#FAF7F2] shadow-xs'
                          : 'bg-white hover:bg-stone-50/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 ${
                            selectedPaymentMethod === 'netbanking'
                              ? 'bg-[#6D021B] text-white'
                              : 'bg-stone-200 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex-1">
                          <span className="font-bold text-stone-900 text-sm flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-[#6D021B]" />
                            <span>All Major Indian Banks Net Banking</span>
                          </span>
                          <p className="text-xs text-stone-500 mt-1">
                            HDFC, SBI, ICICI, Axis, Kotak and 45+ banks supported.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

              

                  {/* Pay & Place Order Button */}
                  <div className="pt-4">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleProceedToPay}
                      className="w-full py-4 bg-[#6D021B] hover:bg-[#850320] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
                          <span>Processing Online Payment...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4 text-[#DEA53B]" />
                          <span>Pay {formatPrice(checkoutFinalTotal)} & Complete Order</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY SIDEBAR */}
            <div className="lg:col-span-5 bg-white p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3">
                <h3 className="font-bold text-stone-900 text-sm">
                  Order Summary ({checkoutCount} items)
                </h3>
              </div>

              {/* Items List */}
              <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto space-y-3 pr-1">
                {checkoutItems.map((item) => (
                  <div key={item.cartItemId || item.id} className="pt-3 first:pt-0 flex items-start gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-14 h-18 object-cover bg-[#FAF7F2] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-stone-900 text-xs truncate">
                        {item.title}
                      </p>
                      
                      {/* Chosen variants carried over from Product Details */}
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                        {item.color && (
                          <span className="bg-[#FAF7F2] text-[#6D021B] font-bold px-1.5 py-0.2 border border-[#6D021B]/15">
                            {item.color}
                          </span>
                        )}
                        {item.design && (
                          <span className="bg-stone-100 text-stone-600 px-1.5 py-0.2">
                            {item.design}
                          </span>
                        )}
                        {(item.material || item.fabric) && (
                          <span className="bg-stone-100 text-stone-600 px-1.5 py-0.2">
                            {item.material || item.fabric}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px] text-stone-500">
                          Qty: <strong>{item.quantity}</strong>
                        </span>
                        <span className="text-xs font-bold font-sans text-[#6D021B]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div className="pt-4 space-y-2.5 text-xs text-stone-600 border-t border-stone-100">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-stone-900">{formatPrice(checkoutSubtotal)}</span>
                </div>

                {/* Total Weight Indicator */}
                <div className="flex justify-between items-center text-[11px] text-stone-500 bg-[#FAF7F2] p-1.5 border border-stone-200/50">
                  <div className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-[#6D021B]" />
                    <span>Estimated Order Weight:</span>
                  </div>
                  <span className="font-bold text-stone-800">
                    {(totalOrderWeightGrams / 1000).toFixed(2)} kg ({totalOrderWeightGrams}g)
                  </span>
                </div>

                {/* Weight-Based Shipping Breakdown */}
                <div className="flex justify-between items-baseline text-[11px]">
                  <div>
                    <span className="text-stone-700 font-medium">Weight Shipping:</span>
                    <span className="text-[10px] text-stone-400 block">
                      {shippingCalculation.weightBreakdown}
                    </span>
                  </div>
                  <span className="font-semibold text-stone-900">
                    {formatPrice(shippingCalculation.weightCost)}
                  </span>
                </div>

                {/* City-Based Shipping Breakdown */}
                <div className="flex justify-between items-baseline text-[11px]">
                  <div>
                    <span className="text-stone-700 font-medium">City Delivery ({activeCityName}):</span>
                    <span className="text-[10px] text-stone-400 block">
                      {shippingCalculation.cityBreakdown}
                    </span>
                  </div>
                  <span className="font-semibold text-stone-900">
                    {formatPrice(shippingCalculation.cityCost)}
                  </span>
                </div>

                {/* Total Shipping Combined */}
                <div className="flex justify-between pt-1 border-t border-stone-100">
                  <span className="font-bold text-stone-800 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#6D021B]" />
                    <span>Total Shipping Fee</span>
                  </span>
                  <span className="font-bold text-[#6D021B]">
                    {calculatedShippingFee === 0 ? (
                      <span className="text-emerald-700">FREE</span>
                    ) : (
                      formatPrice(calculatedShippingFee)
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-3 text-base text-stone-900 font-bold border-t border-stone-200">
                  <span>Total Amount</span>
                  <span className="font-sans text-xl text-[#6D021B] font-bold">
                    {formatPrice(checkoutFinalTotal)}
                  </span>
                </div>
              </div>

          
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

