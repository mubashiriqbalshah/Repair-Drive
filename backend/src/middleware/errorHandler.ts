import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors'
import { logger } from '../config/logger'

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(AppError.notFound('Route not found'))
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    })
  }
  logger.error('http', 'unhandled error', err)
  return res.status(500).json({
    error: { code: 'INTERNAL', message: 'Internal server error' },
  })
}
