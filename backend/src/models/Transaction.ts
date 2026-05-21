import { Schema, model, type InferSchemaType } from 'mongoose'

const TransactionSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', default: null, index: true },
    technicianId: { type: Schema.Types.ObjectId, ref: 'Technician', default: null, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', default: null, index: true },
    amount: { type: Number, required: true },
    commission: { type: Number, default: 0 },
    technicianPayout: { type: Number, default: 0 },
    type: {
      type: String,
      enum: ['order_payment', 'withdrawal', 'refund', 'penalty', 'bonus'],
      required: true,
    },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    paymentMethod: { type: String, default: 'cash' },
    note: { type: String, default: '' },
  },
  { timestamps: true },
)

export type TransactionDoc = InferSchemaType<typeof TransactionSchema>
export const Transaction = model('Transaction', TransactionSchema)
