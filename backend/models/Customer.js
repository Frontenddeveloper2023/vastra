import mongoose from 'mongoose'

const AddressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    street: {
      type: String,
      required: true,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Home', 'Office', 'Other'],
      default: 'Home',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true, timestamps: true }
)

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    authProvider: {
      type: String,
      enum: ['google', 'email_otp', 'both'],
      default: 'email_otp',
    },
    googleId: {
      type: String,
      sparse: true,
      index: true,
    },
    addresses: [AddressSchema],
    status: {
      type: String,
      enum: ['Active', 'Blocked'],
      default: 'Active',
    },
    notifications: {
      emailUpdates: {
        type: Boolean,
        default: true,
      },
      orderAlerts: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
)

const Customer = mongoose.model('Customer', CustomerSchema)
export default Customer
export { AddressSchema }

