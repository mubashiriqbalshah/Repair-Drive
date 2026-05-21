import { z } from 'zod'
import { asyncHandler } from '../utils/async'
import { AppError } from '../utils/errors'
import { normalizePkPhone } from '../utils/phone'
import { hashOtp, randomDigits, verifyOtp } from '../utils/hash'
import { OtpCode, Customer, Technician } from '../models'
import { getSmsProvider } from '../services/sms'
import { issueTokenPair, verifyRefreshToken } from '../services/jwt'
import { env } from '../config/env'

export const sendOtpSchema = z.object({
  phone: z.string().min(10).max(20),
})

export const sendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body as z.infer<typeof sendOtpSchema>
  const normalized = normalizePkPhone(phone)
  if (!normalized) throw AppError.badRequest('Invalid Pakistan mobile number')

  // Random code when a real SMS provider is wired up; hardcoded mock code otherwise.
  const isMock = env.SMS_PROVIDER === 'mock'
  const code = isMock ? '123456' : randomDigits(6)
  const codeHash = await hashOtp(code)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await OtpCode.deleteMany({ phone: normalized, consumed: false })
  await OtpCode.create({ phone: normalized, codeHash, expiresAt })

  const sms = getSmsProvider()
  const result = await sms.sendOtp(normalized, code)
  if (!result.success) throw AppError.internal('Failed to send OTP')

  res.json({
    success: true,
    phone: normalized,
    expiresIn: 300,
    // Only echo back the code in mock mode (dev convenience). Never in production / real SMS.
    ...(isMock ? { devCode: code } : {}),
  })
})

export const verifyOtpSchema = z.object({
  phone: z.string(),
  code: z.string().length(6),
  role: z.enum(['customer', 'technician']),
})

export const verifyOtpHandler = asyncHandler(async (req, res) => {
  const { phone, code, role } = req.body as z.infer<typeof verifyOtpSchema>
  const normalized = normalizePkPhone(phone)
  if (!normalized) throw AppError.badRequest('Invalid phone')

  const otp = await OtpCode.findOne({ phone: normalized, consumed: false }).sort({ createdAt: -1 })
  if (!otp) throw AppError.badRequest('No OTP requested for this number')
  if (otp.expiresAt < new Date()) throw AppError.badRequest('OTP expired, request a new one')
  if (otp.attempts >= 5) throw AppError.tooMany('Too many incorrect attempts')

  const ok = await verifyOtp(code, otp.codeHash)
  if (!ok) {
    otp.attempts += 1
    await otp.save()
    throw AppError.badRequest('Incorrect OTP')
  }

  otp.consumed = true
  await otp.save()

  let userId: string
  let isNewUser = false

  if (role === 'customer') {
    let user = await Customer.findOne({ phone: normalized })
    if (!user) {
      user = await Customer.create({ phone: normalized })
      isNewUser = true
    }
    user.lastActiveAt = new Date()
    await user.save()
    userId = user._id.toString()
  } else {
    let tech = await Technician.findOne({ phone: normalized })
    if (!tech) {
      tech = await Technician.create({ phone: normalized })
      isNewUser = true
    }
    userId = tech._id.toString()
  }

  const tokens = issueTokenPair(userId, role)

  res.json({
    success: true,
    isNewUser,
    user: { id: userId, role, phone: normalized },
    ...tokens,
  })
})

export const refreshSchema = z.object({
  refreshToken: z.string(),
})

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body as z.infer<typeof refreshSchema>
  try {
    const payload = verifyRefreshToken(refreshToken)
    const tokens = issueTokenPair(payload.sub, payload.role)
    res.json({ success: true, ...tokens })
  } catch {
    throw AppError.unauthorized('Invalid refresh token')
  }
})

export const logout = asyncHandler(async (_req, res) => {
  res.json({ success: true })
})
