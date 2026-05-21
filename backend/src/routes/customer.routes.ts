import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  getProfile,
  updateProfile,
  updateProfileSchema,
  addAddress,
  addressSchema,
  removeAddress,
  createOrder,
  createOrderSchema,
  listOrders,
  getOrder,
  acceptOffer,
  acceptOfferSchema,
  cancelOrder,
  cancelOrderSchema,
  rateOrder,
  rateOrderSchema,
} from '../controllers/customer.controller'

export const customerRoutes = Router()
customerRoutes.use(requireAuth('customer'))

customerRoutes.get('/profile', getProfile)
customerRoutes.patch('/profile', validate(updateProfileSchema), updateProfile)

customerRoutes.post('/addresses', validate(addressSchema), addAddress)
customerRoutes.delete('/addresses/:id', removeAddress)

customerRoutes.post('/orders', validate(createOrderSchema), createOrder)
customerRoutes.get('/orders', listOrders)
customerRoutes.get('/orders/:id', getOrder)
customerRoutes.patch('/orders/:id/accept-offer', validate(acceptOfferSchema), acceptOffer)
customerRoutes.patch('/orders/:id/cancel', validate(cancelOrderSchema), cancelOrder)
customerRoutes.post('/orders/:id/rate', validate(rateOrderSchema), rateOrder)
