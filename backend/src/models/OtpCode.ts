import { Schema, model, type InferSchemaType } from 'mongoose'

const OtpCodeSchema = new Schema(
  {
    phone: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: ['login', 'signup'], default: 'login' },
    attempts: { type: Number, default: 0 },
    consumed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
)

export type OtpCodeDoc = InferSchemaType<typeof OtpCodeSchema>
export const OtpCode = model('OtpCode', OtpCodeSchema)
