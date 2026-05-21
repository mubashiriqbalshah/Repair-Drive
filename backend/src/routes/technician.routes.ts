import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  getProfile,
  onboard,
  onboardSchema,
  updateProfile,
  updateProfileSchema,
  setOnlineStatus,
  onlineStatusSchema,
  updateLocation,
  locationSchema,
  nearbyOrders,
  nearbyOrdersQuerySchema,
  makeOffer,
  offerSchema,
  updateOrderStatus,
  orderStatusSchema,
  earnings,
} from '../controllers/technician.controller'

export const technicianRoutes = Router()
technicianRoutes.use(requireAuth('technician'))

technicianRoutes.get('/profile', getProfile)
technicianRoutes.post('/onboard', validate(onboardSchema), onboard)
technicianRoutes.patch('/profile', validate(updateProfileSchema), updateProfile)
technicianRoutes.patch('/online-status', validate(onlineStatusSchema), setOnlineStatus)
technicianRoutes.patch('/location', validate(locationSchema), updateLocation)
technicianRoutes.get('/nearby-orders', validate(nearbyOrdersQuerySchema, 'query'), nearbyOrders)
technicianRoutes.post('/orders/:id/offer', validate(offerSchema), makeOffer)
technicianRoutes.patch('/orders/:id/status', validate(orderStatusSchema), updateOrderStatus)
technicianRoutes.get('/earnings', earnings)
