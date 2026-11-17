import React, { createContext, useContext, useState, useEffect } from 'react'
import homeCmsService from '../services/homeCmsService'
import { getSocket } from '../services/socket'

const HomeCMSContext = createContext(null)

const DEFAULT_HOME_CMS = {
  heroBanners: [],
  styleDirection: {
    backgroundImage: '',
    title: 'Fashion For',
    highlightTitle: 'Every Mood',
    description: '',
    buttonText: 'Shop All Moods',
    buttonUrl: '/collections',
    moods: [],
  },
  shopByCategory: {
    title: 'Shop by',
    highlightTitle: 'Category',
    description: '',
    selectedCategories: [],
  },
  newArrivals: {
    title: 'New',
    highlightTitle: 'Arrivals',
    description: '',
    productIds: [],
  },
  categoryShowcases: [],
  shippingReturns: {
    title: 'Shipping & Returns',
    subtitle: 'Simple 7-point policy guide for your peace of mind.',
    points: [],
  },
  termsConditions: {
    title: 'Terms & Conditions',
    subtitle: 'Store Agreement & Policies for our boutique customers.',
    points: [],
  },
  privacyPolicy: {
    title: 'Privacy Policy',
    subtitle: 'Data Protection & Trust commitment at Vastraa.',
    points: [],
  },
  aboutUs: {
    heroTitle: 'Weaving Timeless Elegance & Cultural Heritage',
    paragraph1:
      'Founded on an enduring reverence for India’s rich handloom traditions, Vastraa is a sanctuary of heirloom textiles. From the sacred ghats of Varanasi to the temple town looms of Kanchipuram, every saree in our curation is an ode to patience, dexterity, and royal poise.',
    paragraph2:
      'We believe that a saree is more than six yards of fabric—it is living history, woven rhythmically by generational master artisans who breathe soul into every warp and weft. By uniting age-old motifs with contemporary drape styling, we craft pieces destined to become treasured family heirlooms.',
    portraitImage: '',
    visionTitle: 'Our Vision',
    visionText:
      'To become the world’s most trusted ambassador of Indian textile art—bridging historic handloom clusters with modern haute couture, while safeguarding the priceless heritage of traditional master weavers for future generations.',
    missionTitle: 'Our Mission',
    missionText:
      'To deliver authentic, heirloom-quality sarees crafted from 100% certified pure silks through transparent artisan patronage, fair-trade pricing, and bespoke care that celebrates every milestone in a woman’s life.',
    whyChooseTitle: 'Why Choose Vastraa',
    whyChooseItems: [
      {
        id: 'feat-1',
        title: 'Silk Mark Certified Purity',
        description:
          'Every saree carries authentic purity accreditation, guaranteeing 100% natural katan, mulberry, and tussar silks without synthetic blends.',
      },
      {
        id: 'feat-2',
        title: 'Generational Master Weavers',
        description:
          'Hand-loomed in authentic textile capitals—Banaras, Kanchipuram, Chanderi, and Paithan—preserving techniques passed down through centuries.',
      },
      {
        id: 'feat-3',
        title: 'Real Zari & Intricate Motifs',
        description:
          'Embellished with pure zari, heritage kadwa bootas, traditional meenakari, and timeless temple borders that endure for generations.',
      },
    ],
  },
}

