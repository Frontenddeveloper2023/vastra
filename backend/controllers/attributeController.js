import Attribute from '../models/Attribute.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'

/**
 * Helper to ensure a single master attribute document exists
 */
const getOrCreateAttributeDoc = async () => {
  let doc = await Attribute.findOne()
  if (!doc) {
    doc = await Attribute.create({
      categories: [],
      materials: [],
      designs: [],
      colors: [],
    })
  }
  return doc
}

/**
 * @desc Get all store attributes (categories, materials, designs, colors)
 * @route GET /api/attributes
 * @access Public
 */
export const getAttributes = async (req, res, next) => {
  try {
    const doc = await getOrCreateAttributeDoc()
    return sendSuccess(
      res,
      {
        _id: doc._id,
        categories: doc.categories || [],
        materials: doc.materials || [],
        designs: doc.designs || [],
        colors: doc.colors || [],
      },
      'Attributes retrieved successfully'
    )
  } catch (error) {
    next(error)
  }
}

/**
 * @desc Add an item to categories, materials, designs, or colors
 * @route POST /api/attributes/:section
 * @access Private (Admin)
 * @params section: 'categories' | 'materials' | 'designs' | 'colors'
 * @body: { name, hex } (hex required only for colors)
 */
export const addAttributeItem = async (req, res, next) => {
  try {
    const { section } = req.params
    const { name, hex } = req.body

    if (!name || !name.trim()) {
      return sendError(res, 'Item name is required', 400)
    }

    const trimmedName = name.trim()
    const doc = await getOrCreateAttributeDoc()

    if (section === 'categories') {
      if (doc.categories.some((c) => c.toLowerCase() === trimmedName.toLowerCase())) {
        return sendError(res, `Category "${trimmedName}" already exists`, 400)
      }
      doc.categories.push(trimmedName)
    } else if (section === 'materials') {
      if (doc.materials.some((m) => m.toLowerCase() === trimmedName.toLowerCase())) {
        return sendError(res, `Material "${trimmedName}" already exists`, 400)
      }
      doc.materials.push(trimmedName)
    } else if (section === 'designs') {
      if (doc.designs.some((d) => d.toLowerCase() === trimmedName.toLowerCase())) {
        return sendError(res, `Design "${trimmedName}" already exists`, 400)
      }
      doc.designs.push(trimmedName)
    } else if (section === 'colors') {
      if (doc.colors.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
        return sendError(res, `Color "${trimmedName}" already exists`, 400)
      }
      doc.colors.push({
        name: trimmedName,
        hex: hex ? hex.trim() : '#6D021B',
      })
    } else {
      return sendError(
        res,
        `Invalid attribute section "${section}". Must be categories, materials, designs, or colors`,
        400
      )
    }

    await doc.save()

    return sendSuccess(
      res,
      {
        _id: doc._id,
        categories: doc.categories,
        materials: doc.materials,
        designs: doc.designs,
        colors: doc.colors,
      },
      `Added to ${section} successfully`,
      201
    )
  } catch (error) {
    next(error)
  }
}

/**
 * @desc Remove an item from categories, materials, designs, or colors
 * @route DELETE /api/attributes/:section
 * @access Private (Admin)
 * @params section: 'categories' | 'materials' | 'designs' | 'colors'
 * @query: name (e.g. ?name=cotton)
 */
export const removeAttributeItem = async (req, res, next) => {
  try {
    const { section } = req.params
    const { name } = req.query

    if (!name) {
      return sendError(res, 'Name query parameter is required', 400)
    }

    const doc = await getOrCreateAttributeDoc()

    if (section === 'categories') {
      doc.categories = doc.categories.filter((c) => c.toLowerCase() !== name.toLowerCase())
    } else if (section === 'materials') {
      doc.materials = doc.materials.filter((m) => m.toLowerCase() !== name.toLowerCase())
    } else if (section === 'designs') {
      doc.designs = doc.designs.filter((d) => d.toLowerCase() !== name.toLowerCase())
    } else if (section === 'colors') {
      doc.colors = doc.colors.filter((c) => c.name.toLowerCase() !== name.toLowerCase())
    } else {
      return sendError(
        res,
        `Invalid section "${section}". Must be categories, materials, designs, or colors`,
        400
      )
    }

    await doc.save()

    return sendSuccess(
      res,
      {
        _id: doc._id,
        categories: doc.categories,
        materials: doc.materials,
        designs: doc.designs,
        colors: doc.colors,
      },
      `Removed from ${section} successfully`
    )
  } catch (error) {
    next(error)
  }
}
