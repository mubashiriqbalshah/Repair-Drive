import { Schema, model, type InferSchemaType } from 'mongoose'

export const ADMIN_ROLES = ['super_admin', 'support', 'finance'] as const
export type AdminRole = (typeof ADMIN_ROLES)[number]

const AdminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ADMIN_ROLES, default: 'support' },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export type AdminDoc = InferSchemaType<typeof AdminSchema>
export const Admin = model('Admin', AdminSchema)
