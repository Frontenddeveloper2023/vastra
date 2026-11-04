import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useHomeCMS } from '../../context/HomeCMSContext'

// Renamed and Curated Desktop Banners (fallback)
import desktopTravel from '../../../public/slides/slide7.png'
import desktopWedding from '../../../public/slides/slide6.png'
import desktopFestival from '../../../public/slides/slide5.png'

// Curated Mobile Portrait Banners (fallback)
import mobileSlide1 from '../../../public/slides/m3.png'
import mobileSlide2 from '../../../public/slides/m1.png'
import mobileSlide3 from '../../../public/slides/m2.png'

const fallbackSlides = [
  {
    id: 1,
    image: desktopTravel,
    mobileImage: mobileSlide1,
    title: 'Festival Collection - A Moment of Festive Light & Joy',
    buttonText: 'SHOP NOW',
    buttonLink: '/collections',
    bgColor: '#751B1B',
  },
  {
    id: 2,
    image: desktopWedding,
    mobileImage: mobileSlide2,
    title: 'Wedding & Royal Edit - Saree Timeless Beauty',
    buttonText: 'SHOP NOW',
    buttonLink: '/collections',
    bgColor: '#0A3B28',
  },
  {
    id: 3,
    image: desktopFestival,
    mobileImage: mobileSlide3,
    title: 'Saree & Travel - Destination & Memories',
    buttonText: 'SHOP NOW',
    buttonLink: '/collections',
    bgColor: '#DF9F89',
  },
]

export default function HeroSlider() {
  const { cmsData } = useHomeCMS()

  // Filter active banners from CMS or fall back to defaults
  const slides = useMemo(() => {
    const raw = cmsData?.heroBanners
    if (Array.isArray(raw) && raw.length > 0) {
      const activeOnly = raw.filter((b) => b.active !== false)
      if (activeOnly.length > 0) return activeOnly
    }
    return fallbackSlides
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
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => {
      setIsTransitioning(false)
    }, 600)
  }, [isTransitioning])

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % slides.length)
  }, [currentIndex, goToSlide])

  // Auto advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide()
    }, 6000)
    return () => clearInterval(timer)
  }, [nextSlide])

  const current = slides[currentIndex]
  return (
    <section
      className="relative w-full overflow-hidden pt-[46px] sm:pt-[56px] md:pt-[108px]"
      style={{ paddingTop: 'var(--navbar-height, 46px)' }}
    >
      {/* ─── 1. MOBILE SLIDER (< 768px): Full Viewport Screen (minus top header & bottom bar) ─── */}
      <div className="relative w-full block md:hidden select-none overflow-hidden h-[calc(100svh-46px-56px)] max-h-[820px] min-h-[500px] bg-[#E6C6A6]">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
          >
            {/* Full-bleed portrait image */}
            <img
              src={s.mobileImage}
              alt={s.title}
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
        {/* Mobile Navigation Dots */}
        <div className="absolute bottom-4 sm:bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5">
          {slides.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => goToSlide(dotIdx)}
              aria-label={`Slide ${dotIdx + 1}`}
              className={`h-2.5 w-2.5 cursor-pointer rounded-none-full border transition-all duration-300 ${dotIdx === currentIndex
                ? 'border-black bg-black'
                : 'border-black/80 bg-transparent hover:bg-black/40'
                }`}
            />
          ))}
        </div>
      </div>
      {/* ─── 2. DESKTOP SLIDER (>= 768px: Exact 1024x438 Banner Ratio) ─── */}
      <div className="relative w-full hidden md:block select-none aspect-[1024/438] max-h-[580px]">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
          >
            <img
              src={s.image}
              alt={s.title}
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
        {/* Desktop Navigation Dots */}
        <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-4">
          {slides.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => goToSlide(dotIdx)}
              aria-label={`Slide ${dotIdx + 1}`}
              className={`h-[9px] w-[9px] md:h-[10px] md:w-[10px] cursor-pointer rounded-none-full border transition-all duration-300 ${dotIdx === currentIndex
                ? 'border-black bg-black'
                : 'border-black/60 bg-transparent hover:bg-black/30'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
