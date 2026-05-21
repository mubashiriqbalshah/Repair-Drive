/**
 * End-to-end smoke test for the Repair Drive backend.
 *
 * Spins up an in-memory MongoDB, starts the HTTP server, then walks through
 * the full customer + technician + admin flow via real HTTP calls.
 * Prints each step with status, fails loudly on first error.
 *
 * Run: npm run smoke
 */

import { MongoMemoryServer } from 'mongodb-memory-server'
import http from 'http'
import mongoose from 'mongoose'

// Wire env BEFORE importing app modules
process.env.NODE_ENV = 'development'
process.env.PORT = '4099'
process.env.JWT_ACCESS_SECRET = 'smoke-test-access-secret-very-long-string'
process.env.JWT_REFRESH_SECRET = 'smoke-test-refresh-secret-very-long-string'
process.env.SMS_PROVIDER = 'mock'
process.env.SEED_ADMIN_EMAIL = 'admin@repairdrive.pk'
process.env.SEED_ADMIN_PASSWORD = 'AdminPass123!'

const BASE = 'http://localhost:4099'

let pass = 0
let fail = 0

function ok(label: string, extra = '') {
  pass++
  console.log(`  ✓ ${label}${extra ? '  ' + extra : ''}`)
}
function bad(label: string, err: unknown) {
  fail++
  console.log(`  ✗ ${label}`)
  console.log('    ', err)
}
function section(name: string) {
  console.log(`\n── ${name} ──`)
}

async function api(path: string, init: RequestInit & { token?: string } = {}) {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (init.headers) Object.assign(headers, init.headers as Record<string, string>)
  if (init.token) headers['authorization'] = `Bearer ${init.token}`
  const res = await fetch(`${BASE}${path}`, { ...init, headers })
  const text = await res.text()
  let body: unknown = null
  try { body = text ? JSON.parse(text) : null } catch { body = text }
  return { status: res.status, body: body as Record<string, unknown> }
}

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`assert failed: ${msg}`)
}

