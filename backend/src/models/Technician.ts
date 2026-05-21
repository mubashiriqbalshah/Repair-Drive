import { Schema, model, type InferSchemaType } from 'mongoose'

export const TECHNICIAN_STATUSES = ['pending', 'approved', 'rejected', 'suspended'] as const
export type TechnicianStatus = (typeof TECHNICIAN_STATUSES)[number]

const BankAccountSchema = new Schema(
  {
    accountTitle: { type: String, required: true },
    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    walletProvider: { type: String, enum: ['jazzcash', 'easypaisa', null], default: null },
  },
  { _id: false },
)

const TechnicianSchema = new Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },

    cnicHash: { type: String, default: '' },
    cnicFrontPhoto: { type: String, default: '' },
    cnicBackPhoto: { type: String, default: '' },
    selfieWithCnic: { type: String, default: '' },

    categories: { type: [String], default: [] },
    experienceYears: { type: Number, default: 0 },
    serviceAreas: { type: [String], default: [] },

    bankAccount: { type: BankAccountSchema, default: null },

    status: { type: String, enum: TECHNICIAN_STATUSES, default: 'pending', index: true },
    rejectionReason: { type: String, default: '' },

    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    totalJobs: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },

    isOnline: { type: Boolean, default: false, index: true },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
      updatedAt: { type: Date, default: Date.now },
    },

    banned: { type: Boolean, default: false },
    fcmTokens: { type: [String], default: [] },
  },
  { timestamps: true },
)

TechnicianSchema.index({ currentLocation: '2dsphere' })
TechnicianSchema.index({ categories: 1, isOnline: 1, status: 1 })

export type TechnicianDoc = InferSchemaType<typeof TechnicianSchema>
export const Technician = model('Technician', TechnicianSchema)
