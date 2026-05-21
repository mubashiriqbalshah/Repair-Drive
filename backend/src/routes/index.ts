import { Router } from 'express'
import { authRoutes } from './auth.routes'
import { categoryRoutes } from './category.routes'
import { customerRoutes } from './customer.routes'
import { technicianRoutes } from './technician.routes'
import { orderRoutes } from './order.routes'
import { adminRoutes } from './admin.routes'

export const router = Router()

router.use('/auth', authRoutes)
router.use('/categories', categoryRoutes)
router.use('/customer', customerRoutes)
router.use('/technician', technicianRoutes)
router.use('/orders', orderRoutes)
router.use('/admin', adminRoutes)
