import HomeCMS from '../models/HomeCMS.js'
import Product from '../models/Product.js'

// Standard JSON response helpers
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

const sendError = (res, message = 'Something went wrong', statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  })
}

/**
 * @desc Get Home CMS Configuration
 * @route GET /api/home-cms
 * @access Public
 */
export const getHomeCMS = async (req, res, next) => {
  try {
    let cms = await HomeCMS.findOne().sort({ createdAt: -1 })

    if (!cms) {
      // First-time initialization using live products if available
      const products = await Product.find({ status: 'Active' }).limit(8)
      const productIds = products.map((p) => p._id.toString())

      cms = await HomeCMS.create({
        heroBanners: [
          {
            id: '1',
            image: products[0]?.image || 'uploads/cms/default-banner-1.jpg',
            title: products[0]?.title || 'Festival Collection - A Moment of Festive Light & Joy',
            buttonText: 'SHOP NOW',
            buttonLink: '/collections',
            active: true,
            order: 1,
          },
        ],
        styleDirection: {
          backgroundImage: products[1]?.image || 'uploads/cms/default-bg.jpg',
          title: 'Fashion For',
          highlightTitle: 'Every Mood',
          description:
            'Casual, Formal, Party or Everyday celebratory grace. Handcrafted silhouettes thoughtfully curated so you always feel radiant.',
          buttonText: 'Shop All Moods',
          buttonUrl: '/collections',
          moods: [
            {
              id: '1',
              title: 'CASUAL',
              subtitle: 'Effortless Everyday Drapes',
              image: products[0]?.image || '',
              url: '/collections?category=Chiffon',
            },
            {
              id: '2',
              title: 'FORMAL',
              subtitle: 'Classic Pure Handlooms',
              image: products[1]?.image || '',
              url: '/collections?category=Handloom',
            },
            {
              id: '3',
              title: 'PARTY',
              subtitle: 'Grand Zari & Shimmer Silks',
              image: products[0]?.image || '',
              url: '/collections?category=Organza',
            },
          ],
        },
        shopByCategory: {
          title: 'Shop by',
          highlightTitle: 'Category',
          description:
            'Discover curated collections tailored to celebrate timeless grace & Indian heritage',
          selectedCategories: products.slice(0, 6).map((p, idx) => ({
            id: String(idx + 1),
            categoryName: p.category || 'Banarasi',
            title: `${p.category || 'Banarasi'} Sarees`,
            itemCount: '120 Items',
            image: p.image || '',
            featuredProductId: p._id.toString(),
          })),
        },
        newArrivals: {
          title: 'New',
          highlightTitle: 'Arrivals',
          description:
            'Carefully designed styles capturing current aesthetics & timeless craftsmanship',
          productIds: productIds.slice(0, 4),
        },
        categoryShowcases: products[0]
          ? [
              {
                id: 'showcase-1',
                categoryName: products[0].category,
                title: products[0].category,
                highlightTitle: 'Sarees',
                description: `Handcrafted pure weaves capturing timeless royal elegance & authentic heritage`,
                productIds: [products[0]._id.toString()],
              },
            ]
          : [],
      })
    }

    return sendSuccess(res, { cms }, 'Home CMS data retrieved')
  } catch (error) {
    next(error)
  }
}

/**
 * @desc Update Home CMS Configuration (Whole document or specific section)
 * @route PUT /api/home-cms
 * @access Private (Admin only)
 */
export const updateHomeCMS = async (req, res, next) => {
  try {
    const { heroBanners, styleDirection, shopByCategory, newArrivals, categoryShowcases } = req.body

    let cms = await HomeCMS.findOne().sort({ createdAt: -1 })
    if (!cms) {
      cms = new HomeCMS()
    }

    if (heroBanners !== undefined) cms.heroBanners = heroBanners
    if (styleDirection !== undefined) cms.styleDirection = styleDirection
    if (shopByCategory !== undefined) cms.shopByCategory = shopByCategory
    if (newArrivals !== undefined) cms.newArrivals = newArrivals
    if (categoryShowcases !== undefined) cms.categoryShowcases = categoryShowcases

    const saved = await cms.save()
    return sendSuccess(res, { cms: saved }, 'Home CMS updated successfully')
  } catch (error) {
    next(error)
  }
}

/**
 * @desc Upload CMS Image (Hero Banner, Mood Image, or Background)
 * @route POST /api/home-cms/upload
 * @access Private (Admin only)
 */
export const uploadCmsImage = (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file uploaded', 400)
    }

    const relativePath = `uploads/cms/${req.file.filename}`
    return sendSuccess(res, { path: relativePath, image: relativePath }, 'Image uploaded successfully')
  } catch (error) {
    next(error)
  }
}

