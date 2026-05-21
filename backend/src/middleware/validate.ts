import type { Request, Response, NextFunction } from 'express'
import { ZodError, type ZodSchema } from 'zod'
import { AppError } from '../utils/errors'

type Source = 'body' | 'query' | 'params'

export function validate(schema: ZodSchema, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source])
      ;(req as Request & Record<Source, unknown>)[source] = parsed
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        return next(AppError.badRequest('Validation failed', err.flatten()))
      }
      next(err)
    }
  }
}
