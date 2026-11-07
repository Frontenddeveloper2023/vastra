import mongoose from 'mongoose'

// 1. Hero Banner Sub-schema (Supports Laptop/Desktop and Mobile banners)
const heroBannerSchema = new mongoose.Schema({
  id: { type: String },
  image: { type: String, required: true }, // Laptop / Desktop screen banner
  mobileImage: { type: String, default: '' }, // Mobile screen portrait banner
  title: { type: String, default: '' },
  buttonText: { type: String, default: 'SHOP NOW' },
  buttonLink: { type: String, default: '/collections' },
  order: { type: Number, default: 0 },
})

// 2. Fashion For Every Mood Sub-schemas
const moodItemSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  image: { type: String, default: '' },
  url: { type: String, default: '/collections' },
})

const styleDirectionSchema = new mongoose.Schema({
  backgroundImage: { type: String, default: '' },
  title: { type: String, default: 'Fashion For' },
  highlightTitle: { type: String, default: 'Every Mood' },
  description: { type: String, default: '' },
  buttonText: { type: String, default: 'Shop All Moods' },
  buttonUrl: { type: String, default: '/collections' },
  moods: [moodItemSchema],
})

// 3. Shop by Category Sub-schemas
const categoryCardSchema = new mongoose.Schema({
  id: { type: String },
  categoryName: { type: String, required: true },
  title: { type: String, default: '' },
  itemCount: { type: String, default: '' },
  image: { type: String, default: '' },
  featuredProductId: { type: mongoose.Schema.Types.Mixed, default: null },
})

const shopByCategorySchema = new mongoose.Schema({
  title: { type: String, default: 'Shop by' },
  highlightTitle: { type: String, default: 'Category' },
  description: { type: String, default: '' },
  selectedCategories: [categoryCardSchema],
})

// 4. New Arrivals Sub-schema (Max 4 Products)
const newArrivalsSchema = new mongoose.Schema({
  title: { type: String, default: 'New' },
  highlightTitle: { type: String, default: 'Arrivals' },
  description: { type: String, default: '' },
  productIds: [{ type: mongoose.Schema.Types.Mixed }],
})

// 5. Category Showcase Sub-schema (Dynamic Sections)
const categoryShowcaseSchema = new mongoose.Schema({
  id: { type: String },
  categoryName: { type: String, required: true },
  title: { type: String, default: '' },
  highlightTitle: { type: String, default: '' },
  description: { type: String, default: '' },
  productIds: [{ type: mongoose.Schema.Types.Mixed }],
})

// Master HomeCMS Schema
const homeCMSSchema = new mongoose.Schema(
  {
    heroBanners: [heroBannerSchema],
    styleDirection: { type: styleDirectionSchema, default: () => ({}) },
    shopByCategory: { type: shopByCategorySchema, default: () => ({}) },
    newArrivals: { type: newArrivalsSchema, default: () => ({}) },
    categoryShowcases: [categoryShowcaseSchema],
  },
  { timestamps: true }
)

const HomeCMS = mongoose.model('HomeCMS', homeCMSSchema)
export default HomeCMS
