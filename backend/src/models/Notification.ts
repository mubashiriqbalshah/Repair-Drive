import { Schema, model, type InferSchemaType } from 'mongoose'

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    userRole: { type: String, enum: ['customer', 'technician', 'admin'], required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    data: { type: Schema.Types.Mixed, default: {} },
    read: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
)

export type NotificationDoc = InferSchemaType<typeof NotificationSchema>
export const Notification = model('Notification', NotificationSchema)
