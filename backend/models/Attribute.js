import mongoose from 'mongoose'

const colorItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    hex: {
      type: String,
      required: true,
      trim: true,
      default: '#6D021B',
    },
  },
  { _id: false }
)

const attributeSchema = new mongoose.Schema(
  {
    categories: {
      type: [String],
      default: [],
    },
    materials: {
      type: [String],
      default: [],
    },
    designs: {
      type: [String],
      default: [],
    },
    colors: {
      type: [colorItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

const Attribute = mongoose.models.Attribute || mongoose.model('Attribute', attributeSchema)

export default Attribute
