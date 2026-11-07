import mongoose from 'mongoose'

const variantSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    color: {
      type: String,
      required: [true, 'Variant color is required'],
      trim: true,
    },
    hex: {
      type: String,
      trim: true,
      default: '#6D021B',
    },
    material: {
      type: String,
      required: [true, 'Variant material/fabric is required'],
      trim: true,
    },
    design: {
      type: String,
      trim: true,
      default: '',
    },
    weight: {
      type: Number,
      required: [true, 'Variant weight is required'],
      min: [50, 'Weight must be at least 50g'],
      default: 800,
    },
    stock: {
      type: Number,
      required: [true, 'Variant stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 1,
    },
    lowStockAlert: {
      type: Number,
      required: [true, 'Low stock alert threshold is required'],
      min: [1, 'Low stock threshold must be at least 1'],
      default: 2,
    },
  },
  { _id: true }
)

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Saree title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [1, 'Price must be greater than 0'],
    },
    originalPrice: {
      type: Number,
      default: 0,
      min: [0, 'Original price cannot be negative'],
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Draft', 'Out of Stock'],
      default: 'Active',
      index: true,
    },
    badge: {
      type: String,
      trim: true,
      default: '',
    },
    // Return Policy Window (Number of days allowed for return after delivery, e.g., 7 days)
    returnWindowDays: {
      type: Number,
      default: 7,
      min: [0, 'Return window days cannot be negative'],
    },
    // Whether this specific product is eligible for return
    isReturnable: {
      type: Boolean,
      default: true,
    },
    // The main featured image (defaults to the first variant's image)
    image: {
      type: String,
      default: '',
    },
    // Multiple Variant Cards: Each image has its color, material, design, weight, stock, and low stock alert
    variants: {
      type: [variantSchema],
      required: [true, 'At least one variant (image with attributes) is required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0
        },
        message: 'Please add at least one product variant card',
      },
    },
    // Total aggregate stock across all variants
    totalStock: {
      type: Number,
      default: 0,
    },
    // SEO & Meta Tags
    metaTitle: {
      type: String,
      trim: true,
      default: '',
    },
    metaKeywords: {
      type: String,
      trim: true,
      default: '',
    },
    metaDescription: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

// Automatically compute discount percentage, totalStock, default image, and status
productSchema.pre('save', function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discountPercentage = Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    )
  } else {
    this.discountPercentage = 0
  }

  // Calculate total stock from all variants
  if (this.variants && this.variants.length > 0) {
    this.totalStock = this.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
    // Synchronize image and images array for each variant
    this.variants.forEach((v) => {
      if (Array.isArray(v.images) && v.images.length > 0) {
        if (!v.image) v.image = v.images[0]
      } else if (v.image) {
        v.images = [v.image]
      }
    })
    // Set main product image from 1st variant if not set
    if (!this.image && (this.variants[0].image || this.variants[0].images?.[0])) {
      this.image = this.variants[0].image || this.variants[0].images[0]
    }
  } else {
    this.totalStock = 0
  }

  if (this.totalStock <= 0 && this.status === 'Active') {
    this.status = 'Out of Stock'
  }
})

const Product = mongoose.models.Product || mongoose.model('Product', productSchema)

export default Product
