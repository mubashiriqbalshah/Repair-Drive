import { Schema, model, type InferSchemaType } from 'mongoose'

const AddressSchema = new Schema(
  {
    label: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    fullAddress: { type: String, required: true },
    landmark: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true, timestamps: false },
)

const CustomerSchema = new Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },
    addresses: { type: [AddressSchema], default: [] },
    banned: { type: Boolean, default: false },
    fcmTokens: { type: [String], default: [] },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

export type CustomerDoc = InferSchemaType<typeof CustomerSchema>
export const Customer = model('Customer', CustomerSchema)
