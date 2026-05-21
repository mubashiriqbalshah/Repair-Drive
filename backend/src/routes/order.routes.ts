import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  getSharedOrder,
  getChat,
  sendMessage,
  sendMessageSchema,
  fileDispute,
  disputeSchema,
} from '../controllers/order.controller'

export const orderRoutes = Router()
orderRoutes.use(requireAuth('customer', 'technician'))

orderRoutes.get('/:id', getSharedOrder)
orderRoutes.get('/:id/chat', getChat)
orderRoutes.post('/:id/chat', validate(sendMessageSchema), sendMessage)
orderRoutes.post('/:id/dispute', validate(disputeSchema), fileDispute)
