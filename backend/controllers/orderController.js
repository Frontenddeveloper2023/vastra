import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Customer from '../models/Customer.js'
import { ApiError, ApiResponse, asyncHandler } from '../utils/apiResponse.js'
import { sendOrderCancellationEmail } from '../services/emailService.js'

// Helper: Generate Unique Order ID (e.g. VAST-2026-XXXXX)
const generateOrderId = () => {
  const randomDigits = Math.floor(10000 + Math.random() * 90000)
  const timestamp = Date.now().toString().slice(-4)
  return `VAS-${timestamp}-${randomDigits}`
}

/**
 * @desc Create New Customer Order
 * @route POST /api/orders
 * @access Private (Customer)
 */
export const createOrder = asyncHandler(async (req, res) => {
  const customerId = req.user?.id
  const {
    items,
    shippingAddress,
    pricing,
    payment,
    customerInfo,
  } = req.body

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Order must contain at least one item.')
  }

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
    throw new ApiError(400, 'A complete shipping address is required.')
  }

  // Prevent duplicate payment/order creation via transactionId if provided
  if (payment?.transactionId) {
    const existingOrderWithTx = await Order.findOne({ 'payment.transactionId': payment.transactionId })
    if (existingOrderWithTx) {
      return res.status(200).json(
        new ApiResponse(200, existingOrderWithTx, 'Order already placed for this transaction.')
      )
    }
  }

  // Find customer
  const customer = await Customer.findById(customerId)
  if (!customer) {
    throw new ApiError(404, 'Customer account not found. Please log in.')
  }

  // Stock deduction & validation
  for (const item of items) {
    if (item.productId) {
      const product = await Product.findById(item.productId)
      if (product) {
        // Deduct variant stock if variantId is specified
        if (item.variantId && Array.isArray(product.variants)) {
          const v = product.variants.id(item.variantId)
          if (v && v.stock !== undefined) {
            v.stock = Math.max(0, v.stock - (item.quantity || 1))
          }
        }
        // Deduct totalStock
        if (product.totalStock !== undefined) {
          product.totalStock = Math.max(0, product.totalStock - (item.quantity || 1))
        }
        await product.save()
      }
    }
  }

  const orderId = generateOrderId()

  const newOrder = await Order.create({
    orderId,
    customer: customer._id,
    customerInfo: {
      name: customerInfo?.name || customer.name || shippingAddress.name || '',
      email: customer.email,
      phone: customerInfo?.phone || customer.phone || shippingAddress.phone || '',
    },
    items: items.map((i) => ({
      productId: i.productId || i.id,
      variantId: i.variantId,
      title: i.title,
      image: i.image || '',
      color: i.color || '',
      design: i.design || '',
      material: i.material || i.fabric || '',
      weight: Number(i.weight) || 850,
      price: Number(i.price) || 0,
      quantity: Number(i.quantity) || 1,
      returnWindowDays: i.returnWindowDays !== undefined ? Number(i.returnWindowDays) : 7,
      isReturnable: i.isReturnable !== undefined ? Boolean(i.isReturnable) : true,
    })),
    shippingAddress: {
      name: shippingAddress.name,
      phone: shippingAddress.phone,
      street: shippingAddress.street,
      landmark: shippingAddress.landmark || '',
      city: shippingAddress.city,
      state: shippingAddress.state,
      pincode: shippingAddress.pincode,
      type: shippingAddress.type || 'Home',
    },
    pricing: {
      subtotal: Number(pricing?.subtotal) || 0,
      shippingFee: Number(pricing?.shippingFee) || 0,
      totalWeightGrams: Number(pricing?.totalWeightGrams) || 0,
      discount: Number(pricing?.discount) || 0,
      finalTotal: Number(pricing?.finalTotal) || 0,
    },
    payment: {
      method: payment?.method || 'ONLINE',
      status: payment?.status || 'Completed',
      transactionId: payment?.transactionId || `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    },
    status: 'On process',
    timeline: [
      {
        status: 'On process',
        message: 'Order received and is currently on process.',
        time: new Date(),
      },
    ],
    readByAdmin: false,
  })

  return res.status(201).json(
    new ApiResponse(201, newOrder, 'Order placed successfully!')
  )
})

/**
 * @desc Get Logged-in Customer's Order History
 * @route GET /api/orders/my-orders
 * @access Private (Customer)
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const customerId = req.user?.id
  const orders = await Order.find({ customer: customerId })
    .sort({ createdAt: -1 })
    .lean()

  return res.status(200).json(
    new ApiResponse(200, orders, 'Customer orders retrieved successfully.')
  )
})

/**
 * @desc Get Single Order by Order ID
 * @route GET /api/orders/:orderId
 * @access Private (Customer or Admin)
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params
  const customerId = req.user?.id
  const isAdmin = req.user?.role === 'admin'

  const query = {
    $or: [{ orderId }, { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }],
  }

  const order = await Order.findOne(query).lean()

  if (!order) {
    throw new ApiError(404, 'Order not found.')
  }

  // Security check: non-admin can only view their own order
  if (!isAdmin && order.customer.toString() !== customerId?.toString()) {
    throw new ApiError(403, 'Unauthorized access to this order.')
  }

  return res.status(200).json(
    new ApiResponse(200, order, 'Order details retrieved.')
  )
})

/**
 * @desc Admin: Get All Orders with Filter & Search
 * @route GET /api/orders/admin/all
 * @access Private (Admin)
 */
export const getAdminOrders = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 50 } = req.query

  const query = {}

  if (status && status !== 'All') {
    if (status === 'On process') {
      // Catch legacy 'Placed' or 'Processing' along with 'On process'
      query.status = { $in: ['On process', 'Placed', 'Processing'] }
    } else {
      query.status = status
    }
  }

  if (search && search.trim()) {
    const s = search.trim()
    query.$or = [
      { orderId: { $regex: s, $options: 'i' } },
      { 'customerInfo.name': { $regex: s, $options: 'i' } },
      { 'customerInfo.email': { $regex: s, $options: 'i' } },
      { 'customerInfo.phone': { $regex: s, $options: 'i' } },
      { 'shippingAddress.city': { $regex: s, $options: 'i' } },
    ]
  }

  const skip = (Number(page) - 1) * Number(limit)

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Order.countDocuments(query),
  ])

  // Count unread orders for notification badge
  const unreadCount = await Order.countDocuments({ readByAdmin: false })

  return res.status(200).json(
    new ApiResponse(
      200,
      { orders, total, page: Number(page), unreadCount },
      'Admin orders retrieved.'
    )
  )
})

/**
 * @desc Admin: Update Order Status (Forward-Only Progression)
 * Flow: On process -> Shipped -> Delivered -> Returned
 * Terminal/Irreversible: Delivered, Cancelled, Returned cannot revert backwards
 * @route PATCH /api/orders/admin/:id/status
 * @access Private (Admin)
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, message } = req.body

  const validStatuses = ['On process', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Return Requested', 'Return Approved']
  if (status && !validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid order status. Allowed: ${validStatuses.join(', ')}`)
  }

  const order = await Order.findById(id)
  if (!order) {
    throw new ApiError(404, 'Order not found.')
  }

  // Canonicalize current status
  const current = ['Placed', 'Processing'].includes(order.status) ? 'On process' : order.status

  // Order progression hierarchy definition:
  // Once an order reaches a state, it cannot go backwards to previous states.
  const allowedTransitions = {
    'On process': ['Shipped', 'Cancelled'],
    'Shipped': ['Delivered', 'Returned', 'Cancelled'],
    'Delivered': ['Returned', 'Return Requested', 'Return Approved'],
    'Return Requested': ['Return Approved', 'Delivered', 'Returned'],
    'Return Approved': ['Returned', 'Delivered'],
    'Cancelled': [], // Terminal
    'Returned': [],  // Terminal
  }

  if (status && status !== order.status) {
    const nextAllowed = allowedTransitions[current] || []
    if (!nextAllowed.includes(status)) {
      throw new ApiError(
        400,
        `Cannot change order status backwards or illegally from "${order.status}" to "${status}". Allowed next statuses: ${nextAllowed.length ? nextAllowed.join(', ') : 'None (Terminal state)'}`
      )
    }

    order.status = status

    // Set delivery timestamp when marked Delivered
    if (status === 'Delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date()
    }

    order.timeline.push({
      status,
      message: message || `Order status updated to ${status}.`,
      time: new Date(),
    })

    // If Admin cancels the order, dispatch professional cancellation email with the store's reason
    if (status === 'Cancelled') {
      const recipientEmail = order.customerInfo?.email || order.shippingAddress?.email
      if (recipientEmail) {
        sendOrderCancellationEmail(recipientEmail, {
          customerName: order.customerInfo?.name || order.shippingAddress?.name || 'Customer',
          orderId: order.orderId,
          reason: message || 'Item could not be fulfilled at this time.',
          items: order.items,
          totalAmount: order.pricing?.finalTotal,
        }).catch((err) => {
          console.error('[Email Notice Error] Failed to send cancellation email:', err.message)
        })
      }
    }
  }

  await order.save()

  return res.status(200).json(
    new ApiResponse(200, order, `Order status updated to ${order.status}`)
  )
})

