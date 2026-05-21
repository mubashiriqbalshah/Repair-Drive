import { Schema, model, type InferSchemaType } from 'mongoose'

const MessageSchema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, required: true },
    senderRole: { type: String, enum: ['customer', 'technician', 'system'], required: true },
    text: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    type: { type: String, enum: ['text', 'image', 'system'], default: 'text' },
    sentAt: { type: Date, default: Date.now },
    readAt: { type: Date, default: null },
  },
  { _id: true },
)

const ChatSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    technicianId: { type: Schema.Types.ObjectId, ref: 'Technician', required: true },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true },
)

export type ChatDoc = InferSchemaType<typeof ChatSchema>
export const Chat = model('Chat', ChatSchema)
