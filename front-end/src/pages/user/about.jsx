import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Compass,
  Target,
  ShieldCheck,
  Award,
  HeartHandshake,
  Truck,
  Scissors,
  CheckCircle2,
  ArrowRight,
  Gem,
} from 'lucide-react'
import aboutPortrait from '../../assets/banner-saree-portrait-1.jpg'
import { useHomeCMS } from '../../context/HomeCMSContext'
import { getCmsImageUrl } from '../../utils/imageHelper'

export default function About() {
  const { cmsData } = useHomeCMS()
  const about = cmsData?.aboutUs || {}

  // Always scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  const defaultWhyChoose = [
    {
      title: 'Silk Mark Certified Purity',
      description:
        'Every saree carries authentic purity accreditation, guaranteeing 100% natural katan, mulberry, and tussar silks without synthetic blends.',
    },
    {
      title: 'Generational Master Weavers',
      description:
        'Hand-loomed in authentic textile capitals—Banaras, Kanchipuram, Chanderi, and Paithan—preserving techniques passed down through centuries.',
    },
    {
      title: 'Real Zari & Intricate Motifs',
      description:
        'Embellished with pure zari, heritage kadwa bootas, traditional meenakari, and timeless temple borders that endure for generations.',
    },
  ]

  const featureIcons = [ShieldCheck, Award, Gem, Sparkles, HeartHandshake, Scissors]

  const features =
    about.whyChooseItems && about.whyChooseItems.length > 0
      ? about.whyChooseItems
      : defaultWhyChoose

  const heroTitle = about.heroTitle || 'Weaving Timeless Elegance & Cultural Heritage'
  const p1 =
    about.paragraph1 ||
    'Founded on an enduring reverence for India’s rich handloom traditions, Vastraa is a sanctuary of heirloom textiles. From the sacred ghats of Varanasi to the temple town looms of Kanchipuram, every saree in our curation is an ode to patience, dexterity, and royal poise.'
  const p2 =
    about.paragraph2 ||
    'We believe that a saree is more than six yards of fabric—it is living history, woven rhythmically by generational master artisans who breathe soul into every warp and weft. By uniting age-old motifs with contemporary drape styling, we craft pieces destined to become treasured family heirlooms.'
  const portraitImg = about.portraitImage ? getCmsImageUrl(about.portraitImage) : aboutPortrait

  const visionTitle = about.visionTitle || 'Our Vision'
  const visionText =
    about.visionText ||
    'To become the world’s most trusted ambassador of Indian textile art—bridging historic handloom clusters with modern haute couture, while safeguarding the priceless heritage of traditional master weavers for future generations.'

  const missionTitle = about.missionTitle || 'Our Mission'
  const missionText =
    about.missionText ||
    'To deliver authentic, heirloom-quality sarees crafted from 100% certified pure silks through transparent artisan patronage, fair-trade pricing, and bespoke care that celebrates every milestone in a woman’s life.'

  const whyChooseTitle = about.whyChooseTitle || 'Why Choose Vastraa'

  return (
    <div className="w-full bg-[#FAF7F2] pt-[76px] sm:pt-[84px] md:pt-[136px] lg:pt-[144px] pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* ─── Section 1: Hero Story (Left Content, Right Image) ─── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center mb-6 sm:mb-8">

          {/* Left Column: Brand Story & Heritage (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center">

            {/* Main Title in Playfair Display Serif */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight font-serif leading-[1.2] mb-3">
              {heroTitle}
            </h1>

            {/* Narrative Paragraphs */}
            <div className="space-y-3 text-xs sm:text-sm lg:text-base text-[#5C4A3E] leading-relaxed">
              <p>{p1}</p>
              {p2 && <p>{p2}</p>}
            </div>

          </div>

          {/* Right Column: Editorial Portrait Image (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">

              {/* Decorative Subtle Gold Backing Frame */}
              <div className="absolute -inset-2.5 rounded-none-3xl border-2 border-secondary/35 -rotate-1 hidden sm:block pointer-events-none" />

              {/* Main Image Frame */}
              <div className="relative rounded-none-2xl sm:rounded-none-3xl overflow-hidden border border-[#EDE4D8] shadow-md bg-white">
                <img
                  src={portraitImg}
                  alt="Vastraa Master Handloom Heritage Saree"
                  className="w-full h-[300px] sm:h-[380px] lg:h-[420px] object-cover object-top hover:scale-103 transition-transform duration-700"
                />
              </div>

            </div>
          </div>

        </section>

        {/* ─── Combined Section: Vision & Mission (Left) + Why Choose Vastraa (Right) ─── */}
        <section className="mb-0 pt-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Left Column (6 cols): Our Vision & Mission with refined bullet points */}
            <div className="lg:col-span-6 flex flex-col justify-start">
              <div className="mb-4 sm:mb-5 border-b border-[#EDE4D8] pb-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-secondary block mb-1">
                  Purpose &amp; Direction
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary font-serif">
                  Our Vision &amp; Mission
                </h2>
              </div>

              <div className="space-y-4">
                {/* Vision Bullet Block */}
                <div className="flex items-start gap-3 group">
                  <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-primary font-serif mb-1">
                      {visionTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C4A3E] leading-relaxed">
                      {visionText}
                    </p>
                  </div>
                </div>

                {/* Mission Bullet Block */}
                <div className="flex items-start gap-3 group pt-1">
                  <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-primary font-serif mb-1">
                      {missionTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5C4A3E] leading-relaxed">
                      {missionText}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (6 cols): Why Choose Vastraa with refined bullet points */}
            <div className="lg:col-span-6 flex flex-col justify-start">
              <div className="mb-4 sm:mb-5 border-b border-[#EDE4D8] pb-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-secondary block mb-1">
                  Purity &amp; Trust
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary font-serif">
                  {whyChooseTitle}
                </h2>
              </div>

              <div className="space-y-4">
                {features.map((feat, idx) => (
                  <div key={feat.id || idx} className="flex items-start gap-3 group">
                    <span className="w-2 h-2 rounded-full bg-secondary mt-2 shrink-0 group-hover:scale-125 transition-transform" />
                    <div className="flex-1">
                      <h4 className="text-sm sm:text-base font-bold text-[#1F1713] font-serif mb-0.5 group-hover:text-primary transition-colors">
                        {feat.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#6B5E55] leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>



      </div>
    </div>
  )
}