/**
 * @desc Customer: Cancel Order (Only permitted before product is Shipped)
 * @route POST /api/orders/:orderId/cancel
 * @access Private (Customer)
 */
export const cancelCustomerOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params
  const customerId = req.user?.id
  const { reason } = req.body

  const query = {
    $or: [{ orderId }, { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }],
    customer: customerId,
  }

  const order = await Order.findOne(query)
  if (!order) {
    throw new ApiError(404, 'Order not found.')
  }

  const currentStatus = ['Placed', 'Processing'].includes(order.status) ? 'On process' : order.status

  if (currentStatus !== 'On process') {
    throw new ApiError(
      400,
      `Order cannot be cancelled because it has already reached "${order.status}". Cancellation is only allowed before shipping.`
    )
  }

  order.status = 'Cancelled'
  order.timeline.push({
    status: 'Cancelled',
    message: reason ? `Cancelled by customer: ${reason}` : 'Cancelled by customer before dispatch.',
    time: new Date(),
  })

  await order.save()

  return res.status(200).json(
    new ApiResponse(200, order, 'Order has been successfully cancelled.')
  )
})

/**
 * @desc Customer: Request Return for Delivered Order (Enforces returnWindowDays per product)
 * @route POST /api/orders/:orderId/return
 * @access Private (Customer)
 */
