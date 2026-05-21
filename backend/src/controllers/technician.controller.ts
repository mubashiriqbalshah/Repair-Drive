import { z } from 'zod'
import { asyncHandler } from '../utils/async'
import { AppError } from '../utils/errors'
import { Technician, Order, Transaction, Category } from '../models'
import { sha256 } from '../utils/hash'
import { emitToOrder, emitToUser } from '../socket'
import { SETTING_KEYS, getSetting } from '../models/Setting'

export const getProfile = asyncHandler(async (req, res) => {
  const tech = await Technician.findById(req.auth!.userId).lean()
  if (!tech) throw AppError.notFound('Technician not found')
  res.json({ technician: tech })
})

export const onboardSchema = z.object({
  name: z.string().min(2).max(80),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d$/, 'Invalid CNIC format (12345-1234567-1)'),
  cnicFrontPhoto: z.string().url(),
  cnicBackPhoto: z.string().url(),
  selfieWithCnic: z.string().url(),
  profilePhoto: z.string().url().optional(),
  categories: z.array(z.string()).min(1),
  experienceYears: z.number().int().min(0).max(60),
  serviceAreas: z.array(z.string()).min(1),
  bankAccount: z.object({
    accountTitle: z.string().min(2),
    accountNumber: z.string().min(5),
    bankName: z.string().min(2),
    walletProvider: z.enum(['jazzcash', 'easypaisa']).nullable().optional(),
  }),
})

export const onboard = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof onboardSchema>
  const tech = await Technician.findById(req.auth!.userId)
  if (!tech) throw AppError.notFound('Technician not found')

  if (tech.status === 'approved') throw AppError.conflict('Already approved')

  tech.name = body.name
  tech.cnicHash = sha256(body.cnic.replace(/-/g, ''))
  tech.cnicFrontPhoto = body.cnicFrontPhoto
  tech.cnicBackPhoto = body.cnicBackPhoto
  tech.selfieWithCnic = body.selfieWithCnic
  if (body.profilePhoto) tech.profilePhoto = body.profilePhoto
  tech.categories = body.categories
  tech.experienceYears = body.experienceYears
  tech.serviceAreas = body.serviceAreas
  tech.bankAccount = body.bankAccount
  tech.status = 'pending'
  await tech.save()

  res.json({ technician: tech })
})

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  profilePhoto: z.string().url().optional(),
  categories: z.array(z.string()).optional(),
  serviceAreas: z.array(z.string()).optional(),
  fcmToken: z.string().optional(),
})

export const updateProfile = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof updateProfileSchema>
  const update: Record<string, unknown> = {}
  for (const key of ['name', 'profilePhoto', 'categories', 'serviceAreas'] as const) {
    if (body[key] !== undefined) update[key] = body[key]
  }
  const tech = await Technician.findByIdAndUpdate(req.auth!.userId, update, { new: true })
  if (!tech) throw AppError.notFound('Technician not found')
  if (body.fcmToken) {
    await Technician.updateOne({ _id: tech._id }, { $addToSet: { fcmTokens: body.fcmToken } })
  }
  res.json({ technician: tech })
})

export const onlineStatusSchema = z.object({ isOnline: z.boolean() })

export const setOnlineStatus = asyncHandler(async (req, res) => {
  const { isOnline } = req.body as z.infer<typeof onlineStatusSchema>
  const tech = await Technician.findById(req.auth!.userId)
  if (!tech) throw AppError.notFound('Technician not found')
  if (tech.status !== 'approved') throw AppError.forbidden('Account not approved yet')
  tech.isOnline = isOnline
  await tech.save()
  res.json({ isOnline: tech.isOnline })
})

export const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export const updateLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body as z.infer<typeof locationSchema>
  await Technician.updateOne(
    { _id: req.auth!.userId },
    {
      currentLocation: { type: 'Point', coordinates: [lng, lat], updatedAt: new Date() },
    },
  )

  const activeOrder = await Order.findOne({
    technicianId: req.auth!.userId,
    status: { $in: ['assigned', 'enroute', 'arrived', 'in_progress'] },
  }).lean()
  if (activeOrder) {
    emitToOrder(activeOrder._id.toString(), 'order:technician_location', {
      orderId: activeOrder._id,
      lat,
      lng,
    })
  }
  res.json({ success: true })
})

export const nearbyOrdersQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().default(10000),
})