async function run() {
  console.log('Starting in-memory MongoDB...')
  const mongo = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongo.getUri()
  console.log(`  using ${process.env.MONGODB_URI}`)

  const { connectDb } = await import('../config/db')
  const { createApp } = await import('../app')
  const { attachSocket } = await import('../socket')

  await connectDb()
  const app = createApp()
  const server = http.createServer(app)
  attachSocket(server)
  await new Promise<void>((r) => server.listen(4099, r))
  console.log('Server listening on :4099')

  try {
    section('Seed: categories, settings, admin')
    {
      const { Category, Setting, Admin } = await import('../models')
      const { SETTING_KEYS } = await import('../models/Setting')
      const { hashPassword } = await import('../utils/hash')

      await Category.create([
        { slug: 'ac', nameEn: 'AC Repair', nameUr: 'اے سی مرمت', order: 1, active: true },
        { slug: 'fridge', nameEn: 'Refrigerator', nameUr: 'فریج', order: 2, active: true },
      ])
      await Setting.create([
        { key: SETTING_KEYS.defaultCommissionPercent, value: 12 },
        { key: SETTING_KEYS.orderSearchRadiusKm, value: 10 },
      ])
      await Admin.create({
        email: 'admin@repairdrive.pk',
        passwordHash: await hashPassword('AdminPass123!'),
        name: 'Super Admin',
        role: 'super_admin',
      })
      ok('seeded categories, settings, admin')
    }

    section('Public: GET /v1/categories')
    {
      const r = await api('/v1/categories')
      assert(r.status === 200, 'expected 200')
      const cats = (r.body as { categories: unknown[] }).categories
      assert(Array.isArray(cats) && cats.length === 2, 'expected 2 categories')
      ok('categories listed', `(${cats.length} found)`)
    }

    section('Customer: signup via OTP')
    let customerToken = ''
    let customerId = ''
    {
      const customerPhone = '03001112222'
      let r = await api('/v1/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone: customerPhone }) })
      assert(r.status === 200, 'send-otp failed: ' + JSON.stringify(r.body))
      ok('send-otp', `devCode=${(r.body as { devCode: string }).devCode}`)

      r = await api('/v1/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: customerPhone, code: '123456', role: 'customer' }),
      })
      assert(r.status === 200, 'verify-otp failed: ' + JSON.stringify(r.body))
      const body = r.body as { accessToken: string; user: { id: string }; isNewUser: boolean }
      customerToken = body.accessToken
      customerId = body.user.id
      ok('verify-otp', `isNewUser=${body.isNewUser}, customerId=${customerId}`)
    }

    section('Customer: update profile + add address')
    {
      let r = await api('/v1/customer/profile', {
        method: 'PATCH',
        token: customerToken,
        body: JSON.stringify({ name: 'Ali Khan' }),
      })
      assert(r.status === 200, 'update profile failed')
      ok('profile updated')

      r = await api('/v1/customer/addresses', {
        method: 'POST',
        token: customerToken,
        body: JSON.stringify({
          label: 'Home', lat: 31.5204, lng: 74.3587,
          fullAddress: 'House 5, DHA Phase 5, Lahore', landmark: 'Near park', isDefault: true,
        }),
      })
      assert(r.status === 200, 'add address failed')
      ok('address added')
    }

    section('Technician: signup, onboard, get approved')
    let techToken = ''
    let techId = ''
    {
      const techPhone = '03004445555'
      let r = await api('/v1/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone: techPhone }) })
      assert(r.status === 200, 'tech send-otp failed')

      r = await api('/v1/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: techPhone, code: '123456', role: 'technician' }),
      })
      assert(r.status === 200, 'tech verify-otp failed')
      const body = r.body as { accessToken: string; user: { id: string } }
      techToken = body.accessToken
      techId = body.user.id
      ok('technician signed up', `techId=${techId}`)

      r = await api('/v1/technician/onboard', {
        method: 'POST',
        token: techToken,
        body: JSON.stringify({
          name: 'Ahmed Mistri',
          cnic: '35201-1234567-1',
          cnicFrontPhoto: 'https://example.com/front.jpg',
          cnicBackPhoto: 'https://example.com/back.jpg',
          selfieWithCnic: 'https://example.com/selfie.jpg',
          categories: ['ac', 'fridge'],
          experienceYears: 8,
          serviceAreas: ['Lahore'],
          bankAccount: {
            accountTitle: 'Ahmed Khan',
            accountNumber: 'PK12ABCD1234567890',
            bankName: 'HBL',
          },
        }),
      })
      assert(r.status === 200, 'onboard failed: ' + JSON.stringify(r.body))
      ok('KYC submitted')

      // Tech tries to go online before approval — should fail with 403
      r = await api('/v1/technician/online-status', {
        method: 'PATCH', token: techToken, body: JSON.stringify({ isOnline: true }),
      })
      assert(r.status === 403, 'expected 403 before approval, got ' + r.status)
      ok('rejected online toggle before approval (403)')
    }

    section('Admin: login + approve technician')
    let adminToken = ''
    {
      let r = await api('/v1/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@repairdrive.pk', password: 'AdminPass123!' }),
      })
      assert(r.status === 200, 'admin login failed: ' + JSON.stringify(r.body))
      adminToken = (r.body as { accessToken: string }).accessToken
      ok('admin logged in')

      r = await api('/v1/admin/dashboard-stats', { token: adminToken })
      assert(r.status === 200, 'dashboard stats failed')
      ok('dashboard stats', `pendingTechs=${(r.body as { pendingTechnicians: number }).pendingTechnicians}`)

      r = await api(`/v1/admin/technicians/${techId}/approve`, { method: 'PATCH', token: adminToken })
      assert(r.status === 200, 'approve failed')
      assert((r.body as { technician: { status: string } }).technician.status === 'approved', 'not approved')
      ok('technician approved')
    }

    section('Technician: go online + set location')
    {
      let r = await api('/v1/technician/online-status', {
        method: 'PATCH', token: techToken, body: JSON.stringify({ isOnline: true }),
      })
      assert(r.status === 200, 'go online failed: ' + JSON.stringify(r.body))
      ok('went online')

      r = await api('/v1/technician/location', {
        method: 'PATCH', token: techToken, body: JSON.stringify({ lat: 31.5204, lng: 74.3587 }),
      })
      assert(r.status === 200, 'location update failed')
      ok('location set (Lahore)')
    }

    section('Customer: create order')
    let orderId = ''
    {
      const r = await api('/v1/customer/orders', {
        method: 'POST',
        token: customerToken,
        body: JSON.stringify({
          category: 'ac',
          subcategory: 'split-ac',
          problemDescription: 'AC not cooling, making noise',
          photos: ['https://example.com/ac.jpg'],
          location: { lat: 31.5210, lng: 74.3590, fullAddress: 'House 5, DHA Phase 5', landmark: 'Near park' },
          customerBudget: 2000,
        }),
      })
      assert(r.status === 201, 'create order failed: ' + JSON.stringify(r.body))
      orderId = (r.body as { order: { _id: string } }).order._id
      ok('order created', `orderId=${orderId}`)
    }

    section('Technician: see nearby orders + make offer')
    let offerId = ''
    {
      let r = await api(`/v1/technician/nearby-orders?lat=31.5204&lng=74.3587&radius=10000`, {
        token: techToken,
      })
      assert(r.status === 200, 'nearby-orders failed')
      const orders = (r.body as { orders: unknown[] }).orders
      assert(orders.length >= 1, 'should see at least 1 order')
      ok('nearby orders fetched', `(${orders.length} found)`)

      r = await api(`/v1/technician/orders/${orderId}/offer`, {
        method: 'POST',
        token: techToken,
        body: JSON.stringify({ price: 2500, note: 'Gas refill included' }),
      })
      assert(r.status === 201, 'make offer failed: ' + JSON.stringify(r.body))
      const order = (r.body as { order: { offers: { _id: string }[] } }).order
      offerId = order.offers[0]._id
      ok('offer made', `Rs.2500, offerId=${offerId}`)
    }

    section('Customer: accept offer')
    {
      const r = await api(`/v1/customer/orders/${orderId}/accept-offer`, {
        method: 'PATCH',
        token: customerToken,
        body: JSON.stringify({ offerId }),
      })
      assert(r.status === 200, 'accept offer failed: ' + JSON.stringify(r.body))
      const order = (r.body as { order: { status: string; agreedPrice: number } }).order
      assert(order.status === 'assigned', 'expected assigned')
      assert(order.agreedPrice === 2500, 'expected agreedPrice 2500')
      ok('offer accepted', `status=${order.status}, agreedPrice=${order.agreedPrice}`)
    }

    section('Order progression: enroute → arrived → in_progress → completed')
    {
      for (const status of ['enroute', 'arrived', 'in_progress']) {
        const r = await api(`/v1/technician/orders/${orderId}/status`, {
          method: 'PATCH', token: techToken, body: JSON.stringify({ status }),
        })
        assert(r.status === 200, `transition to ${status} failed: ` + JSON.stringify(r.body))
        ok(`status → ${status}`)
      }
      // Final completion with finalPrice different from agreed
      const r = await api(`/v1/technician/orders/${orderId}/status`, {
        method: 'PATCH', token: techToken,
        body: JSON.stringify({ status: 'completed', finalPrice: 3000 }),
      })
      assert(r.status === 200, 'complete failed: ' + JSON.stringify(r.body))
      const order = (r.body as { order: { status: string; finalPrice: number; platformCommission: number; technicianPayout: number } }).order
      assert(order.status === 'completed', 'expected completed')
      assert(order.finalPrice === 3000, 'final price mismatch')
      assert(order.platformCommission === 360, `expected commission 360 (12% of 3000), got ${order.platformCommission}`)
      assert(order.technicianPayout === 2640, 'payout mismatch')
      ok('order completed', `finalPrice=Rs.${order.finalPrice}, commission=Rs.${order.platformCommission}, payout=Rs.${order.technicianPayout}`)
    }

    section('Customer: rate technician')
    {
      const r = await api(`/v1/customer/orders/${orderId}/rate`, {
        method: 'POST', token: customerToken,
        body: JSON.stringify({ stars: 5, review: 'Bohat acha kaam kiya!' }),
      })
      assert(r.status === 200, 'rate failed: ' + JSON.stringify(r.body))
      ok('rated 5 stars')

      const techRes = await api('/v1/technician/profile', { token: techToken })
      const tech = (techRes.body as { technician: { rating: number; ratingCount: number; totalJobs: number; walletBalance: number } }).technician
      assert(tech.rating === 5, `expected rating 5, got ${tech.rating}`)
      assert(tech.totalJobs === 1, 'expected 1 job')
      assert(tech.walletBalance === 2640, `expected wallet 2640, got ${tech.walletBalance}`)
      ok('technician stats updated', `rating=${tech.rating}, jobs=${tech.totalJobs}, wallet=Rs.${tech.walletBalance}`)
    }

    section('Technician: check earnings')
    {
      const r = await api('/v1/technician/earnings', { token: techToken })
      assert(r.status === 200, 'earnings failed')
      const e = r.body as { todayEarnings: number; todayJobs: number; totalEarnings: number }
      assert(e.todayEarnings === 2640, `expected 2640, got ${e.todayEarnings}`)
      ok('earnings', `today=Rs.${e.todayEarnings}, jobs=${e.todayJobs}`)
    }

    section('Auth: invalid token + refresh')
    {
      let r = await api('/v1/customer/profile', { token: 'garbage.token.here' })
      assert(r.status === 401, 'expected 401 for bad token')
      ok('invalid token rejected (401)')

      // Refresh
      const loginRes = await api('/v1/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: '+923001112222', code: '123456', role: 'customer' }),
      })
      // (Have to send a new OTP first)
      await api('/v1/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone: '03001112222' }) })
      const verifyRes = await api('/v1/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: '03001112222', code: '123456', role: 'customer' }),
      })
      const refreshToken = (verifyRes.body as { refreshToken: string }).refreshToken
      r = await api('/v1/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) })
      assert(r.status === 200, 'refresh failed')
      ok('refresh token works')
      void loginRes
    }

    section('Edge: rate-limit on OTP (3 attempts allowed)')
    {
      const phone = '03009998888'
      let last: { status: number } = { status: 0 }
      for (let i = 0; i < 5; i++) {
        last = await api('/v1/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) })
      }
      assert(last.status === 429, `expected 429 after 5 attempts, got ${last.status}`)
      ok('rate-limit kicks in (429)')
    }

    section('Edge: validation error')
    {
      const r = await api('/v1/customer/orders', {
        method: 'POST', token: customerToken,
        body: JSON.stringify({ category: 'ac' /* missing problemDescription, location */ }),
      })
      assert(r.status === 400, 'expected 400')
      ok('validation error returned (400)')
    }
  } catch (err) {
    bad('test run aborted', err)
  } finally {
    console.log('\n──────────────')
    console.log(`Result: ${pass} passed, ${fail} failed`)
    server.close()
    await mongoose.disconnect()
    await mongo.stop()
    process.exit(fail > 0 ? 1 : 0)
  }
}

run().catch((err) => {
  console.error('Bootstrap failed:', err)
  process.exit(1)
})
