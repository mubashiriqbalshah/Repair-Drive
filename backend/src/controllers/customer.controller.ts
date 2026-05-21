import { z } from 'zod'
import { asyncHandler } from '../utils/async'
import { AppError } from '../utils/errors'
import { Customer, Order, Technician, Chat } from '../models'
import { broadcastNewOrder, emitToOrder, emitToUser } from '../socket'
import { SETTING_KEYS, getSetting } from '../models/Setting'

export const getProfile = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.auth!.userId).lean()
  if (!customer) throw AppError.notFound('Customer not found')
  res.json({ customer })
})

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  profilePhoto: z.string().url().optional(),
  fcmToken: z.string().optional(),
})

export const updateProfile = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof updateProfileSchema>
  const update: Record<string, unknown> = {}
  if (body.name !== undefined) update.name = body.name
  if (body.profilePhoto !== undefined) update.profilePhoto = body.profilePhoto

  const customer = await Customer.findByIdAndUpdate(req.auth!.userId, update, { new: true })
  if (!customer) throw AppError.notFound('Customer not found')

  if (body.fcmToken) {
    await Customer.updateOne(
      { _id: req.auth!.userId },
      { $addToSet: { fcmTokens: body.fcmToken } },
    )
  }
  res.json({ customer })
})

export const addressSchema = z.object({
  label: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  fullAddress: z.string().min(1),
  landmark: z.string().optional().default(''),
  isDefault: z.boolean().optional().default(false),
})

export const addAddress = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof addressSchema>
  const customer = await Customer.findById(req.auth!.userId)
  if (!customer) throw AppError.notFound('Customer not found')

  if (body.isDefault) {
    customer.addresses.forEach((a) => {
      a.isDefault = false
    })
  }
  customer.addresses.push(body)
  await customer.save()
  res.json({ addresses: customer.addresses })
})

export const removeAddress = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.auth!.userId)
  if (!customer) throw AppError.notFound('Customer not found')
  const before = customer.addresses.length
  customer.addresses = customer.addresses.filter((a) => a._id?.toString() !== req.params.id) as typeof customer.addresses
  if (customer.addresses.length === before) throw AppError.notFound('Address not found')
  await customer.save()
  res.json({ addresses: customer.addresses })
})

export const createOrderSchema = z.object({
  category: z.string().min(1),
  subcategory: z.string().optional().default(''),
  problemDescription: z.string().min(5).max(2000),
  photos: z.array(z.string().url()).max(5).optional().default([]),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    fullAddress: z.string().min(1),
    landmark: z.string().optional().default(''),
  }),
  customerBudget: z.number().int().positive().optional(),
  paymentMethod: z.enum(['cash', 'jazzcash', 'easypaisa']).optional().default('cash'),
  scheduledAt: z.string().datetime().optional(),
})

export const createOrder = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof createOrderSchema>
  const order = await Order.create({
    customerId: req.auth!.userId,
    category: body.category,
    subcategory: body.subcategory,
    problemDescription: body.problemDescription,
    photos: body.photos,
    location: {
      type: 'Point',
      coordinates: [body.location.lng, body.location.lat],
      fullAddress: body.location.fullAddress,
      landmark: body.location.landmark,
    },
    customerBudget: body.customerBudget ?? null,
    paymentMethod: body.paymentMethod,
    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
    status: 'searching',
    timeline: [{ event: 'created', at: new Date(), by: 'customer' }],
  })

  const radiusKm = await getSetting(SETTING_KEYS.orderSearchRadiusKm, 10)
  await broadcastNewOrder(order, radiusKm)

  res.status(201).json({ order })
})

export const listOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customerId: req.auth!.userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()
  res.json({ orders })
})

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, customerId: req.auth!.userId }).lean()
  if (!order) throw AppError.notFound('Order not found')
  res.json({ order })
})

export const acceptOfferSchema = z.object({
  offerId: z.string(),
})

export const acceptOffer = asyncHandler(async (req, res) => {
  const { offerId } = req.body as z.infer<typeof acceptOfferSchema>
  const order = await Order.findOne({ _id: req.params.id, customerId: req.auth!.userId })
  if (!order) throw AppError.notFound('Order not found')
  if (order.status !== 'searching') throw AppError.badRequest('Order no longer accepting offers')

  const offer = order.offers.find((o) => o._id?.toString() === offerId)
  if (!offer) throw AppError.notFound('Offer not found')

  offer.status = 'accepted'
  order.offers.forEach((o) => {
    if (o._id?.toString() !== offerId && o.status === 'pending') o.status = 'rejected'
  })
  order.technicianId = offer.technicianId
  order.agreedPrice = offer.price
  order.status = 'assigned'
  order.timeline.push({ event: 'assigned', at: new Date(), by: 'customer' })
  await order.save()

  emitToOrder(order._id.toString(), 'order:status_changed', { orderId: order._id, status: order.status })
  emitToUser(offer.technicianId.toString(), 'technician', 'order:offer_accepted', {
    orderId: order._id,
    agreedPrice: offer.price,
  })
  for (const o of order.offers) {
    if (o._id?.toString() !== offerId && o.technicianId) {
      emitToUser(o.technicianId.toString(), 'technician', 'order:offer_rejected', { orderId: order._id })
    }
  }

  res.json({ order })
})

export const cancelOrderSchema = z.object({
  reason: z.string().min(1).max(500),
})

export const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body as z.infer<typeof cancelOrderSchema>
  const order = await Order.findOne({ _id: req.params.id, customerId: req.auth!.userId })
  if (!order) throw AppError.notFound('Order not found')
  if (['completed', 'cancelled'].includes(order.status)) throw AppError.badRequest('Cannot cancel this order')

  order.status = 'cancelled'
  order.cancellationReason = reason
  order.cancelledBy = 'customer'
  order.timeline.push({ event: 'cancelled', at: new Date(), by: 'customer', meta: { reason } })
  await order.save()

  emitToOrder(order._id.toString(), 'order:status_changed', { orderId: order._id, status: 'cancelled' })
  res.json({ order })
})

export const rateOrderSchema = z.object({
  stars: z.number().int().min(1).max(5),
  review: z.string().max(1000).optional().default(''),
})

export const rateOrder = asyncHandler(async (req, res) => {
  const body = req.body as z.infer<typeof rateOrderSchema>
  const order = await Order.findOne({ _id: req.params.id, customerId: req.auth!.userId })
  if (!order) throw AppError.notFound('Order not found')
  if (order.status !== 'completed') throw AppError.badRequest('Order not completed yet')
  if (order.customerRating?.stars) throw AppError.conflict('Already rated')

  order.customerRating = { stars: body.stars, review: body.review, ratedAt: new Date() }
  await order.save()

  if (order.technicianId) {
    const tech = await Technician.findById(order.technicianId)
    if (tech) {
      const newCount = tech.ratingCount + 1
      tech.rating = (tech.rating * tech.ratingCount + body.stars) / newCount
      tech.ratingCount = newCount
      await tech.save()
    }
  }
  res.json({ order })
})
