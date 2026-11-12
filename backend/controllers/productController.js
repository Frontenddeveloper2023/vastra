import Product from '../models/Product.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'
import { emitEvent } from '../services/socketService.js'

/**
 * @desc Get all products with filtering, search, category, pagination
 * @route GET /api/products
 * @access Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      material,
      status,
      search,
      sort,
      page = 1,
      limit = 50,
    } = req.query

    const filter = {}

    if (category && category !== 'All') {
      filter.category = category
    }

    if (status && status !== 'All') {
      filter.status = status
    }

    if (material && material !== 'All') {
      filter['variants.material'] = material
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i')
      filter.$or = [
        { title: regex },
        { category: regex },
        { description: regex },
        { 'variants.color': regex },
        { 'variants.material': regex },
        { 'variants.design': regex },
      ]
    }

    // Sort order
    let sortOptions = { createdAt: -1 }
    if (sort === 'price_asc') sortOptions = { price: 1 }
    if (sort === 'price_desc') sortOptions = { price: -1 }
    if (sort === 'newest') sortOptions = { createdAt: -1 }

    const skip = (Number(page) - 1) * Number(limit)

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ])

    return sendSuccess(
      res,
      {
        products,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
        },
      },
      'Products fetched successfully'
    )
  } catch (error) {
    next(error)
  }
}

/**
 * @desc Get single product by ID
 * @route GET /api/products/:id
 * @access Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return sendError(res, 'Product not found', 404)
    }
    return sendSuccess(res, { product }, 'Product retrieved successfully')
  } catch (error) {
    next(error)
  }
}

/**
 * @desc Create new product with variant cards
 * @route POST /api/products
 * @access Private (Admin only)
 */
export const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      category,
      description,
      price,
      originalPrice,
      status,
      badge,
      returnWindowDays,
      isReturnable,
      image,
      variants,
      metaTitle,
      metaKeywords,
      metaDescription,
    } = req.body

    // Basic validation
    if (!title || !category || !description || !price) {
      return sendError(res, 'Please provide all mandatory fields (Title, Category, Price, Description)', 400)
    }

    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return sendError(res, 'Please add at least one variant card (Image, Color, Material, Weight, Stock)', 400)
    }

    // Validate each variant card
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i]
      const hasImage = v.image || (Array.isArray(v.images) && v.images.some(Boolean))
      if (!hasImage) {
        return sendError(res, `Variant #${i + 1} is missing an image`, 400)
      }
      if (!v.color) {
        return sendError(res, `Variant #${i + 1} is missing a color`, 400)
      }
      if (!v.material) {
        return sendError(res, `Variant #${i + 1} is missing a material/fabric`, 400)
      }
    }

    const defaultImage = image || variants[0]?.image || variants[0]?.images?.[0] || ''

    const newProduct = new Product({
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : 0,
      status: status || 'Active',
      badge: badge || '',
      returnWindowDays: returnWindowDays !== undefined ? Number(returnWindowDays) : 7,
      isReturnable: isReturnable !== undefined ? Boolean(isReturnable) : true,
      image: defaultImage,
      variants: variants.map((v) => {
        const imgList = Array.isArray(v.images) ? v.images.filter(Boolean) : []
        const primaryImg = v.image || imgList[0] || ''
        return {
          image: primaryImg,
          images: imgList.length > 0 ? imgList : (primaryImg ? [primaryImg] : []),
          color: v.color,
          hex: v.hex || '#6D021B',
          material: v.material,
          design: v.design || '',
          weight: Number(v.weight) || 800,
          stock: Number(v.stock) || 0,
          lowStockAlert: Number(v.lowStockAlert) || 2,
        }
      }),
      metaTitle: metaTitle || title,
      metaKeywords: metaKeywords || '',
      metaDescription: metaDescription || description,
    })

    const savedProduct = await newProduct.save()

    return sendSuccess(res, { product: savedProduct }, 'Product added to inventory successfully', 201)
  } catch (error) {
    next(error)
  }
}

/**
 * @desc Update existing product with variant cards
 * @route PUT /api/products/:id
 * @access Private (Admin only)
 */
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return sendError(res, 'Product not found', 404)
    }

    const updatableFields = [
      'title',
      'category',
      'description',
      'price',
      'originalPrice',
      'status',
      'badge',
      'returnWindowDays',
      'isReturnable',
      'image',
      'variants',
      'metaTitle',
      'metaKeywords',
      'metaDescription',
    ]

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field]
      }
    })

    if (req.body.variants !== undefined && Array.isArray(req.body.variants)) {
      product.variants = req.body.variants.map((v) => {
        const imgList = Array.isArray(v.images) ? v.images.filter(Boolean) : []
        const primaryImg = v.image || imgList[0] || ''
        return {
          ...v,
          image: primaryImg,
          images: imgList.length > 0 ? imgList : (primaryImg ? [primaryImg] : []),
        }
      })
    }

    if (product.variants && product.variants.length > 0) {
      product.image = product.variants[0].image || product.variants[0].images?.[0] || product.image
    }

    const updatedProduct = await product.save()

    // ⚡ Emit WebSocket event for instant stock & product updates
    emitEvent('stock:updated', {
      productId: updatedProduct._id,
      title: updatedProduct.title,
      totalStock: updatedProduct.totalStock,
      variants: updatedProduct.variants,
      message: `Product "${updatedProduct.title}" updated`,
    })

    return sendSuccess(res, { product: updatedProduct }, 'Product updated successfully')
  } catch (error) {
    next(error)
  }
}

