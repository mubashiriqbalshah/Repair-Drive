import rateLimit from 'express-rate-limit'

const isDev = process.env.NODE_ENV !== 'production'

export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 100 : 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.body?.phone as string) || req.ip || 'unknown',
  message: {
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many OTP requests. Try again later.' },
  },
})

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 500 : 30,
  standardHeaders: true,
  legacyHeaders: false,
})
