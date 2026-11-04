import React, { createContext, useContext, useState, useEffect } from 'react'

// Assets for defaults
import arrival1 from '../assets/products/arrival-1.jpg'
import arrival2 from '../assets/products/arrival-2.jpg'
import arrival3 from '../assets/products/arrival-3.jpg'
import arrival4 from '../assets/products/arrival-4.jpg'
import banarasi1 from '../assets/featured/banarasi-1.jpg'
import banarasi2 from '../assets/featured/banarasi-2.jpg'
import banarasi3 from '../assets/featured/banarasi-3.jpg'
import banarasi4 from '../assets/featured/banarasi-4.jpg'
import banarasiImg from '../assets/categories/banarasi.jpg'
import kanjivaramImg from '../assets/categories/kanjivaram.jpg'
import organzaImg from '../assets/categories/organza.jpg'
import chanderiImg from '../assets/categories/chanderi.jpg'
import chiffonImg from '../assets/categories/chiffon.jpg'
import bridalImg from '../assets/categories/bridal.jpg'

const HomeCMSContext = createContext(null)

const STORAGE_KEY = 'vastraa_home_cms_data'

// Default Home CMS Data
const DEFAULT_BANNERS = [
  {
    id: 1,
    image: `${import.meta.env.BASE_URL || '/'}slides/slide7.png`,
    mobileImage: `${import.meta.env.BASE_URL || '/'}slides/m3.png`,
    title: 'Festival Collection - A Moment of Festive Light & Joy',
    buttonText: 'SHOP NOW',
    buttonLink: '/collections',
    active: true,
    order: 1,
  },
  {
    id: 2,
    image: `${import.meta.env.BASE_URL || '/'}slides/slide6.png`,
    mobileImage: `${import.meta.env.BASE_URL || '/'}slides/m1.png`,
    title: 'Wedding & Royal Edit - Saree Timeless Beauty',
    buttonText: 'SHOP NOW',
    buttonLink: '/collections',
    active: true,
    order: 2,
  },
  {
    id: 3,
    image: `${import.meta.env.BASE_URL || '/'}slides/slide5.png`,
    mobileImage: `${import.meta.env.BASE_URL || '/'}slides/m2.png`,
    title: 'Saree & Travel - Destination & Memories',
    buttonText: 'SHOP NOW',
    buttonLink: '/collections',
    active: true,
    order: 3,
  },
]

const DEFAULT_HOME_CMS = {
  // 0. Hero Banner Sliders
  heroBanners: DEFAULT_BANNERS,

  // 1. Fashion For Every Mood Section (Banner + 3 Cards)
  styleDirection: {
    title: 'Fashion For',
    highlightTitle: 'Every Mood',
    description:
      'Casual, Formal, Party or Everyday celebratory grace. Handcrafted silhouettes thoughtfully curated so you always feel radiant.',
    buttonText: 'Shop All Moods',
    buttonUrl: '/collections',
    backgroundImage: `${import.meta.env.BASE_URL || '/'}slides/banner.png`,
    moods: [
      {
        id: 1,
        title: 'CASUAL',
        subtitle: 'Effortless Everyday Drapes',
        image: chiffonImg,
        url: '/collections?category=Chiffon',
      },
      {
        id: 2,
        title: 'FORMAL',
        subtitle: 'Classic Pure Handlooms',
        image: arrival1,
        url: '/collections?category=Handloom',
      },
      {
        id: 3,
        title: 'PARTY',
        subtitle: 'Grand Zari & Shimmer Silks',
        image: arrival4,
        url: '/collections?category=Organza',
      },
    ],
  },

  // 2. Shop By Category (Max 6 Categories)
  shopByCategory: {
    title: 'Shop by',
    highlightTitle: 'Category',
    description:
      'Discover curated collections tailored to celebrate timeless grace & Indian heritage',
    seeAllText: 'See all categories',
    seeAllUrl: '/collections',
    selectedCategories: [
      { id: 1, title: 'Banarasi Sarees', itemCount: '120 Items', image: banarasiImg, categoryName: 'Banarasi', href: '/collections?category=Banarasi' },
      { id: 2, title: 'Kanjivaram Sarees', itemCount: '95 Items', image: kanjivaramImg, categoryName: 'Kanjivaram', href: '/collections?category=Kanjivaram' },
      { id: 3, title: 'Organza Sarees', itemCount: '80 Items', image: organzaImg, categoryName: 'Organza', href: '/collections?category=Organza' },
      { id: 4, title: 'Chanderi Sarees', itemCount: '110 Items', image: chanderiImg, categoryName: 'Chanderi', href: '/collections?category=Chanderi' },
      { id: 5, title: 'Chiffon & Georgette', itemCount: '75 Items', image: chiffonImg, categoryName: 'Chiffon', href: '/collections?category=Chiffon' },
      { id: 6, title: 'Royal Bridal Sarees', itemCount: '60 Items', image: bridalImg, categoryName: 'Bridal', href: '/collections?category=Bridal' },
    ],
  },

  // 3. New Arrivals (Max 4 Products)
  newArrivals: {
    title: 'New',
    highlightTitle: 'Arrivals',
    description:
      'Carefully designed styles capturing current aesthetics & timeless craftsmanship',
    seeAllText: 'See all sarees',
    seeAllUrl: '/collections',
    productIds: [1, 2, 3, 4],
  },

  // 4. Category Showcase Sections (Admin can add any category, each with max 4 products)
  categoryShowcases: [
    {
      id: 'showcase-banarasi',
      categoryName: 'Banarasi',
      title: 'Banarasi',
      highlightTitle: 'Sarees',
      description:
        'Handcrafted pure katan weaves capturing timeless royal elegance & authentic heritage',
      exploreText: 'Explore All Banarasi',
      exploreUrl: '/collections?category=Banarasi',
      productIds: [5, 6, 7, 8],
    },
  ],
}

