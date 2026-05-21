import { Router } from 'express'
import { validate } from '../middleware/validate'
import { otpRateLimiter, authRateLimiter } from '../middleware/rateLimit'
import {
  sendOtp,
  sendOtpSchema,
  verifyOtpHandler,
  verifyOtpSchema,
  refresh,
  refreshSchema,
  logout,
} from '../controllers/auth.controller'

export const authRoutes = Router()

authRoutes.post('/send-otp', otpRateLimiter, validate(sendOtpSchema), sendOtp)
authRoutes.post('/verify-otp', authRateLimiter, validate(verifyOtpSchema), verifyOtpHandler)
authRoutes.post('/refresh', authRateLimiter, validate(refreshSchema), refresh)
authRoutes.post('/logout', logout)
