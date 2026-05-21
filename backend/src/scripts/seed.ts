import { connectDb } from '../config/db'
import { Admin, Category, Setting } from '../models'
import { SETTING_KEYS } from '../models/Setting'
import { hashPassword } from '../utils/hash'
import { env } from '../config/env'
import mongoose from 'mongoose'

const CATEGORIES = [
  { slug: 'ac', nameEn: 'AC Repair', nameUr: 'اے سی مرمت', baseSuggestedPrice: 1500, order: 1,
    subcategories: [
      { slug: 'split-ac', nameEn: 'Split AC', nameUr: 'اسپلٹ اے سی' },
      { slug: 'window-ac', nameEn: 'Window AC', nameUr: 'ونڈو اے سی' },
      { slug: 'inverter-ac', nameEn: 'Inverter AC', nameUr: 'انورٹر اے سی' },
      { slug: 'gas-refill', nameEn: 'Gas Refill', nameUr: 'گیس ری فل' },
    ],
  },
  { slug: 'fridge', nameEn: 'Refrigerator Repair', nameUr: 'فریج مرمت', baseSuggestedPrice: 1200, order: 2 },
  { slug: 'washing-machine', nameEn: 'Washing Machine Repair', nameUr: 'واشنگ مشین مرمت', baseSuggestedPrice: 1000, order: 3 },
  { slug: 'oven', nameEn: 'Microwave / Oven Repair', nameUr: 'مائیکروویو / اوون', baseSuggestedPrice: 800, order: 4 },
  { slug: 'motor', nameEn: 'Electric Motor / Water Pump', nameUr: 'موٹر / واٹر پمپ', baseSuggestedPrice: 1500, order: 5 },
  { slug: 'tv', nameEn: 'TV / LED Repair', nameUr: 'ٹی وی / ایل ای ڈی مرمت', baseSuggestedPrice: 1000, order: 6 },
  { slug: 'electrician', nameEn: 'Electrician', nameUr: 'الیکٹریشن', baseSuggestedPrice: 700, order: 7 },
  { slug: 'plumber', nameEn: 'Plumber', nameUr: 'پلمبر', baseSuggestedPrice: 600, order: 8 },
  { slug: 'carpenter', nameEn: 'Carpenter', nameUr: 'بڑھئی', baseSuggestedPrice: 800, order: 9 },
  { slug: 'mobile-laptop', nameEn: 'Mobile / Laptop Repair', nameUr: 'موبائل / لیپ ٹاپ مرمت', baseSuggestedPrice: 1000, order: 10 },
]

const SETTINGS = [
  { key: SETTING_KEYS.defaultCommissionPercent, value: 12, description: 'Default platform commission % per order' },
  { key: SETTING_KEYS.orderSearchRadiusKm, value: 10, description: 'Radius in km to broadcast new orders' },
  { key: SETTING_KEYS.offerExpiryMinutes, value: 5, description: 'Minutes before pending offers expire' },
  { key: SETTING_KEYS.cancellationFeePkr, value: 200, description: 'Fee if customer cancels after technician arrival' },
]

async function run() {
  await connectDb()
  console.log('[seed] connected')

  for (const cat of CATEGORIES) {
    await Category.updateOne(
      { slug: cat.slug },
      { $set: { ...cat, active: true, commissionPercent: null } },
      { upsert: true },
    )
  }
  console.log(`[seed] upserted ${CATEGORIES.length} categories`)

  for (const setting of SETTINGS) {
    await Setting.updateOne({ key: setting.key }, { $set: setting }, { upsert: true })
  }
  console.log(`[seed] upserted ${SETTINGS.length} settings`)

  const existing = await Admin.findOne({ email: env.SEED_ADMIN_EMAIL })
  if (!existing) {
    await Admin.create({
      email: env.SEED_ADMIN_EMAIL,
      passwordHash: await hashPassword(env.SEED_ADMIN_PASSWORD),
      name: 'Super Admin',
      role: 'super_admin',
    })
    console.log(`[seed] created super admin: ${env.SEED_ADMIN_EMAIL}`)
  } else {
    console.log(`[seed] super admin already exists: ${env.SEED_ADMIN_EMAIL}`)
  }

  await mongoose.disconnect()
  console.log('[seed] done')
}

run().catch((err) => {
  console.error('[seed] failed', err)
  process.exit(1)
})