export const HomeCMSProvider = ({ children }) => {
  const [cmsData, setCmsData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Ensure heroBanners exists if loading older localStorage data
        if (!parsed.heroBanners || !Array.isArray(parsed.heroBanners) || parsed.heroBanners.length === 0) {
          parsed.heroBanners = DEFAULT_BANNERS
        }
        return parsed
      }
    } catch (e) {
      console.error('Failed to load home cms from localStorage', e)
    }
    return DEFAULT_HOME_CMS
  })

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cmsData))
    } catch (e) {
      console.error('Failed to save home cms data to localStorage', e)
    }
  }, [cmsData])

  // Update Hero Banners
  const updateHeroBanners = (newBanners) => {
    setCmsData((prev) => ({
      ...prev,
      heroBanners: typeof newBanners === 'function' ? newBanners(prev.heroBanners || []) : newBanners,
    }))
  }

  // Add a new Hero Banner
  const addHeroBanner = (bannerData) => {
    const newBanner = {
      id: Date.now(),
      image: bannerData.image || '',
      mobileImage: bannerData.mobileImage || bannerData.image || '',
      title: bannerData.title || 'Curated Silk Collection',
      buttonText: bannerData.buttonText || 'SHOP NOW',
      buttonLink: bannerData.buttonLink || '/collections',
      active: true,
      order: (cmsData.heroBanners?.length || 0) + 1,
    }
    setCmsData((prev) => ({
      ...prev,
      heroBanners: [...(prev.heroBanners || []), newBanner],
    }))
    return newBanner.id
  }

  // Update a single Hero Banner
  const updateSingleHeroBanner = (bannerId, updatedFields) => {
    setCmsData((prev) => ({
      ...prev,
      heroBanners: (prev.heroBanners || []).map((b) =>
        b.id === bannerId ? { ...b, ...updatedFields } : b
      ),
    }))
  }

  // Remove a Hero Banner
  const removeHeroBanner = (bannerId) => {
    setCmsData((prev) => ({
      ...prev,
      heroBanners: (prev.heroBanners || []).filter((b) => b.id !== bannerId),
    }))
  }

  // Update Fashion For Every Mood section
  const updateStyleDirection = (newData) => {
    setCmsData((prev) => ({
      ...prev,
      styleDirection: {
        ...prev.styleDirection,
        ...newData,
      },
    }))
  }

  // Update Shop By Category section (max 6 categories)
  const updateShopByCategory = (newData) => {
    setCmsData((prev) => ({
      ...prev,
      shopByCategory: {
        ...prev.shopByCategory,
        ...newData,
      },
    }))
  }

  // Update New Arrivals product list (max 4 products)
  const updateNewArrivals = (newArrivalData) => {
    setCmsData((prev) => ({
      ...prev,
      newArrivals: {
        ...prev.newArrivals,
        ...newArrivalData,
      },
    }))
  }

  // Add a new Category Showcase block (added at the top so new sections appear first)
  const addCategoryShowcase = (categoryName) => {
    const id = 'showcase-' + Date.now()
    const newSection = {
      id,
      categoryName,
      title: categoryName,
      highlightTitle: 'Sarees',
      description: `Artisanal handwoven creations showcasing the finest ${categoryName} heritage craftsmanship`,
      exploreText: `Explore All ${categoryName}`,
      exploreUrl: `/collections?category=${encodeURIComponent(categoryName)}`,
      productIds: [],
    }
    setCmsData((prev) => ({
      ...prev,
      categoryShowcases: [newSection, ...prev.categoryShowcases],
    }))
    return id
  }

  // Update an existing Category Showcase block
  const updateCategoryShowcase = (id, updatedFields) => {
    setCmsData((prev) => ({
      ...prev,
      categoryShowcases: prev.categoryShowcases.map((cs) =>
        cs.id === id ? { ...cs, ...updatedFields } : cs
      ),
    }))
  }

  // Delete a Category Showcase block
  const removeCategoryShowcase = (id) => {
    setCmsData((prev) => ({
      ...prev,
      categoryShowcases: prev.categoryShowcases.filter((cs) => cs.id !== id),
    }))
  }

  // Reset to default CMS data
  const resetToDefault = () => {
    setCmsData(DEFAULT_HOME_CMS)
  }

  return (
    <HomeCMSContext.Provider
      value={{
        cmsData,
        updateHeroBanners,
        addHeroBanner,
        updateSingleHeroBanner,
        removeHeroBanner,
        updateStyleDirection,
        updateShopByCategory,
        updateNewArrivals,
        addCategoryShowcase,
        updateCategoryShowcase,
        removeCategoryShowcase,
        resetToDefault,
      }}
    >
      {children}
    </HomeCMSContext.Provider>
  )
}

export const useHomeCMS = () => {
  const context = useContext(HomeCMSContext)
  if (!context) {
    throw new Error('useHomeCMS must be used within a HomeCMSProvider')
  }
  return context
}

