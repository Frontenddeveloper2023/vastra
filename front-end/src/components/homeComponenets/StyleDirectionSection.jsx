import { Link } from 'react-router-dom'
import { useHomeCMS } from '../../context/HomeCMSContext'

export default function StyleDirectionSection() {
  const { cmsData } = useHomeCMS()
  const sectionData = cmsData?.styleDirection || {}
  const moods = sectionData.moods || []
  const bannerImg = sectionData.backgroundImage || `${import.meta.env.BASE_URL || '/'}slides/banner.png`

  return (
    <section className="w-full relative overflow-hidden m-0 p-0">
      {/* ─── FULL-WIDTH BACKGROUND BANNER ─── */}
      <div className="relative w-full min-h-[460px] sm:min-h-[520px] md:min-h-[580px] lg:min-h-[640px] flex items-center">
        {/* Banner Image taking 100% full width with zero borders, zero rounded-none, and zero margins */}
        <img
          src={bannerImg}
          alt="Style Direction - Fashion For Every Mood"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Ambient Dark Gradient on Left for Enhanced Contrast and Depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

        {/* Content Container */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20 relative z-10 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Left Column: Headline, Description & Shop Now Action */}
            <div className="lg:col-span-5 flex flex-col items-start text-left">

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-normal tracking-tight text-[#FFF8ED] leading-[1.14] mb-3 sm:mb-4">
                {sectionData.title || 'Fashion For'}{' '}
                <span className="text-secondary italic">
                  {sectionData.highlightTitle || 'Every Mood'}
                </span>
              </h2>

              <p className="text-xs sm:text-sm md:text-base font-light text-[#E0D2C7] leading-relaxed max-w-md mb-6 sm:mb-8">
                {sectionData.description ||
                  'Casual, Formal, Party or Everyday celebratory grace. Handcrafted silhouettes thoughtfully curated so you always feel radiant.'}
              </p>

              {/* Shop Now CTA Button */}
              <Link
                to={sectionData.buttonUrl || '/collections'}
                className="group inline-flex items-center gap-2.5 rounded-none-none bg-secondary hover:bg-white text-primary-dark font-bold px-7 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm tracking-[0.14em] uppercase transition-all duration-300 shadow-[0_10px_30px_rgba(222,165,59,0.35)] hover:shadow-2xl hover:scale-105 active:scale-95 cursor-pointer border border-secondary"
              >
                <span>{sectionData.buttonText || 'Shop All Moods'}</span>
                <svg
                  className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            {/* Right Column: 3 Occasion Mood Cards */}
            <div className="lg:col-span-7 w-full">
              <div className="grid grid-cols-3 gap-2.5 sm:gap-4 md:gap-5 justify-items-stretch w-full">
                {moods.map((mood, idx) => (
                  <Link
                    key={mood.id || idx}
                    to={mood.url || '/collections'}
                    className="group relative flex flex-col w-full rounded-none-none overflow-hidden bg-[#181014]/90 hover:bg-[#20151B] border border-secondary/35 hover:border-secondary p-0 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-10px_rgba(222,165,59,0.35)] focus:outline-none backdrop-blur-xs"
                  >
                    {/* Portrait Image Frame - sharp corners with zoom */}
                    <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden rounded-none-none bg-[#20151B]">
                      <img
                        src={mood.image}
                        alt={mood.title}
                        loading="lazy"
                        className="h-full w-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
                      />

                      {/* Shimmer light sweep */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-10" />

                      {/* Vignette Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                      {/* Floating Indicator Button on Hover */}
                      <div className="absolute bottom-2.5 right-2.5 w-6 h-6 sm:w-7 sm:h-7 rounded-none-none bg-secondary text-primary-dark flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-md z-20">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                      </div>
                    </div>

                    {/* Mood Label Banner at Bottom */}
                    <div className="p-2 sm:p-3 text-center bg-[#170E12] group-hover:bg-[#23151B] transition-colors duration-300 border-t border-secondary/20">
                      <span className="text-[11px] sm:text-xs md:text-sm font-bold tracking-[0.2em] uppercase text-white group-hover:text-secondary transition-colors duration-200 block">
                        {mood.title}
                      </span>
                      <span className="hidden sm:block text-[9px] text-[#B8A395] mt-0.5 tracking-wider truncate">
                        {mood.subtitle}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

