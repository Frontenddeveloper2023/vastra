import HeroSlider from '../../components/homeComponenets/HeroSlider'
import NewArrivalsSection from '../../components/homeComponenets/NewArrivalsSection'
import CategorySection from '../../components/homeComponenets/CategorySection'
import StyleDirectionSection from '../../components/homeComponenets/StyleDirectionSection'
import FeaturedCategorySection from '../../components/homeComponenets/FeaturedCategorySection'

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Banner Slider */}
      <HeroSlider />

      {/* 1st Content Section: New Arrivals */}
      <NewArrivalsSection />

      {/* 2nd Content Section: Shop By Category */}
      <CategorySection />

      {/* 3rd Content Section: Style Direction (Fashion For Every Mood) */}
      <StyleDirectionSection />

      {/* 4th Content Section: Featured Category (Banarasi Sarees) */}
      <FeaturedCategorySection />
    </div>
  )
}
