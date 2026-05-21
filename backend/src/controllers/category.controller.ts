import { Category } from '../models'
import { asyncHandler } from '../utils/async'

export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find({ active: true }).sort({ order: 1 }).lean()
  res.json({ categories })
})
