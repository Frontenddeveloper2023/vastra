import React, { createContext, useContext, useState, useEffect } from 'react'
import homeCmsService from '../services/homeCmsService'

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

  // 6. Policy Pages Handlers (Shipping & Returns, Terms & Conditions, Privacy Policy)
  const updatePolicyPage = async (pageKey, pageData) => {
    setCmsData((prev) => ({ ...prev, [pageKey]: pageData }))
    return await saveSection(pageKey, pageData)
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
