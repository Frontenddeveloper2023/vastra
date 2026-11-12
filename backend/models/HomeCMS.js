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

// 6. Policy Pages Sub-schemas (Title & Points/Content)
const policyPointSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
})

const policyPageSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  points: [policyPointSchema],
})

// Master HomeCMS Schema
const homeCMSSchema = new mongoose.Schema(
  {
    heroBanners: [heroBannerSchema],
    styleDirection: { type: styleDirectionSchema, default: () => ({}) },
    shopByCategory: { type: shopByCategorySchema, default: () => ({}) },
    newArrivals: { type: newArrivalsSchema, default: () => ({}) },
    categoryShowcases: [categoryShowcaseSchema],
    shippingReturns: {
      type: policyPageSchema,
      default: () => ({
        title: 'Shipping & Returns',
        subtitle: 'Simple 7-point policy guide for your peace of mind.',
        points: [
          { title: 'Free Pan-India Delivery', description: 'Free complimentary shipping on all orders above ₹1,999. A nominal flat ₹99 fee applies to smaller orders.' },
          { title: 'Quick Dispatch & Delivery Timelines', description: 'Orders are dispatched within 24 to 48 hours. Metro deliveries arrive in 2–4 days; rest of India within 4–7 days.' },
          { title: '7-Day Return Window', description: 'Customers can request a return within 7 days from the delivery date directly from their "My Orders" page.' },
          { title: 'Hassle-Free Doorstep Pickup', description: 'Once approved, our courier partner picks up the return package directly from your delivery address at no extra cost.' },
          { title: 'Return Eligibility Condition', description: 'The saree must be unworn, unwashed, and folded with original brand tags and Silk Mark authenticity seals intact.' },
          { title: 'Fast & Direct Refunds', description: 'Refunds are released within 48 hours of quality inspection back to your original payment method (or UPI/Bank for COD).' },
          { title: 'Customer Support Assistance', description: 'Need help with an exchange or tracking? Our support team is available Mon–Sat from 10:00 AM to 7:00 PM IST.' },
        ],
      }),
    },
    termsConditions: {
      type: policyPageSchema,
      default: () => ({
        title: 'Terms & Conditions',
        subtitle: 'Store Agreement & Policies for our boutique customers.',
        points: [
          { title: 'Acceptance of Terms', description: 'By accessing, browsing, or purchasing from Vastraa, you agree to comply with and be bound by these Terms and Conditions.' },
          { title: 'Handloom Authenticity & Color Accuracy', description: 'Our sarees are woven by traditional master artisans using natural silks, zari, and dyes. Slight variations in weave texture or hue are a hallmark of authentic handloom.' },
          { title: 'Pricing & Payments', description: 'All prices are listed in Indian Rupees (₹ INR) inclusive of applicable taxes. We accept UPI, Netbanking, Credit/Debit cards, and Cash On Delivery.' },
          { title: 'Order Cancellations & Returns', description: 'Orders may be cancelled before the parcel is marked as Shipped. Delivered items are eligible for return within the specified return window (standard 7 days).' },
        ],
      }),
    },
    privacyPolicy: {
      type: policyPageSchema,
      default: () => ({
        title: 'Privacy Policy',
        subtitle: 'Data Protection & Trust commitment at Vastraa.',
        points: [
          { title: 'Information We Collect', description: 'When you browse, register, or place an order on Vastraa, we collect information necessary to fulfill your request (name, phone, delivery address, email).' },
          { title: 'Payment Security', description: 'We do not store your credit card, debit card, or UPI PIN on our servers. All transactions are securely processed through RBI-authorized payment gateways featuring 256-bit SSL encryption.' },
          { title: 'No Third-Party Selling', description: 'Your personal information is strictly confidential. We never sell, rent, or trade your personal details to outside marketing agencies.' },
          { title: 'Cookies & Preferences', description: 'We use minimal cookies to remember items in your shopping bag and maintain your session securely. You can manage or clear cookie preferences in your browser at any time.' },
        ],
      }),
    },
  },
  { timestamps: true }
)

const HomeCMS = mongoose.model('HomeCMS', homeCMSSchema)
export default HomeCMS
