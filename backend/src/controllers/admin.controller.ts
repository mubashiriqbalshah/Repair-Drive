import { z } from 'zod'
import { asyncHandler } from '../utils/async'
import { AppError } from '../utils/errors'
import { Admin, Category, Dispute, Order, Setting, Technician, Transaction, Customer } from '../models'
import { verifyPassword, hashPassword } from '../utils/hash'
import { issueTokenPair } from '../services/jwt'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as z.infer<typeof loginSchema>
  const admin = await Admin.findOne({ email: email.toLowerCase(), active: true })
  if (!admin) throw AppError.unauthorized('Invalid credentials')
  const ok = await verifyPassword(password, admin.passwordHash)
  if (!ok) throw AppError.unauthorized('Invalid credentials')

  admin.lastLoginAt = new Date()
  await admin.save()

  const tokens = issueTokenPair(admin._id.toString(), 'admin')
  res.json({
    success: true,
    admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role },
    ...tokens,
  })
})

export const dashboardStats = asyncHandler(async (_req, res) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    todayOrders,
    todayCompleted,
    activeOrders,
    pendingTechnicians,
    approvedTechnicians,
    totalCustomers,
    todayRevenue,
    openDisputes,
  ] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.countDocuments({ createdAt: { $gte: today }, status: 'completed' }),
    Order.countDocuments({ status: { $in: ['searching', 'assigned', 'enroute', 'arrived', 'in_progress'] } }),
    Technician.countDocuments({ status: 'pending' }),
    Technician.countDocuments({ status: 'approved' }),
    Customer.countDocuments({}),
    Transaction.aggregate([
      {
        $match: {
          type: 'order_payment',
          status: 'completed',
          createdAt: { $gte: today },
        },
      },
      { $group: { _id: null, total: { $sum: '$commission' } } },
    ]).then((r) => r[0]?.total ?? 0),
    Dispute.countDocuments({ status: 'open' }),
  ])

  res.json({
    todayOrders,
    todayCompleted,
    activeOrders,
    pendingTechnicians,
    approvedTechnicians,
    totalCustomers,
    todayRevenue,
    openDisputes,
  })
})

export const listTechnicians = asyncHandler(async (req, res) => {
  const { status, search } = req.query as { status?: string; search?: string }
  const query: Record<string, unknown> = {}
  if (status) query.status = status
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { phone: new RegExp(search, 'i') }]
  const technicians = await Technician.find(query).sort({ createdAt: -1 }).limit(100).lean()
  res.json({ technicians })
})

export const approveTechnician = asyncHandler(async (req, res) => {
  const tech = await Technician.findById(req.params.id)
  if (!tech) throw AppError.notFound('Technician not found')
  tech.status = 'approved'
  tech.rejectionReason = ''
  await tech.save()
  res.json({ technician: tech })
})

export const rejectSchema = z.object({ reason: z.string().min(1) })

export const rejectTechnician = asyncHandler(async (req, res) => {
  const { reason } = req.body as z.infer<typeof rejectSchema>
  const tech = await Technician.findById(req.params.id)
  if (!tech) throw AppError.notFound('Technician not found')
  tech.status = 'rejected'
  tech.rejectionReason = reason
  await tech.save()
  res.json({ technician: tech })
})

export const suspendTechnician = asyncHandler(async (req, res) => {
  const tech = await Technician.findById(req.params.id)
  if (!tech) throw AppError.notFound('Technician not found')
  tech.status = 'suspended'
  tech.isOnline = false
  await tech.save()
  res.json({ technician: tech })
})

export const listOrders = asyncHandler(async (req, res) => {
  const { status, category } = req.query as { status?: string; category?: string }
  const query: Record<string, unknown> = {}
  if (status) query.status = status
  if (category) query.category = category
  const orders = await Order.find(query).sort({ createdAt: -1 }).limit(100).lean()
  res.json({ orders })
})

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).lean()
  if (!order) throw AppError.notFound('Order not found')
  res.json({ order })
})

export const listDisputes = asyncHandler(async (req, res) => {
  const { status } = req.query as { status?: string }
  const query: Record<string, unknown> = {}
  if (status) query.status = status
  const disputes = await Dispute.find(query).sort({ createdAt: -1 }).limit(100).lean()
  res.json({ disputes })
})

export const resolveDisputeSchema = z.object({
  resolution: z.string().min(1),
  action: z.enum(['refund', 'penalize_technician', 'no_action']),
})

export const resolveDispute = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof resolveDisputeSchema>
  const dispute = await Dispute.findById(req.params.id)
  if (!dispute) throw AppError.notFound('Dispute not found')
  dispute.status = 'resolved'
  dispute.resolution = `[${body.action}] ${body.resolution}`
  dispute.resolvedBy = req.auth!.userId as never
  dispute.resolvedAt = new Date()
  await dispute.save()
  res.json({ dispute })
})

export const categoryUpsertSchema = z.object({
  slug: z.string().min(1),
  nameEn: z.string().min(1),
  nameUr: z.string().min(1),
  icon: z.string().optional().default(''),
  subcategories: z.array(z.object({ slug: z.string(), nameEn: z.string(), nameUr: z.string() })).optional().default([]),
  baseSuggestedPrice: z.number().int().nonnegative().optional().default(0),
  commissionPercent: z.number().min(0).max(100).nullable().optional(),
  active: z.boolean().optional().default(true),
  order: z.number().int().optional().default(0),
})

export const upsertCategory = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof categoryUpsertSchema>
  const category = await Category.findOneAndUpdate({ slug: body.slug }, body, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  })
  res.json({ category })
})

export const deleteCategory = asyncHandler(async (req, res) => {
  await Category.deleteOne({ slug: req.params.slug })
  res.json({ success: true })
})

export const listSettings = asyncHandler(async (_req, res) => {
  const settings = await Setting.find().lean()
  res.json({ settings })
})

export const updateSettingSchema = z.object({
  value: z.unknown(),
  description: z.string().optional(),
})

export const updateSetting = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof updateSettingSchema>
  const setting = await Setting.findOneAndUpdate(
    { key: req.params.key },
    { value: body.value, description: body.description },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
  res.json({ setting })
})

export const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['super_admin', 'support', 'finance']).default('support'),
})

export const createAdmin = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof createAdminSchema>
  const existing = await Admin.findOne({ email: body.email.toLowerCase() })
  if (existing) throw AppError.conflict('Admin with this email already exists')
  const admin = await Admin.create({
    email: body.email.toLowerCase(),
    passwordHash: await hashPassword(body.password),
    name: body.name,
    role: body.role,
  })
  res.status(201).json({
    admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role },
  })
})
