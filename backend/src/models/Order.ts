import { Schema, model, Types, type InferSchemaType } from 'mongoose'

export const ORDER_STATUSES = [
  'searching',
  'assigned',
  'enroute',
  'arrived',
  'in_progress',
  'completed',
  'cancelled',
  'disputed',
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

const OfferSchema = new Schema(
  {
    technicianId: { type: Schema.Types.ObjectId, ref: 'Technician', required: true },
    price: { type: Number, required: true },
    note: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'rejected', 'accepted', 'expired'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
)

const TimelineEventSchema = new Schema(
  {
    event: { type: String, required: true },
    at: { type: Date, default: Date.now },
    by: { type: String, enum: ['customer', 'technician', 'system', 'admin'], default: 'system' },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false },
)

const RatingSchema = new Schema(
  {
    stars: { type: Number, min: 1, max: 5 },
    review: { type: String, default: '' },
    ratedAt: { type: Date },
  },
  { _id: false },
)

const OrderSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true, index: true },
    technicianId: { type: Schema.Types.ObjectId, ref: 'Technician', default: null, index: true },

    category: { type: String, required: true, index: true },
    subcategory: { type: String, default: '' },
    problemDescription: { type: String, required: true },
    photos: { type: [String], default: [] },

    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
      fullAddress: { type: String, required: true },
      landmark: { type: String, default: '' },
    },

    customerBudget: { type: Number, default: null },
    agreedPrice: { type: Number, default: null },
    finalPrice: { type: Number, default: null },
    platformCommission: { type: Number, default: 0 },
    technicianPayout: { type: Number, default: 0 },

    status: { type: String, enum: ORDER_STATUSES, default: 'searching', index: true },
    cancellationReason: { type: String, default: '' },
    cancelledBy: { type: String, enum: ['customer', 'technician', 'system', null], default: null },

    offers: { type: [OfferSchema], default: [] },
    timeline: { type: [TimelineEventSchema], default: [] },

    customerRating: { type: RatingSchema, default: null },
    technicianRating: { type: RatingSchema, default: null },

    paymentMethod: { type: String, enum: ['cash', 'jazzcash', 'easypaisa'], default: 'cash' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },

    scheduledAt: { type: Date, default: null },
  },
  { timestamps: true },
)

OrderSchema.index({ location: '2dsphere' })
OrderSchema.index({ status: 1, createdAt: -1 })
OrderSchema.index({ customerId: 1, createdAt: -1 })
OrderSchema.index({ technicianId: 1, createdAt: -1 })

export type OrderDoc = InferSchemaType<typeof OrderSchema> & { _id: Types.ObjectId }
export const Order = model('Order', OrderSchema)
