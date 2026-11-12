import mongoose from 'mongoose'

const SettingSchema = new mongoose.Schema(
  {
    // Store Identity
    storeName: {
      type: String,
      default: 'Vastraa - The House of Sarees',
      trim: true,
    },
    contactEmail: {
      type: String,
      default: 'vastraa@gmail.com',
      trim: true,
    },
    supportPhone: {
      type: String,
      default: '+91 9807738888',
      trim: true,
    },
    atelierAddress: {
      type: String,
      default: 'Plot No 1, 3rd Street, Tambaram, Urapakkam, Chennai - 603 210',
      trim: true,
    },
    googleMapsUrl: {
      type: String,
      default: 'https://maps.google.com/?q=Tambaram+Urapakkam+Chennai',
      trim: true,
    },

    // Social Media Links
    instagram: {
      type: String,
      default: 'https://instagram.com/vastraasarees',
      trim: true,
    },
    facebook: {
      type: String,
      default: 'https://facebook.com/vastraasarees',
      trim: true,
    },
    twitter: {
      type: String,
      default: 'https://x.com/vastraasarees',
      trim: true,
    },
    youtube: {
      type: String,
      default: 'https://youtube.com/@vastraasarees',
      trim: true,
    },

    // Shipping & Delivery general info
    estimatedDays: {
      type: String,
      default: '3 to 5 business days',
      trim: true,
    },

    // Shipping Cost Management
    shipping: {
      weightBased: {
        enabled: { type: Boolean, default: true },
        initialWeightKg: { type: Number, default: 1 },
        initialWeightCost: { type: Number, default: 50 },
        incrementGrams: { type: Number, default: 200 },
        incrementCost: { type: Number, default: 20 },
      },
      cityBased: {
        enabled: { type: Boolean, default: true },
        cities: [
          {
            id: { type: String },
            name: { type: String, required: true },
            cost: { type: Number, default: 0 },
          },
        ],
      },
    },

    // Global Return Policy Settings
    returnPolicy: {
      returnWindowDays: {
        type: Number,
        default: 7,
        min: 1,
      },
      returnPolicyText: {
        type: String,
        default: 'Products can be returned within the return window from the date of delivery. Proof of product condition is required.',
      },
    },

    // Admin Auth Settings
    adminPhone: {
      type: String,
      default: '+91 9807738888',
      trim: true,
    },
    adminEmail: {
      type: String,
      default: 'admin@vastraa.com',
      trim: true,
    },
    authMethod: {
      type: String,
      default: 'OTP Only (SMS & Email)',
    },
  },
  { timestamps: true }
)

const Setting = mongoose.model('Setting', SettingSchema)
export default Setting

