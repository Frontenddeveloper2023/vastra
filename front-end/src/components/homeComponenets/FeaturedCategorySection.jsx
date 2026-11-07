import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useHomeCMS } from '../../context/HomeCMSContext'
import productService from '../../services/productService'
import { getCmsImageUrl } from '../../utils/imageHelper'

export default function FeaturedCategorySection() {
  const { cmsData } = useHomeCMS()
  const showcases = cmsData?.categoryShowcases || []

  const [dbProducts, setDbProducts] = useState([])

  useEffect(() => {
    productService
      .getAll({ limit: 100 })
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.products || []
        setDbProducts(list)
      })
      .catch((err) => console.error('Error fetching showcase products:', err))
  }, [])

  if (showcases.length === 0) return null

  return (
    <div className="w-full flex flex-col">
      {showcases.map((showcase) => {
        const productIds = showcase.productIds || []
        // Look up the 4 selected products from DB, or fallback to first 4 matching category
        let products = productIds
          .map((id) => dbProducts.find((p) => String(p._id || p.id) === String(id)))
          .filter(Boolean)

        if (products.length === 0) {
          products = dbProducts
            .filter((p) => (p.category || '').toLowerCase() === showcase.categoryName.toLowerCase())
            .slice(0, 4)
        }

        return (
          <section
            key={showcase.id}
            className="w-full relative bg-[#FAF7F2] bg-gradient-to-b from-[#FDFBF7] via-[#FAF6F0] to-[#F3EDE3] text-[#1F1713] flex flex-col items-center justify-center overflow-hidden border-t border-[#E8DDCE] border-b border-[#E8DDCE]"
            style={{
              paddingTop: 'clamp(32px, 4vw, 52px)',
              paddingBottom: 'clamp(36px, 4.5vw, 56px)',
              width: '100%',
            }}
          >
            {/* Warm Champagne & Amber Aura Glows */}
            <div className="absolute -top-24 left-1/3 w-[650px] h-[320px] bg-[#DEA53B]/10 rounded-none-full blur-[110px] pointer-events-none" />
            <div className="absolute -bottom-20 left-10 w-96 h-96 bg-[#C87D32]/8 rounded-none-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 -right-20 w-80 h-80 bg-[#6D021B]/5 rounded-none-full blur-[90px] pointer-events-none" />

            {/* Subtle Warm Grid Pattern */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#6D021B 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />

            {/* Centered Main Container */}
            <div
              className="w-full max-w-7xl mx-auto px-3 sm:px-6 md:px-8 lg:px-12 flex flex-col relative z-10"
              style={{ marginLeft: 'auto', marginRight: 'auto', width: '100%' }}
            >
              {/* Section Header */}
              <div
                className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-left w-full"
                style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}
              >
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal tracking-tight text-[#1F1713] leading-tight">
                    {showcase.title || showcase.categoryName}{' '}
                    <span className="text-primary italic font-serif">
                      {showcase.highlightTitle || 'Sarees'}
                    </span>
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm md:text-base font-light text-[#736357] tracking-wide">
                    {showcase.description ||
                      `Handcrafted pure weaves capturing timeless royal elegance & authentic heritage`}
                  </p>
                </div>

                <Link
                  to={showcase.exploreUrl || `/collections?category=${encodeURIComponent(showcase.categoryName)}`}
                  className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:text-secondary transition-colors shrink-0 self-start sm:self-auto"
                >
                  <span className="tracking-wider uppercase text-[11px] sm:text-xs">
                    {showcase.exploreText || `Explore All ${showcase.categoryName}`}
                  </span>
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 transform transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>

              {/* 4 in a row desktop, 2 in a row mobile */}
              <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 justify-items-stretch">
                {products.map((product) => {
                  const productUrl = `/product/${product.id}`

                  return (
                    <div
                      key={product.id}
                      className="group relative flex flex-col bg-white border border-[#E8DDCE] rounded-none-none p-0 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_-10px_rgba(109,2,27,0.15)] hover:border-primary"
                    >
                      {/* Image Frame */}
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-none-none bg-[#F5EFE6]">
                        {/* Category Tag Badge */}
                        <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
                          <span className="bg-primary text-white text-[9.5px] tracking-[0.16em] uppercase font-bold px-2 py-0.5 shadow-sm border border-secondary/40">
                            {product.category}
                          </span>
                        </div>

                        <Link to={productUrl} className="block w-full h-full">
                          <img
                            src={getCmsImageUrl(product.image || product.variants?.[0]?.image)}
                            alt={product.title}
                            loading="lazy"
                            className="h-full w-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-108"
                          />
                        </Link>

                        {/* Shimmer sweep animation */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />

                        {/* Bottom Vignette */}
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none z-10" />

                        {/* "VIEW" Button */}
                        <div className="absolute bottom-2.5 sm:bottom-3 inset-x-2 sm:inset-x-4 z-20 transition-all duration-300 transform group-hover:opacity-0 group-hover:pointer-events-none group-hover:translate-y-2">
                          <Link
                            to={productUrl}
                            className="w-full py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 rounded-none-none text-[11px] sm:text-xs md:text-[13px] font-bold tracking-[0.05em] sm:tracking-[0.08em] uppercase transition-all duration-200 flex items-center justify-center gap-1.5 sm:gap-2 shadow-xl border bg-primary text-white border-secondary/50 hover:bg-secondary hover:text-primary-dark"
                          >
                            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                            <span className="truncate">View</span>
                          </Link>
                        </div>

                        {/* HOVER REVEAL: Saree Title & Price */}
                        <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3.5 md:p-4 z-20 flex flex-col justify-end bg-gradient-to-t from-[#140B09] via-[#1A0E0A]/95 to-transparent transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] transform translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                          <Link to={productUrl} className="block">
                            <h3 className="font-serif text-xs sm:text-sm md:text-base lg:text-[17px] font-semibold text-[#FFF8ED] hover:text-secondary transition-colors duration-200 truncate leading-snug">
                              {product.title}
                            </h3>
                          </Link>

                          <div className="mt-1 sm:mt-1.5 flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm md:text-base lg:text-[17px] font-bold text-secondary">
                              ₹{product.price}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[10px] sm:text-xs text-[#A89487] line-through font-normal">
                                ₹{product.originalPrice}
                              </span>
                            )}
                          </div>

                          <Link
                            to={productUrl}
                            className="mt-2 sm:mt-2.5 w-full py-1.5 sm:py-2 text-[10px] sm:text-[11px] md:text-xs font-bold uppercase tracking-wider text-primary bg-secondary hover:bg-white transition-colors cursor-pointer text-center block"
                          >
                            View Product →
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