/**
 * @desc Delete product from inventory
 * @route DELETE /api/products/:id
 * @access Private (Admin only)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return sendError(res, 'Product not found', 404)
    }
    return sendSuccess(res, null, 'Product removed from inventory successfully')
  } catch (error) {
    next(error)
  }
}

/**
 * @desc Upload product image(s) and return relative path format: "uploads/products/variant-0-img-0-..."
 * @route POST /api/products/upload
 * @access Private (Admin only)
 */
export const uploadImages = (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No image file uploaded', 400)
    }

    // Save as clean relative path: uploads/products/variant-0-img-0-...
    const relativePaths = req.files.map((file) => `uploads/products/${file.filename}`)

    return sendSuccess(
      res,
      {
        paths: relativePaths,
        image: relativePaths[0],
      },
      'Image uploaded successfully'
    )
  } catch (error) {
    next(error)
  }
}

/**
 * @desc Get real-time stock notifications and alerts (low stock & out of stock)
 * @route GET /api/products/stock-alerts
 * @access Private (Admin only)
 */
export const getStockAlerts = async (req, res, next) => {
  try {
    const products = await Product.find().lean()
    const alertItems = []

    products.forEach((product) => {
      const variants = product.variants && product.variants.length > 0
        ? product.variants
        : [
            {
              _id: product._id,
              color: product.color || 'Standard',
              stock: product.totalStock || 0,
              lowStockAlert: 2,
              image: product.image,
              images: [product.image].filter(Boolean),
            },
          ]

      variants.forEach((v, vIdx) => {
        const stock = Number(v.stock ?? 0)
        const lowStockAlert = Number(v.lowStockAlert ?? 2)

        // Trigger alert when stock reaches or falls below the alert threshold
        if (stock <= lowStockAlert) {
          const vImg = v.image || v.images?.[0] || product.image || ''
          const isOutOfStock = stock <= 0
          const status = isOutOfStock ? 'Out of Stock' : 'Low Stock'

          alertItems.push({
            id: `${product._id}_${vIdx}`,
            productId: product._id,
            variantIndex: vIdx,
            variantId: v._id,
            title: product.title,
            variantName: v.color ? `${v.color}${v.material ? ` • ${v.material}` : ''}` : `Variant ${vIdx + 1}`,
            sku: `VAS-${(product.category || 'SAR').substring(0, 3).toUpperCase()}-${(v.color || 'CLR').substring(0, 3).toUpperCase()}-${String(product._id).substring(18, 24).toUpperCase()}`,
            category: product.category || 'General',
            stock,
            lowStockAlert,
            price: product.price || 0,
            image: vImg,
            status,
            createdAt: product.updatedAt || product.createdAt,
          })
        }
      })
    })

    // Sort: Out of stock first, then lowest stock
    alertItems.sort((a, b) => a.stock - b.stock)

    return sendSuccess(
      res,
      {
        alerts: alertItems,
        totalAlerts: alertItems.length,
        outOfStockCount: alertItems.filter((a) => a.status === 'Out of Stock').length,
        lowStockCount: alertItems.filter((a) => a.status === 'Low Stock').length,
      },
      'Stock alerts fetched successfully'
    )
  } catch (error) {
    next(error)
  }
}

/**
 * @desc Quick restock / update stock for a product variant
 * @route PATCH /api/products/:id/restock
 * @access Private (Admin only)
 */
export const restockProductVariant = async (req, res, next) => {
  try {
    const { id } = req.params
    const { variantIndex = 0, addQuantity = 0, newStock } = req.body

    const product = await Product.findById(id)
    if (!product) {
      return sendError(res, 'Product not found', 404)
    }

    if (!product.variants || product.variants.length === 0) {
      return sendError(res, 'Product variants not found', 400)
    }

    const vIdx = Number(variantIndex)
    if (!product.variants[vIdx]) {
      return sendError(res, `Variant index ${vIdx} does not exist`, 400)
    }

    if (newStock !== undefined) {
      product.variants[vIdx].stock = Math.max(0, Number(newStock))
    } else {
      product.variants[vIdx].stock = Math.max(0, (product.variants[vIdx].stock || 0) + Number(addQuantity))
    }

    // Recompute product totalStock
    product.totalStock = product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)

    await product.save()

    // ⚡ Emit WebSocket event for restock
    emitEvent('stock:updated', {
      productId: product._id,
      variantIndex: vIdx,
      newStock: product.variants[vIdx].stock,
      totalStock: product.totalStock,
      message: `Stock updated for ${product.title}`,
    })

    return sendSuccess(
      res,
      {
        product,
        updatedVariant: product.variants[vIdx],
      },
      'Stock successfully updated'
    )
  } catch (error) {
    next(error)
  }
}
