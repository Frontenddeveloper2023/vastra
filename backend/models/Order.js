import mongoose from 'mongoose'

const OrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '',
    },
    design: {
      type: String,
      default: '',
    },
    material: {
      type: String,
      default: '',
    },
    weight: {
      type: Number,
      default: 850, // grams
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    returnWindowDays: {
      type: Number,
      default: 7,
    },
    isReturnable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
)

const OrderAddressSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    landmark: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    type: { type: String, default: 'Home' },
  },
  { _id: false }
)

const TimelineItemSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    message: { type: String, default: '' },
    time: { type: Date, default: Date.now },
  },
  { _id: false }
)

const OrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    customerInfo: {
      name: { type: String, default: '' },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, default: '' },
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(v) => v.length > 0, 'An order must contain at least one item.'],
    },
    shippingAddress: {
      type: OrderAddressSchema,
      required: true,
    },
    pricing: {
      subtotal: { type: Number, required: true, default: 0 },
      shippingFee: { type: Number, required: true, default: 0 },
      gstAmount: { type: Number, default: 0 },
      gstPercentage: { type: Number, default: 0 },
      totalWeightGrams: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      finalTotal: { type: Number, required: true },
    },
    payment: {
      method: {
        type: String,
        enum: ['ONLINE', 'UPI', 'CARD', 'NETBANKING', 'COD'],
        default: 'ONLINE',
      },
      status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Completed',
      },
      transactionId: {
        type: String,
        unique: true,
        sparse: true,
      },
    },
    status: {
      type: String,
      enum: [
        'On process',
        'Shipped',
        'Delivered',
        'Cancelled',
        'Returned',
        'Return Requested',
        'Return Approved',
        'Return Rejected',
        'Placed',
        'Processing',
      ],
      default: 'On process',
      index: true,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    returnDetails: {
      isReturnRequested: { type: Boolean, default: false },
      reason: { type: String, default: '' },
      customerComments: { type: String, default: '' },
      proofImages: { type: [String], default: [] },
      requestedAt: { type: Date, default: null },
      returnStatus: {
        type: String,
        enum: ['None', 'Requested', 'Approved', 'Rejected', 'Completed', 'Refund Issue'],
        default: 'None',
      },
      pickupDate: { type: String, default: '' }, // Admin sets courier collection date (YYYY-MM-DD)
      refundDays: { type: Number, default: 3 }, // Admin enters days to refund (e.g. 3, 5, 7)
      refundAmount: { type: Number, default: 0 },
      refundTransactionId: { type: String, default: '' },
      refundIssueReason: { type: String, default: '' },
      adminRemarks: { type: String, default: '' },
      resolvedAt: { type: Date, default: null },
    },
    timeline: {
      type: [TimelineItemSchema],
      default: () => [{ status: 'On process', message: 'Order received and is on process.', time: new Date() }],
    },
    readByAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)

export default Order

