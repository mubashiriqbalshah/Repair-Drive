import { Schema, model, type InferSchemaType } from 'mongoose'

const SettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String, default: '' },
  },
  { timestamps: true },
)

export type SettingDoc = InferSchemaType<typeof SettingSchema>
export const Setting = model('Setting', SettingSchema)

export const SETTING_KEYS = {
  defaultCommissionPercent: 'default_commission_percent',
  orderSearchRadiusKm: 'order_search_radius_km',
  offerExpiryMinutes: 'offer_expiry_minutes',
  cancellationFeePkr: 'cancellation_fee_pkr',
} as const

export async function getSetting<T = unknown>(key: string, fallback: T): Promise<T> {
  const doc = await Setting.findOne({ key }).lean()
  return (doc?.value as T) ?? fallback
}
