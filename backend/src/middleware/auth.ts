import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, type TokenRole } from '../services/jwt'
import { AppError } from '../utils/errors'

declare module 'express-serve-static-core' {
  interface Request {
    auth?: {
      userId: string
      role: TokenRole
    }
  }
}

export function requireAuth(...roles: TokenRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      return next(AppError.unauthorized('Missing bearer token'))
    }
    const token = header.slice(7)
    try {
      const payload = verifyAccessToken(token)
      if (roles.length && !roles.includes(payload.role)) {
        return next(AppError.forbidden(`Requires role: ${roles.join(' | ')}`))
      }
      req.auth = { userId: payload.sub, role: payload.role }
      next()
    } catch {
      next(AppError.unauthorized('Invalid or expired token'))
    }
  }
}
