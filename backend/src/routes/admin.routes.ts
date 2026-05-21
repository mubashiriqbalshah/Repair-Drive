import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { authRateLimiter } from '../middleware/rateLimit'
import {
  login,
  loginSchema,
  dashboardStats,
  listTechnicians,
  approveTechnician,
  rejectTechnician,
  rejectSchema,
  suspendTechnician,
  listOrders,
  getOrder,
  listDisputes,
  resolveDispute,
  resolveDisputeSchema,
  upsertCategory,
  categoryUpsertSchema,
  deleteCategory,
  listSettings,
  updateSetting,
  updateSettingSchema,
  createAdmin,
  createAdminSchema,
} from '../controllers/admin.controller'

export const adminRoutes = Router()

adminRoutes.post('/login', authRateLimiter, validate(loginSchema), login)

const protectedAdmin = Router()
protectedAdmin.use(requireAuth('admin'))

protectedAdmin.get('/dashboard-stats', dashboardStats)

protectedAdmin.get('/technicians', listTechnicians)
protectedAdmin.patch('/technicians/:id/approve', approveTechnician)
protectedAdmin.patch('/technicians/:id/reject', validate(rejectSchema), rejectTechnician)
protectedAdmin.patch('/technicians/:id/suspend', suspendTechnician)

protectedAdmin.get('/orders', listOrders)
protectedAdmin.get('/orders/:id', getOrder)

protectedAdmin.get('/disputes', listDisputes)
protectedAdmin.patch('/disputes/:id/resolve', validate(resolveDisputeSchema), resolveDispute)

protectedAdmin.post('/categories', validate(categoryUpsertSchema), upsertCategory)
protectedAdmin.delete('/categories/:slug', deleteCategory)

protectedAdmin.get('/settings', listSettings)
protectedAdmin.patch('/settings/:key', validate(updateSettingSchema), updateSetting)

protectedAdmin.post('/admins', validate(createAdminSchema), createAdmin)

adminRoutes.use(protectedAdmin)