export const HomeCMSProvider = ({ children }) => {
  const [cmsData, setCmsData] = useState(DEFAULT_HOME_CMS)
  const [loading, setLoading] = useState(true)

  // Fetch initial Home CMS configuration from Backend
  const refreshCMS = async () => {
    try {
      const data = await homeCmsService.get()
      if (data) {
        setCmsData({
          heroBanners: data.heroBanners || [],
          styleDirection: data.styleDirection || DEFAULT_HOME_CMS.styleDirection,
          shopByCategory: data.shopByCategory || DEFAULT_HOME_CMS.shopByCategory,
          newArrivals: data.newArrivals || DEFAULT_HOME_CMS.newArrivals,
          categoryShowcases: data.categoryShowcases || [],
          shippingReturns: data.shippingReturns || DEFAULT_HOME_CMS.shippingReturns,
          termsConditions: data.termsConditions || DEFAULT_HOME_CMS.termsConditions,
          privacyPolicy: data.privacyPolicy || DEFAULT_HOME_CMS.privacyPolicy,
          aboutUs: data.aboutUs || DEFAULT_HOME_CMS.aboutUs,
        })
      }
    } catch (e) {
      console.error('Failed to load home cms from backend', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshCMS()

    const socket = getSocket()
    const handleCmsUpdated = (data) => {
      const incoming = data?.cms
      if (incoming) {
        setCmsData((prev) => ({
          ...prev,
          ...incoming,
        }))
      }
    }

    socket.on('cms:updated', handleCmsUpdated)
    return () => {
      socket.off('cms:updated', handleCmsUpdated)
    }
  }, [])

  // Update whole or partial section on Backend & local state
  const saveSection = async (sectionKey, sectionData) => {
    try {
      const payload = { [sectionKey]: sectionData }
      const res = await homeCmsService.update(payload)
      if (res) {
        setCmsData((prev) => ({
          ...prev,
          [sectionKey]: res[sectionKey] || sectionData,
        }))
      }
      return true
    } catch (err) {
      console.error(`Failed to update ${sectionKey}:`, err)
      throw err
    }
  }

  // 1. Hero Banners Handlers
  const updateHeroBanners = async (newBanners) => {
    const banners = typeof newBanners === 'function' ? newBanners(cmsData.heroBanners || []) : newBanners
    setCmsData((prev) => ({ ...prev, heroBanners: banners }))
    return await saveSection('heroBanners', banners)
  }

  const addHeroBanner = async (bannerData) => {
    const newBanner = {
      id: String(Date.now()),
      image: bannerData.image || '',
      mobileImage: bannerData.mobileImage || '',
      title: bannerData.title || '',
      buttonText: bannerData.buttonText || 'SHOP NOW',
      buttonLink: bannerData.buttonLink || '/collections',
      order: (cmsData.heroBanners?.length || 0) + 1,
    }
    const updated = [...(cmsData.heroBanners || []), newBanner]
    setCmsData((prev) => ({ ...prev, heroBanners: updated }))
    await saveSection('heroBanners', updated)
    return newBanner.id
  }

  const updateSingleHeroBanner = async (bannerId, updatedFields) => {
    const updated = (cmsData.heroBanners || []).map((b) =>
      b.id === bannerId || b._id === bannerId ? { ...b, ...updatedFields } : b
    )
    setCmsData((prev) => ({ ...prev, heroBanners: updated }))
    return await saveSection('heroBanners', updated)
  }

  const removeHeroBanner = async (bannerId) => {
    const updated = (cmsData.heroBanners || []).filter((b) => b.id !== bannerId && b._id !== bannerId)
    setCmsData((prev) => ({ ...prev, heroBanners: updated }))
    return await saveSection('heroBanners', updated)
  }

  // 2. Style Direction (Fashion For Every Mood) Handler
  const updateStyleDirection = async (newData) => {
    const updated = { ...cmsData.styleDirection, ...newData }
    setCmsData((prev) => ({ ...prev, styleDirection: updated }))
    return await saveSection('styleDirection', updated)
  }

  // 3. Shop By Category Handler
  const updateShopByCategory = async (newData) => {
    const updated = { ...cmsData.shopByCategory, ...newData }
    setCmsData((prev) => ({ ...prev, shopByCategory: updated }))
    return await saveSection('shopByCategory', updated)
  }

  // 4. New Arrivals Handler
  const updateNewArrivals = async (newArrivalData) => {
    const updated = { ...cmsData.newArrivals, ...newArrivalData }
    setCmsData((prev) => ({ ...prev, newArrivals: updated }))
    return await saveSection('newArrivals', updated)
  }

  // 5. Category Showcases Handlers
  const addCategoryShowcase = async (categoryName) => {
    const id = 'showcase-' + Date.now()
    const newSection = {
      id,
      categoryName,
      title: categoryName,
      highlightTitle: 'Sarees',
      description: `Artisanal handwoven creations showcasing the finest ${categoryName} heritage craftsmanship`,
      productIds: [],
    }
    const updated = [newSection, ...(cmsData.categoryShowcases || [])]
    setCmsData((prev) => ({ ...prev, categoryShowcases: updated }))
    await saveSection('categoryShowcases', updated)
    return id
  }

  const updateCategoryShowcase = async (id, updatedFields) => {
    const updated = (cmsData.categoryShowcases || []).map((cs) =>
      cs.id === id || cs._id === id ? { ...cs, ...updatedFields } : cs
    )
    setCmsData((prev) => ({ ...prev, categoryShowcases: updated }))
    return await saveSection('categoryShowcases', updated)
  }

  const removeCategoryShowcase = async (id) => {
    const updated = (cmsData.categoryShowcases || []).filter((cs) => cs.id !== id && cs._id !== id)
    setCmsData((prev) => ({ ...prev, categoryShowcases: updated }))
    return await saveSection('categoryShowcases', updated)
  }

  // 6. Policy Pages Handlers (Shipping & Returns, Terms & Conditions, Privacy Policy, About Us)
  const updatePolicyPage = async (pageKey, pageData) => {
    setCmsData((prev) => ({ ...prev, [pageKey]: pageData }))
    return await saveSection(pageKey, pageData)
  }

  // 7. About Us Handler
  const updateAboutUs = async (aboutData) => {
    setCmsData((prev) => ({ ...prev, aboutUs: aboutData }))
    return await saveSection('aboutUs', aboutData)
  }

  return (
    <HomeCMSContext.Provider
      value={{
        cmsData,
        loading,
        refreshCMS,
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
        updatePolicyPage,
        updateAboutUs,
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
