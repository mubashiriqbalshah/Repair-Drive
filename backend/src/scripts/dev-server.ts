/**
 * Persistent dev server with in-memory MongoDB.
 *
 * Use this when you want the backend running indefinitely for testing the
 * mobile apps WITHOUT installing MongoDB locally. Seeds categories, settings,
 * a super-admin, and ONE pre-approved technician (so the customer app sees
 * something happen when it places an order).
 *
 * Run: npm run dev:mem
 */

import http from 'http'
import dotenv from 'dotenv'
import { MongoMemoryServer } from 'mongodb-memory-server'

// Load .env file (so SMS_PROVIDER, TWILIO_*, etc. configured by user are picked up)
dotenv.config()

process.env.NODE_ENV = process.env.NODE_ENV ?? 'development'
process.env.PORT = process.env.PORT ?? '4000'
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'dev-mem-access-secret-must-be-long-enough'
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-mem-refresh-secret-must-be-long-enough'
process.env.SMS_PROVIDER = process.env.SMS_PROVIDER ?? 'mock'
process.env.SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@repairdrive.pk'
process.env.SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'AdminPass123!'
process.env.CORS_ORIGINS = process.env.CORS_ORIGINS ?? '*'

async function main() {
  console.log('━━━ Repair Drive dev server (in-memory MongoDB) ━━━\n')

  const mongo = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongo.getUri()
  console.log(`📦 MongoDB:  ${process.env.MONGODB_URI}`)

  const { connectDb } = await import('../config/db')
  const { createApp } = await import('../app')
  const { attachSocket, emitToUser } = await import('../socket')
  const { Admin, Category, Order, Setting, Technician } = await import('../models')
  const { SETTING_KEYS } = await import('../models/Setting')
  const { hashPassword } = await import('../utils/hash')

  await connectDb()

  console.log('🌱 Seeding...')

  await Category.create([
    { slug: 'ac', nameEn: 'AC Repair', nameUr: 'اے سی مرمت', order: 1, active: true,
      subcategories: [
        { slug: 'split-ac', nameEn: 'Split AC', nameUr: 'اسپلٹ اے سی' },
        { slug: 'window-ac', nameEn: 'Window AC', nameUr: 'ونڈو اے سی' },
        { slug: 'gas-refill', nameEn: 'Gas Refill', nameUr: 'گیس ری فل' },
      ] },
    { slug: 'fridge', nameEn: 'Refrigerator', nameUr: 'فریج', order: 2, active: true },
    { slug: 'washing-machine', nameEn: 'Washing Machine', nameUr: 'واشنگ مشین', order: 3, active: true },
    { slug: 'oven', nameEn: 'Microwave / Oven', nameUr: 'مائیکروویو / اوون', order: 4, active: true },
    { slug: 'motor', nameEn: 'Motor / Pump', nameUr: 'موٹر / پمپ', order: 5, active: true },
    { slug: 'tv', nameEn: 'TV / LED', nameUr: 'ٹی وی / ایل ای ڈی', order: 6, active: true },
    { slug: 'electrician', nameEn: 'Electrician', nameUr: 'الیکٹریشن', order: 7, active: true },
    { slug: 'plumber', nameEn: 'Plumber', nameUr: 'پلمبر', order: 8, active: true },
    { slug: 'carpenter', nameEn: 'Carpenter', nameUr: 'بڑھئی', order: 9, active: true },
    { slug: 'mobile-laptop', nameEn: 'Mobile / Laptop', nameUr: 'موبائل / لیپ ٹاپ', order: 10, active: true },
  ])
  console.log('   ✓ 10 categories')

  await Setting.create([
    { key: SETTING_KEYS.defaultCommissionPercent, value: 12 },
    { key: SETTING_KEYS.orderSearchRadiusKm, value: 50 },
    { key: SETTING_KEYS.offerExpiryMinutes, value: 5 },
  ])
  console.log('   ✓ Settings (commission=12%, radius=50km)')

  await Admin.create({
    email: process.env.SEED_ADMIN_EMAIL,
    passwordHash: await hashPassword(process.env.SEED_ADMIN_PASSWORD!),
    name: 'Super Admin',
    role: 'super_admin',
  })
  console.log(`   ✓ Admin: ${process.env.SEED_ADMIN_EMAIL} / ${process.env.SEED_ADMIN_PASSWORD}`)

  // Pre-approved test technician so customer orders can be answered
  const tech = await Technician.create({
    phone: '+923009999999',
    name: 'Ahmed Test Mistri',
    profilePhoto: '',
    cnicHash: 'test',
    categories: ['ac', 'fridge', 'washing-machine', 'oven', 'motor', 'tv', 'electrician', 'plumber', 'carpenter', 'mobile-laptop'],
    experienceYears: 10,
    serviceAreas: ['Lahore'],
    bankAccount: { accountTitle: 'Ahmed', accountNumber: '123', bankName: 'HBL' },
    status: 'approved',
    rating: 4.7,
    ratingCount: 124,
    totalJobs: 124,
    isOnline: true,
    currentLocation: {
      type: 'Point',
      coordinates: [74.3587, 31.5204], // Lahore center
      updatedAt: new Date(),
    },
  })
  console.log(`   ✓ Test technician approved (phone +923009999999, in Lahore, online)`)
  console.log(`     → To simulate a bid, run: npm run sim:bid -- ${tech._id}`)

  const app = createApp()
  const server = http.createServer(app)
  attachSocket(server)

  const port = Number(process.env.PORT)
  server.listen(port, '0.0.0.0', () => {
    console.log(`\n🚀 Server listening on:`)
    console.log(`   - http://localhost:${port}     (this PC)`)
    console.log(`   - http://192.168.2.106:${port}  (phone on same WiFi)`)
    if (process.env.SMS_PROVIDER === 'mock') {
      console.log(`\n💡 SMS_PROVIDER=mock — OTP is always: 123456 (prints to console + auto-fills in app)`)
    } else {
      console.log(`\n📨 SMS_PROVIDER=${process.env.SMS_PROVIDER} — REAL SMS will be sent. Random 6-digit OTP each time.`)
    }
    console.log(`📱 Customer app should point API_BASE_URL → http://192.168.2.106:${port}/v1`)
    console.log(`\n🤖 Auto-bid simulator running — test mistri will bid on new orders\n`)
    console.log(`Ctrl+C to stop\n`)
  })

  // Auto-bid simulator: poll for new searching orders and have test mistri bid
  setInterval(async () => {
    try {
      const searchingOrders = await Order.find({
        status: 'searching',
        createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) }, // last 10 min
      }).limit(10)

      for (const order of searchingOrders) {
        const alreadyOffered = order.offers.some(
          (o) => o.technicianId.toString() === tech._id.toString(),
        )
        if (alreadyOffered) continue

        // Wait at least 4 seconds after order creation before bidding (feels realistic)
        const ageMs = Date.now() - new Date(order.createdAt).getTime()
        if (ageMs < 4000) continue

        const budget = order.customerBudget ?? 1500
        const offerPrice = Math.round(budget * (0.95 + Math.random() * 0.2)) // 95–115% of budget

        order.offers.push({
          technicianId: tech._id,
          price: offerPrice,
          note: 'Aaj hi aa sakta hu, gas charge alag hoga agar refill chahiye',
          status: 'pending',
          createdAt: new Date(),
        })
        await order.save()

        console.log(`🤖 Test mistri bid Rs.${offerPrice} on order ${order._id} (customer budget: Rs.${budget})`)

        // Emit socket event to customer for real-time offer card
        emitToUser(order.customerId.toString(), 'customer', 'order:new_offer', {
          orderId: order._id,
          offer: {
            _id: order.offers[order.offers.length - 1]._id,
            technicianId: tech._id,
            name: tech.name,
            rating: tech.rating,
            ratingCount: tech.ratingCount,
            profilePhoto: tech.profilePhoto,
            price: offerPrice,
            note: 'Aaj hi aa sakta hu, gas charge alag hoga agar refill chahiye',
          },
        })
      }

      // Also auto-progress active orders to demo the full flow
      const activeOrders = await Order.find({
        technicianId: tech._id,
        status: { $in: ['assigned', 'enroute', 'arrived', 'in_progress'] },
      })

      for (const order of activeOrders) {
        const lastEvent = order.timeline[order.timeline.length - 1]
        const ageMs = Date.now() - new Date(lastEvent?.at ?? order.updatedAt).getTime()
        if (ageMs < 8000) continue // 8 sec per stage for visible progression

        const next: Record<string, string> = {
          assigned: 'enroute',
          enroute: 'arrived',
          arrived: 'in_progress',
          in_progress: 'completed',
        }
        const nextStatus = next[order.status]
        if (!nextStatus) continue

        order.status = nextStatus as typeof order.status
        order.timeline.push({ event: nextStatus, at: new Date(), by: 'technician' })

        if (nextStatus === 'completed') {
          const finalPrice = order.agreedPrice ?? 2000
          order.finalPrice = finalPrice
          const commission = Math.round(finalPrice * 0.12)
          order.platformCommission = commission
          order.technicianPayout = finalPrice - commission
        }

        await order.save()
        console.log(`🤖 Order ${order._id} auto-progressed: → ${nextStatus}`)

        const { emitToOrder } = await import('../socket')
        emitToOrder(order._id.toString(), 'order:status_changed', {
          orderId: order._id,
          status: nextStatus,
        })
      }
    } catch (err) {
      console.error('[auto-bid] error:', err)
    }
  }, 2000)

  const shutdown = async (sig: string) => {
    console.log(`\n${sig} received, shutting down...`)
    server.close()
    const mongoose = await import('mongoose')
    await mongoose.default.disconnect()
    await mongo.stop()
    process.exit(0)
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main().catch((err) => {
  console.error('Dev server bootstrap failed:', err)
  process.exit(1)
})
