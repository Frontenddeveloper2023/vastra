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

export default function About() {
  // Always scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  const whyChooseFeatures = [

    {
      icon: ShieldCheck,
      title: 'Silk Mark Certified Purity',
      description:
        'Every saree carries authentic purity accreditation, guaranteeing 100% natural katan, mulberry, and tussar silks without synthetic blends.',
    },
    {
      icon: Award,
      title: 'Generational Master Weavers',
      description:
        'Hand-loomed in authentic textile capitals—Banaras, Kanchipuram, Chanderi, and Paithan—preserving techniques passed down through centuries.',
    },
    {
      icon: Gem,
      title: 'Real Zari & Intricate Motifs',
      description:
        'Embellished with pure zari, heritage kadwa bootas, traditional meenakari, and timeless temple borders that endure for generations.',
    },

  ]

  const stats = [
    { value: '25+', label: 'Years of Heritage' },
    { value: '500+', label: 'Master Weavers' },
    { value: '100%', label: 'Certified Pure Silk' },
    { value: '25,000+', label: 'Celebrations Draped' },
  ]

  return (
    <div className="w-full bg-[#FAF7F2] pt-[76px] sm:pt-[84px] md:pt-[136px] lg:pt-[144px] pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* ─── Section 1: Hero Story (Left Content, Right Image) ─── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center mb-6 sm:mb-8">

          {/* Left Column: Brand Story & Heritage (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-center">

            {/* Main Title in Playfair Display Serif */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary tracking-tight font-serif leading-[1.2] mb-3">
              Weaving Timeless Elegance &amp; Cultural Heritage
            </h1>

            {/* Narrative Paragraphs */}
            <div className="space-y-3 text-xs sm:text-sm lg:text-base text-[#5C4A3E] leading-relaxed">
              <p>
                Founded on an enduring reverence for India’s rich handloom traditions,{' '}
                <strong className="text-[#1F1713] font-semibold">Vastraa</strong> is a sanctuary of heirloom
                textiles. From the sacred ghats of Varanasi to the temple town looms of Kanchipuram, every saree in our
                curation is an ode to patience, dexterity, and royal poise.
              </p>
              <p>
                We believe that a saree is more than six yards of fabric—it is living history, woven rhythmically by
                generational master artisans who breathe soul into every warp and weft. By uniting age-old motifs with
                contemporary drape styling, we craft pieces destined to become treasured family heirlooms.
              </p>
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
                  src={aboutPortrait}
                  alt="Vastraa Master Handloom Heritage Saree"
                  className="w-full h-[300px] sm:h-[380px] lg:h-[420px] object-cover object-top hover:scale-103 transition-transform duration-700"
                />
              </div>

            </div>
          </div>

        </section>

        {/* ─── Section 2: Vision & Mission ─── */}
        <section className="mb-6 sm:mb-8">

          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-3.5 sm:mb-5">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary font-serif">
              Our Vision &amp; Mission
            </h2>
            <p className="text-xs sm:text-sm text-[#73655B] mt-1">
              Rooted in reverence for tradition, driven by uncompromising quality and ethical artisan partnership.
            </p>
          </div>

          {/* Cards Grid: Vision & Mission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">

            {/* Card 1: Our Vision */}
            <div className="bg-white rounded-none-2xl border border-[#EDE4D8] p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-secondary transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-none-xl border border-secondary/40 bg-[#FFFDF9] flex items-center justify-center mb-3 text-primary group-hover:bg-primary group-hover:text-secondary group-hover:border-primary transition-all duration-300 shadow-2xs">
                  <Compass className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-primary font-serif mb-2">
                  Our Vision
                </h3>
                <p className="text-xs sm:text-sm text-[#5C4A3E] leading-relaxed">
                  To become the world’s most trusted ambassador of Indian textile art—bridging historic handloom
                  clusters with modern haute couture, while safeguarding the priceless heritage of traditional master
                  weavers for future generations.
                </p>
              </div>
            </div>

            {/* Card 2: Our Mission */}
            <div className="bg-white rounded-none-2xl border border-[#EDE4D8] p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-secondary transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-none-xl border border-secondary/40 bg-[#FFFDF9] flex items-center justify-center mb-3 text-primary group-hover:bg-primary group-hover:text-secondary group-hover:border-primary transition-all duration-300 shadow-2xs">
                  <Target className="w-5 h-5" strokeWidth={1.75} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-primary font-serif mb-2">
                  Our Mission
                </h3>
                <p className="text-xs sm:text-sm text-[#5C4A3E] leading-relaxed">
                  To deliver authentic, heirloom-quality sarees crafted from 100% certified pure silks through transparent
                  artisan patronage, fair-trade pricing, and bespoke care that celebrates every milestone in a woman’s life.
                </p>
              </div>
            </div>

          </div>

        </section>

        {/* ─── Section 3: Why Choose Vastraa ─── */}
        <section className="mb-0">

          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-3.5 sm:mb-5">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary font-serif">
              Why Choose Vastraa
            </h2>
            <p className="text-xs sm:text-sm text-[#73655B] mt-1">
              Every thread reflects our unwavering commitment to purity, authentic craftsmanship, and royal grace.
            </p>
          </div>

          {/* 3 Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {whyChooseFeatures.map((feat, idx) => {
              const IconComp = feat.icon
              return (
                <div
                  key={idx}
                  className="bg-white rounded-none-2xl border border-[#EDE4D8] p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-secondary transition-all duration-300 flex flex-col group"
                >
                  <div className="w-10 h-10 rounded-none-xl border border-secondary/40 bg-[#FFFDF9] text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-secondary group-hover:border-primary transition-all duration-300 shadow-2xs">
                    <IconComp className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-[#1F1713] font-serif mb-2 group-hover:text-primary transition-colors">
                    {feat.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#6B5E55] leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              )
            })}
          </div>

        </section>



      </div>
    </div>
  )
}