export const requestCustomerReturn = asyncHandler(async (req, res) => {
  const { orderId } = req.params
  const customerId = req.user?.id
  const { reason, comments } = req.body

  if (!reason || !reason.trim()) {
    throw new ApiError(400, 'Please select a reason for returning this product.')
  }

  const query = {
    $or: [{ orderId }, { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null }],
    customer: customerId,
  }

  const order = await Order.findOne(query)
  if (!order) {
    throw new ApiError(404, 'Order not found.')
  }

  if (order.status !== 'Delivered') {
    throw new ApiError(
      400,
      `Return can only be requested once the order has been Delivered. Current status: ${order.status}`
    )
  }

  // Calculate return window
  // Use deliveredAt timestamp; fallback to last timeline entry or updatedAt
  const deliveredTimeline = order.timeline?.slice().reverse().find((t) => t.status === 'Delivered')
  const deliveryTime = order.deliveredAt || deliveredTimeline?.time || order.updatedAt || order.createdAt
  const now = new Date()
  const daysSinceDelivery = (now.getTime() - new Date(deliveryTime).getTime()) / (1000 * 60 * 60 * 24)

  // Find max return window from items (default 7 days)
  let maxReturnWindowDays = 7
  let hasReturnableItem = false
  if (Array.isArray(order.items) && order.items.length > 0) {
    order.items.forEach((item) => {
      if (item.isReturnable !== false) {
        hasReturnableItem = true
        const window = item.returnWindowDays !== undefined ? Number(item.returnWindowDays) : 7
        if (window > maxReturnWindowDays) maxReturnWindowDays = window
      }
    })
  } else {
    hasReturnableItem = true
  }

  if (!hasReturnableItem) {
    throw new ApiError(400, 'The items in this order are marked as Non-Returnable.')
  }

  if (daysSinceDelivery > maxReturnWindowDays) {
    throw new ApiError(
      400,
      `The return window of ${maxReturnWindowDays} days has expired for this order. Delivered ${Math.floor(daysSinceDelivery)} days ago.`
    )
  }

  // Update order return details
  order.status = 'Return Requested'
  order.returnDetails = {
    isReturnRequested: true,
    reason: reason.trim(),
    customerComments: comments ? comments.trim() : '',
    requestedAt: now,
    returnStatus: 'Requested',
  }

  order.timeline.push({
    status: 'Return Requested',
    message: `Customer initiated return request: "${reason.trim()}"${comments ? ` - Note: ${comments.trim()}` : ''}`,
    time: now,
  })

  await order.save()

  return res.status(200).json(
    new ApiResponse(200, order, 'Your return request has been submitted successfully.')
  )
})

/**
 * @desc Admin: Mark Orders as Read
 * @route PATCH /api/orders/admin/mark-read
 * @access Private (Admin)
 */
export const markOrdersAsRead = asyncHandler(async (req, res) => {
  await Order.updateMany({ readByAdmin: false }, { $set: { readByAdmin: true } })
  return res.status(200).json(new ApiResponse(200, null, 'All orders marked as read.'))
})

