import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useHomeCMS } from '../../context/HomeCMSContext'
import { getCmsImageUrl } from '../../utils/imageHelper'

export default function HeroSlider() {
  const { cmsData, loading } = useHomeCMS()

  // Dynamic slides directly from CMS database
  const slides = useMemo(() => {
    const raw = cmsData?.heroBanners
    if (Array.isArray(raw)) {
      return raw.filter((b) => b && (b.active !== false))
    }
    return []
  }, [cmsData?.heroBanners])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Reset index if slides change and index is out of bounds
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0)
    }
  }, [slides.length, currentIndex])

  const goToSlide = useCallback((index) => {
    if (isTransitioning || slides.length === 0) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => {
      setIsTransitioning(false)
    }, 600)
  }, [isTransitioning, slides.length])

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return
    goToSlide((currentIndex + 1) % slides.length)
  }, [currentIndex, goToSlide, slides.length])

  // Auto advance every 6 seconds if there are multiple slides
  useEffect(() => {
    if (loading || slides.length <= 1) return
    const timer = setInterval(() => {
      nextSlide()
    }, 6000)
    return () => clearInterval(timer)
  }, [loading, nextSlide, slides.length])

  // Skeleton Loader while CMS banner data is loading
  if (loading) {
    return (
      <section
        className="relative w-full overflow-hidden"
        style={{ paddingTop: 'var(--navbar-height, 46px)' }}
      >
        {/* Mobile Skeleton: Full viewport height minus navbars */}
        <div className="relative w-full block md:hidden overflow-hidden h-[calc(100svh-46px-56px)] max-h-[820px] min-h-[500px] bg-stone-200 animate-pulse">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          
          {/* Skeleton Button Placeholder */}
          <div className="absolute bottom-12 sm:bottom-14 left-1/2 -translate-x-1/2 w-36 h-10 bg-stone-300 shadow-md" />
          
          {/* Skeleton Dots */}
          <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2.5">
            {[1, 2, 3].map((d) => (
              <div key={d} className="h-2.5 w-2.5 rounded-full bg-stone-300" />
            ))}
          </div>
        </div>

        {/* Desktop Skeleton: Exact 1024/438 Banner Ratio */}
        <div className="relative w-full hidden md:block aspect-[1024/438] max-h-[580px] bg-stone-200 overflow-hidden animate-pulse">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          
          {/* Skeleton Button Placeholder */}
          <div className="absolute bottom-12 md:bottom-14 left-1/2 -translate-x-1/2 w-40 h-11 bg-stone-300 shadow-md" />
          
          {/* Skeleton Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-4">
            {[1, 2, 3].map((d) => (
              <div key={d} className="h-2.5 w-2.5 rounded-full bg-stone-300" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // If no banners are added by Admin yet, don't render empty broken sliders
  if (!slides || slides.length === 0) {
    return null
  }

  const current = slides[currentIndex] || slides[0]

  return (
    <section
      className="relative w-full overflow-hidden pt-[46px] sm:pt-[56px] md:pt-[108px]"
      style={{ paddingTop: 'var(--navbar-height, 46px)' }}
    >
      {/* ─── 1. MOBILE SLIDER (< 768px): Full Viewport Screen (minus top header & bottom bar) ─── */}
      <div className="relative w-full block md:hidden select-none overflow-hidden h-[calc(100svh-46px-56px)] max-h-[820px] min-h-[500px] bg-[#E6C6A6]">
        {slides.map((s, idx) => (
          <div
            key={s._id || s.id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Full-bleed portrait image */}
            <img
              src={getCmsImageUrl(s.mobileImage || s.image)}
              alt={s.title || 'Vastraa Luxury Banner'}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Bottom Button Overlay */}
            <div className="absolute bottom-12 sm:bottom-14 left-1/2 z-20 -translate-x-1/2 flex items-center justify-center">
              <Link
                to={s.buttonLink || '/collections'}
                className="inline-flex min-h-[40px] min-w-[145px] items-center justify-center bg-black px-8 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-lg transition-colors duration-300 hover:bg-primary active:scale-95"
              >
                {s.buttonText || 'SHOP NOW'}
              </Link>
            </div>
          </div>
        ))}

        {/* Mobile Navigation Dots (only shown if > 1 slide) */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5">
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => goToSlide(dotIdx)}
                aria-label={`Slide ${dotIdx + 1}`}
                className={`h-2.5 w-2.5 cursor-pointer rounded-none-full border transition-all duration-300 ${
                  dotIdx === currentIndex
                    ? 'border-black bg-black'
                    : 'border-black/80 bg-transparent hover:bg-black/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── 2. DESKTOP SLIDER (>= 768px: Exact 1024x438 Banner Ratio) ─── */}
      <div className="relative w-full hidden md:block select-none aspect-[1024/438] max-h-[580px]">
        {slides.map((s, idx) => (
          <div
            key={s._id || s.id || idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={getCmsImageUrl(s.image)}
              alt={s.title || 'Vastraa Luxury Banner'}
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}

        {/* Desktop Button Overlay (Bottom Positioned) */}
        <div className="absolute bottom-12 md:bottom-14 left-1/2 z-20 -translate-x-1/2 flex items-center justify-center">
          <Link
            to={current?.buttonLink || '/collections'}
            className="inline-flex min-h-[44px] min-w-[160px] items-center justify-center bg-black px-8 py-3 font-sans text-xs md:text-sm font-semibold tracking-wider uppercase text-white transition-all duration-300 hover:bg-primary shadow-lg hover:shadow-xl active:scale-95"
          >
            {current?.buttonText || 'SHOP NOW'}
          </Link>
        </div>

        {/* Desktop Navigation Dots (only shown if > 1 slide) */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4">
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => goToSlide(dotIdx)}
                aria-label={`Slide ${dotIdx + 1}`}
                className={`h-[9px] w-[9px] md:h-[10px] md:w-[10px] cursor-pointer rounded-none-full border transition-all duration-300 ${
                  dotIdx === currentIndex
                    ? 'border-black bg-black'
                    : 'border-black/60 bg-transparent hover:bg-black/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
