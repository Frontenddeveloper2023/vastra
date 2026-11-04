import { useState, useMemo, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { allProductsList } from './collections'

// Gallery Asset Imports
import arrival1 from '../../assets/products/arrival-1.jpg'
import arrival2 from '../../assets/products/arrival-2.jpg'
import arrival3 from '../../assets/products/arrival-3.jpg'
import arrival4 from '../../assets/products/arrival-4.jpg'
import banarasi1 from '../../assets/featured/banarasi-1.jpg'
import banarasi2 from '../../assets/featured/banarasi-2.jpg'
import banarasi3 from '../../assets/featured/banarasi-3.jpg'
import banarasi4 from '../../assets/featured/banarasi-4.jpg'
import catBanarasi from '../../assets/categories/banarasi.jpg'
import catBridal from '../../assets/categories/bridal.jpg'
import catChanderi from '../../assets/categories/chanderi.jpg'
import catChiffon from '../../assets/categories/chiffon.jpg'
import catOrganza from '../../assets/categories/organza.jpg'
import catKanjivaram from '../../assets/categories/kanjivaram.jpg'

const colorSwatches = [
  { name: 'Maroon', hex: '#6D021B' },
  { name: 'Gold', hex: '#DEA53B' },
  { name: 'Green', hex: '#1B4D3E' },
  { name: 'Crimson', hex: '#8A1828' },
  { name: 'Pink', hex: '#D01E69' },
  { name: 'Cream', hex: '#F5EFE6' },
]

const categoryDesigns = {
  Banarasi: ['Zari Woven', 'Floral Motifs', 'Temple Border', 'Brocade Work'],
  Kanjivaram: ['Temple Border', 'Peacock Pallu', 'Korvai Zari', 'Floral Jaal'],
  Bridal: ['Heavy Zardozi', 'Royal Floral', 'Embroidered Border', 'Doli Barat'],
  Organza: ['Floral Digital', 'Scalloped Border', 'Zari Tissue', 'Cutwork Lace'],
  Handloom: ['Traditional Ikat', 'Tussar Striated', 'Tribal Motif', 'Minimalist'],
  Chiffon: ['Foil Print', 'Gotta Patti', 'Chikankari Motif', 'Geometric Buti'],
  Chanderi: ['Gold Foil Zari', 'Booti Weave', 'Chanderi Pattu', 'Zari Border'],
  Bandhani: ['Jaipuri Bandhej', 'Ghar Chola', 'Leheriya Dye', 'Rai Bandhani'],
  Paithani: ['Peacock Pallu', 'Muniya Border', 'Kalanjali Motif', 'Lotus Weave'],
  Partywear: ['Sequin Work', 'Shimmer Net', 'Mirror Work', 'Designer Drape'],
}

const categoryMaterials = {
  Banarasi: ['Pure Katan Silk', 'Tanchoi Silk', 'Georgette Silk', 'Chanderi Blend'],
  Kanjivaram: ['Pure Mulberry Silk', 'Temple Zari Silk', 'Brocade Silk', 'Soft Silk'],
  Bridal: ['Heritage Zardozi Silk', 'Velvet Border Silk', 'Raw Silk', 'Heavy Satin Silk'],
  Organza: ['Pure Tissue Organza', 'Glass Organza', 'Silk Organza', 'Kora Silk'],
  Handloom: ['Pure Tussar Silk', 'Ghicha Handloom', 'Matka Silk', 'Khadi Silk'],
  Chiffon: ['Pure Chiffon', 'Georgette Chiffon', 'Viscose Drape', 'Crepe Chiffon'],
  Chanderi: ['Chanderi Cotton Silk', 'Zari Tissue Chanderi', 'Mercerized Cotton', 'Chanderi Pattu'],
  Bandhani: ['Georgette Bandhani', 'Pure Silk Bandhej', 'Gaji Silk', 'Modal Satin'],
  Paithani: ['Pure Silk Paithani', 'Yeola Paithani Silk', 'Peshwai Silk', 'Tussar Paithani'],
  Partywear: ['Designer Net', 'Shimmer Tissue', 'Chiffon Georgette', 'Lycra Satin'],
}

const fallbackDesigns = ['Zari Woven', 'Floral Motifs', 'Temple Border', 'Brocade Work']
const fallbackMaterials = ['Pure Silk', 'Katan Silk', 'Tissue Organza', 'Raw Handloom']

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()

  // Find product by id (fallback to first product if not found)
  const product = useMemo(() => {
    const found = allProductsList.find((p) => String(p.id) === String(id))
    return found || allProductsList[0]
  }, [id])

  // Build 5-image gallery tailored to the product
  const gallery = useMemo(() => {
    const base = [product.image]
    if (product.category === 'Banarasi') {
      base.push(banarasi1, banarasi2, banarasi3, banarasi4)
    } else if (product.category === 'Kanjivaram') {
      base.push(arrival2, catKanjivaram, banarasi1, arrival3)
    } else if (product.category === 'Bridal') {
      base.push(catBridal, banarasi2, arrival1, arrival3)
    } else if (product.category === 'Organza') {
      base.push(catOrganza, arrival4, banarasi1, arrival1)
    } else if (product.category === 'Chiffon') {
      base.push(catChiffon, arrival4, arrival1, banarasi3)
    } else if (product.category === 'Chanderi') {
      base.push(catChanderi, arrival2, banarasi1, arrival3)
    } else {
      base.push(catBanarasi, arrival3, arrival1, banarasi4)
    }
    return base.slice(0, 5)
  }, [product])

  // Dynamic 3 Variants: Color, Design, Material
  const designs = useMemo(() => {
    return categoryDesigns[product.category] || fallbackDesigns
  }, [product.category])

  const materials = useMemo(() => {
    return categoryMaterials[product.category] || fallbackMaterials
  }, [product.category])

  const [activeImage, setActiveImage] = useState(gallery[0])
  const [selectedColor, setSelectedColor] = useState(product.color || 'Green')
  const [selectedDesign, setSelectedDesign] = useState(designs[0])
  const [selectedMaterial, setSelectedMaterial] = useState(materials[0])
  const [quantity, setQuantity] = useState(1)
  const [addedAnimation, setAddedAnimation] = useState(false)

  // Reset states when URL id changes
  useEffect(() => {
    setActiveImage(gallery[0])
    setSelectedColor(product.color || 'Green')
    setSelectedDesign(designs[0])
    setSelectedMaterial(materials[0])
    setQuantity(1)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [id, gallery, product, designs, materials])

  // Discount percentage
  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  )

  // Handle Add to Cart with all 3 variants (Color, Design, Material)
  const handleAddToCart = () => {
    addToCart(
      {
        ...product,
        color: selectedColor,
        design: selectedDesign,
        material: selectedMaterial,
        size: 'Free Size',
      },
      true,
      quantity
    )
    setAddedAnimation(true)
    setTimeout(() => setAddedAnimation(false), 2000)
  }

  // Related products
  const relatedProducts = useMemo(() => {
    return allProductsList
      .filter((p) => p.id !== product.id && p.category === product.category)
      .slice(0, 4)
  }, [product])

  return (
    <div className="w-full bg-[#FAF7F2] min-h-screen pt-[76px] sm:pt-[84px] md:pt-[136px] lg:pt-[144px] pb-20 px-3 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* ─── Product Details Main Section (Matching Reference Layout) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ══════════ LEFT COLUMN: Gallery with Vertical Thumbnails ══════════ */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 lg:gap-5">

            {/* 1. Vertical Thumbnail Strip (Far Left) */}
            <div className="flex sm:flex-col gap-2.5 sm:gap-3 overflow-x-auto sm:overflow-y-auto shrink-0 pb-2 sm:pb-0 scrollbar-none sm:max-h-[620px]">
              {gallery.map((img, idx) => {
                const isActive = activeImage === img
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    onMouseEnter={() => setActiveImage(img)}
                    className={`relative w-16 h-20 sm:w-18 sm:h-24 lg:w-20 lg:h-26 rounded-none-xl overflow-hidden border-2 transition-all cursor-pointer bg-[#F2ECE2] shrink-0 ${isActive
                        ? 'border-primary shadow-md ring-2 ring-primary/20 scale-[1.02]'
                        : 'border-[#EAE1D5] hover:border-secondary opacity-75 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                  </button>
                )
              })}
            </div>

            {/* 2. Main Large Featured Image Frame */}
            <div className="relative flex-1 aspect-[3/4] sm:aspect-[4/5] max-h-[620px] w-full bg-[#F2ECE2] rounded-none-2xl sm:rounded-none-3xl overflow-hidden border border-[#EDE4D8] shadow-lg group">
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />


              {/* Discount Tag (Top-Left) */}
              {discountPercent > 0 && (
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 bg-[#6D021B] text-[#FFF] text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-none-md shadow-xs">
                  {discountPercent}% OFF
                </div>
              )}
            </div>

          </div>

          {/* ══════════ RIGHT COLUMN: Product Information & Add to Cart ══════════ */}
          <div className="lg:col-span-5 flex flex-col">

            {/* Category / Collection Tag */}
            <span className="text-xs uppercase tracking-widest font-semibold text-secondary">
              {product.category} • The House of Sarees
            </span>

            {/* Product Title */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1F1713] mt-1.5 leading-tight">
              {product.title}
            </h1>

            {/* Price Row: Bold Price, Strikethrough Original, Red Discount % */}
            <div className="mt-4 flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-bold text-[#1F1713]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-base sm:text-lg text-stone-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-sm sm:text-base font-bold text-[#EF4444]">
                {discountPercent}% OFF
              </span>
            </div>

            {/* Product Short Description */}
            <p className="mt-4 text-xs sm:text-sm text-[#73655B] leading-relaxed">
              A handcrafted luxury saree woven with master artisan precision, featuring authentic zari borders, pure woven fabric, and a regal pallu. Lightweight, fluid, and perfect for celebratory and ceremonial occasions.
            </p>

            <div className="my-6 border-t border-[#EDE4D8]" />

            {/* 1. VARIANT: COLOR (Matching Reference Image) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F1713]">
                  COLOR: <span className="font-semibold text-primary capitalize ml-1">{selectedColor}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                {colorSwatches.map((color) => {
                  const isSelected = selectedColor.toLowerCase() === color.name.toLowerCase()
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      className={`relative w-8 h-8 rounded-none-full transition-transform cursor-pointer border border-black/10 ${isSelected ? 'scale-110 ring-2 ring-primary ring-offset-2' : 'hover:scale-105'
                        }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center text-white text-xs drop-shadow-sm font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. VARIANT: DESIGN (Matching Pill Style) */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F1713]">
                  DESIGN: <span className="font-semibold text-primary ml-1">{selectedDesign}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {designs.map((dsg) => {
                  const isSelected = selectedDesign === dsg
                  return (
                    <button
                      key={dsg}
                      type="button"
                      onClick={() => setSelectedDesign(dsg)}
                      className={`px-4 py-2 rounded-none-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${isSelected
                          ? 'bg-[#1F1713] text-white border-[#1F1713] shadow-xs'
                          : 'bg-white text-[#40342C] border-[#EDE4D8] hover:border-primary hover:text-primary'
                        }`}
                    >
                      {dsg}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3. VARIANT: MATERIAL (Matching Pill Style) */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1F1713]">
                  MATERIAL: <span className="font-semibold text-primary ml-1">{selectedMaterial}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {materials.map((mat) => {
                  const isSelected = selectedMaterial === mat
                  return (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => setSelectedMaterial(mat)}
                      className={`px-4 py-2 rounded-none-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${isSelected
                          ? 'bg-[#1F1713] text-white border-[#1F1713] shadow-xs'
                          : 'bg-white text-[#40342C] border-[#EDE4D8] hover:border-primary hover:text-primary'
                        }`}
                    >
                      {mat}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3. Quantity Selector */}
            <div className="mt-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F1713] block mb-2.5">
                Quantity:
              </span>
              <div className="inline-flex items-center bg-white border border-[#EDE4D8] rounded-none-xl shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center text-stone-600 hover:text-primary disabled:text-stone-300 disabled:cursor-not-allowed cursor-pointer text-lg font-medium transition-colors"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-12 text-center text-sm font-bold text-[#1F1713] select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-10 h-10 flex items-center justify-center text-stone-600 hover:text-primary cursor-pointer text-lg font-medium transition-colors"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* 4. ONLY "Add to Cart" Button (Buy Now removed per user request) */}
            <div className="mt-8">
              <button
                type="button"
                onClick={handleAddToCart}
                className={`w-full py-3.5 sm:py-4 px-6 rounded-none-xl sm:rounded-none-2xl font-semibold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2.5 cursor-pointer shadow-md transition-all duration-200 active:scale-98 ${addedAnimation
                    ? 'bg-[#15803D] text-white shadow-lg'
                    : 'bg-[#6D021B] hover:bg-[#580015] text-white'
                  }`}
              >
                {addedAnimation ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    <span>Add to Cart • ₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                  </>
                )}
              </button>
            </div>



          </div>

        </div>



      </div>
    </div>
  )
}

