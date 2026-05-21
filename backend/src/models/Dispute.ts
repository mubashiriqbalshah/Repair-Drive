import { Schema, model, type InferSchemaType } from 'mongoose'

const DisputeSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    raisedBy: { type: String, enum: ['customer', 'technician'], required: true },
    raiserId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    description: { type: String, default: '' },
    attachments: { type: [String], default: [] },
    status: { type: String, enum: ['open', 'investigating', 'resolved'], default: 'open', index: true },
    resolution: { type: String, default: '' },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export type DisputeDoc = InferSchemaType<typeof DisputeSchema>
export const Dispute = model('Dispute', DisputeSchema)
