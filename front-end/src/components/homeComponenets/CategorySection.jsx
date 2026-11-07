import { Link } from 'react-router-dom'
import { useHomeCMS } from '../../context/HomeCMSContext'
import { getCmsImageUrl } from '../../utils/imageHelper'

export default function CategorySection() {
  const { cmsData } = useHomeCMS()
  const sectionData = cmsData?.shopByCategory || {}
  const categories = sectionData.selectedCategories || []

  // If admin has removed all category cards, hide the section gracefully
  if (categories.length === 0) {
    return null
  }

  return (
    <section
      className="w-full relative bg-[#F2E9DE] bg-gradient-to-b from-[#F5EEE4] via-[#F2E9DE] to-[#EAE0D3] text-[#1F1713] flex flex-col items-center justify-center overflow-hidden border-t border-[#DFD1BF] border-b border-[#DFD1BF]"
      style={{
        paddingTop: 'clamp(32px, 4vw, 52px)',
        paddingBottom: 'clamp(36px, 4.5vw, 56px)',
        width: '100%',
      }}
    >
      {/* Luxurious Warm Amber & Champagne Aura Glows */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-[#DEA53B]/10 rounded-none-full blur-[110px] pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-96 h-96 bg-[#C4933F]/10 rounded-none-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-[#6D021B]/5 rounded-none-full blur-[80px] pointer-events-none" />

      {/* Subtle Warm Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#6D021B 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Centered Main Container */}
      <div
        className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 md:px-8 lg:px-12 flex flex-col relative z-10"
        style={{ marginLeft: 'auto', marginRight: 'auto', width: '100%' }}
      >
        {/* Section Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-3 text-left w-full"
          style={{ marginBottom: 'clamp(20px, 3vw, 32px)' }}
        >
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-normal tracking-tight text-[#1F1713] leading-tight">
              {sectionData.title || 'Shop by'}{' '}
              <span className="text-primary italic font-serif">
                {sectionData.highlightTitle || 'Category'}
              </span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm md:text-base font-light text-[#6F5F53] tracking-wide">
              {sectionData.description ||
                'Discover curated collections tailored to celebrate timeless grace & Indian heritage'}
            </p>
          </div>

          <Link
            to={sectionData.seeAllUrl || '/collections'}
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary hover:text-secondary transition-colors shrink-0 self-start sm:self-auto"
          >
            <span className="tracking-wider uppercase text-[11px] sm:text-xs">
              {sectionData.seeAllText || 'See all categories'}
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

        {/* 2 on Mobile, 3 on Desktop */}
        <div className="w-full grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 lg:gap-6 justify-items-stretch">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.href || '/collections'}
              className="category-mobile-card group relative flex flex-col w-full rounded-none-none overflow-hidden bg-white border border-[#DFD1BF] hover:border-primary p-0 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_-10px_rgba(109,2,27,0.18)] focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {/* Image Frame - Edge to Edge, 100% crisp and clear */}
              <div className="relative aspect-[3/4] lg:aspect-[4/5] w-full overflow-hidden rounded-none-none bg-[#18212C]">
                <img
                  src={getCmsImageUrl(category.image)}
                  alt={category.title}
                  loading="lazy"
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-108"
                />

                {/* Shimmer sweep animation across the image on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />

                {/* Subtle bottom vignette to ensure text contrast */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none z-10" />

                {/* Text Drawer - Always Visible on All Screens */}
                <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 md:p-4 z-20 flex items-center justify-between gap-1 translate-y-0 opacity-100">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-[11px] sm:text-sm md:text-base lg:text-[18px] font-semibold text-[#FFF8ED] group-hover:text-secondary transition-colors duration-200 leading-tight truncate">
                      {category.title}
                    </h3>
                    <p className="text-[8px] sm:text-xs text-[#E1D1C3] mt-0.5 font-normal tracking-wide truncate">
                      {category.itemCount}
                    </p>
                  </div>

                  {/* Golden Arrow Button */}
                  <div
                    className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-9 lg:h-9 rounded-none-none bg-secondary text-primary-dark flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-md shrink-0 border border-white/20"
                    aria-hidden="true"
                  >
                    <svg
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 transform transition-transform duration-300 group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