export const nearbyOrders = asyncHandler(async (req, res) => {
  const { lat, lng, radius } = req.query as unknown as z.infer<typeof nearbyOrdersQuerySchema>
  const tech = await Technician.findById(req.auth!.userId).lean()
  if (!tech) throw AppError.notFound('Technician not found')
  if (tech.status !== 'approved') throw AppError.forbidden('Account not approved yet')

  const orders = await Order.find({
    status: 'searching',
    category: { $in: tech.categories },
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radius,
      },
    },
  })
    .limit(20)
    .lean()

  res.json({ orders })
})

export const offerSchema = z.object({
  price: z.number().int().positive(),
  note: z.string().max(500).optional().default(''),
})

export const makeOffer = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof offerSchema>
  const tech = await Technician.findById(req.auth!.userId).lean()
  if (!tech) throw AppError.notFound('Technician not found')
  if (tech.status !== 'approved') throw AppError.forbidden('Account not approved yet')

  const order = await Order.findById(req.params.id)
  if (!order) throw AppError.notFound('Order not found')
  if (order.status !== 'searching') throw AppError.badRequest('Order no longer accepting offers')

  const existing = order.offers.find((o) => o.technicianId.toString() === req.auth!.userId)
  if (existing) throw AppError.conflict('You have already made an offer on this order')

  order.offers.push({
    technicianId: tech._id,
    price: body.price,
    note: body.note,
    status: 'pending',
    createdAt: new Date(),
  })
  await order.save()

  emitToUser(order.customerId.toString(), 'customer', 'order:new_offer', {
    orderId: order._id,
    offer: {
      technicianId: tech._id,
      name: tech.name,
      rating: tech.rating,
      ratingCount: tech.ratingCount,
      profilePhoto: tech.profilePhoto,
      price: body.price,
      note: body.note,
    },
  })
  res.status(201).json({ order })
})

export const orderStatusSchema = z.object({
  status: z.enum(['enroute', 'arrived', 'in_progress', 'completed']),
  finalPrice: z.number().int().positive().optional(),
})

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof orderStatusSchema>
  const order = await Order.findOne({ _id: req.params.id, technicianId: req.auth!.userId })
  if (!order) throw AppError.notFound('Order not found')

  const validTransitions: Record<string, string[]> = {
    assigned: ['enroute'],
    enroute: ['arrived'],
    arrived: ['in_progress'],
    in_progress: ['completed'],
  }
  if (!validTransitions[order.status]?.includes(body.status)) {
    throw AppError.badRequest(`Invalid transition: ${order.status} -> ${body.status}`)
  }

  order.status = body.status
  order.timeline.push({ event: body.status, at: new Date(), by: 'technician' })

  if (body.status === 'completed') {
    const finalPrice = body.finalPrice ?? order.agreedPrice ?? 0
    order.finalPrice = finalPrice

    const cat = await Category.findOne({ slug: order.category }).lean()
    const defaultPct = await getSetting(SETTING_KEYS.defaultCommissionPercent, 12)
    const pct = cat?.commissionPercent ?? defaultPct
    const commission = Math.round(finalPrice * (pct / 100))
    order.platformCommission = commission
    order.technicianPayout = finalPrice - commission

    await Transaction.create({
      orderId: order._id,
      technicianId: order.technicianId,
      customerId: order.customerId,
      amount: finalPrice,
      commission,
      technicianPayout: finalPrice - commission,
      type: 'order_payment',
      status: 'completed',
      paymentMethod: order.paymentMethod,
    })

    await Technician.updateOne(
      { _id: order.technicianId },
      {
        $inc: {
          totalJobs: 1,
          totalEarnings: finalPrice - commission,
          walletBalance: finalPrice - commission,
        },
      },
    )
  }

  await order.save()
  emitToOrder(order._id.toString(), 'order:status_changed', { orderId: order._id, status: order.status })
  res.json({ order })
})

export const earnings = asyncHandler(async (req, res) => {
  const tech = await Technician.findById(req.auth!.userId).lean()
  if (!tech) throw AppError.notFound('Technician not found')

  const since = new Date()
  since.setHours(0, 0, 0, 0)

  const [todayAgg] = await Transaction.aggregate([
    {
      $match: {
        technicianId: tech._id,
        type: 'order_payment',
        status: 'completed',
        createdAt: { $gte: since },
      },
    },
    { $group: { _id: null, total: { $sum: '$technicianPayout' }, count: { $sum: 1 } } },
  ])

  res.json({
    todayEarnings: todayAgg?.total ?? 0,
    todayJobs: todayAgg?.count ?? 0,
    totalEarnings: tech.totalEarnings,
    totalJobs: tech.totalJobs,
    walletBalance: tech.walletBalance,
  })
})
