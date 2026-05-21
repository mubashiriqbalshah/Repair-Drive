import { Schema, model, type InferSchemaType } from 'mongoose'

const SubcategorySchema = new Schema(
  {
    slug: { type: String, required: true },
    nameEn: { type: String, required: true },
    nameUr: { type: String, required: true },
  },
  { _id: false },
)

const CategorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    nameEn: { type: String, required: true },
    nameUr: { type: String, required: true },
    icon: { type: String, default: '' },
    subcategories: { type: [SubcategorySchema], default: [] },
    baseSuggestedPrice: { type: Number, default: 0 },
    commissionPercent: { type: Number, default: null },
    active: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export type CategoryDoc = InferSchemaType<typeof CategorySchema>
export const Category = model('Category', CategorySchema)
