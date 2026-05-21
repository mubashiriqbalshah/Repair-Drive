import { z } from 'zod'
import { Types } from 'mongoose'
import { asyncHandler } from '../utils/async'
import { AppError } from '../utils/errors'
import { Chat, Dispute, Order } from '../models'
import { emitToOrder } from '../socket'

async function assertParticipant(orderId: string, userId: string, role: 'customer' | 'technician') {
  const order = await Order.findById(orderId)
  if (!order) throw AppError.notFound('Order not found')
  const matchField = role === 'customer' ? 'customerId' : 'technicianId'
  if (order[matchField]?.toString() !== userId) throw AppError.forbidden('Not your order')
  return order
}

export const getSharedOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).lean()
  if (!order) throw AppError.notFound('Order not found')
  const { userId, role } = req.auth!
  if (role === 'customer' && order.customerId?.toString() !== userId) throw AppError.forbidden()
  if (role === 'technician' && order.technicianId?.toString() !== userId) throw AppError.forbidden()
  res.json({ order })
})

export const getChat = asyncHandler(async (req, res) => {
  const { userId, role } = req.auth!
  const order = await assertParticipant(req.params.id, userId, role as 'customer' | 'technician')
  if (!order.technicianId) throw AppError.badRequest('No technician assigned yet')

  let chat = await Chat.findOne({ orderId: order._id })
  if (!chat) {
    chat = await Chat.create({
      orderId: order._id,
      customerId: order.customerId,
      technicianId: order.technicianId,
      messages: [],
    })
  }
  res.json({ chat })
})

export const sendMessageSchema = z.object({
  text: z.string().min(1).max(2000).optional(),
  imageUrl: z.string().url().optional(),
}).refine((d) => d.text || d.imageUrl, { message: 'text or imageUrl required' })

export const sendMessage = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof sendMessageSchema>
  const { userId, role } = req.auth!
  const order = await assertParticipant(req.params.id, userId, role as 'customer' | 'technician')
  if (!order.technicianId) throw AppError.badRequest('No technician assigned yet')

  let chat = await Chat.findOne({ orderId: order._id })
  if (!chat) {
    chat = await Chat.create({
      orderId: order._id,
      customerId: order.customerId,
      technicianId: order.technicianId,
      messages: [],
    })
  }

  const message = {
    senderId: new Types.ObjectId(userId),
    senderRole: role as 'customer' | 'technician',
    text: body.text ?? '',
    imageUrl: body.imageUrl ?? '',
    type: body.imageUrl ? 'image' : 'text',
    sentAt: new Date(),
  }
  chat.messages.push(message as never)
  await chat.save()

  emitToOrder(order._id.toString(), 'chat:new_message', { orderId: order._id, message })
  res.status(201).json({ message })
})

export const disputeSchema = z.object({
  reason: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(''),
  attachments: z.array(z.string().url()).max(5).optional().default([]),
})

export const fileDispute = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof disputeSchema>
  const { userId, role } = req.auth!
  const order = await assertParticipant(req.params.id, userId, role as 'customer' | 'technician')

  const dispute = await Dispute.create({
    orderId: order._id,
    raisedBy: role,
    raiserId: userId,
    reason: body.reason,
    description: body.description,
    attachments: body.attachments,
  })
  order.status = 'disputed'
  order.timeline.push({ event: 'disputed', at: new Date(), by: role as 'customer' | 'technician' })
  await order.save()

  res.status(201).json({ dispute })
})
