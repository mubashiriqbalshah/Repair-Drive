import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { corsOrigins, env } from './config/env'
import { errorHandler, notFoundHandler } from './middleware/errorHandler'
import { router } from './routes'

export function createApp() {
  const app = express()

  app.set('trust proxy', 1)
  app.use(helmet())
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || corsOrigins.includes(origin) || corsOrigins.includes('*')) return cb(null, true)
        cb(new Error(`CORS: origin ${origin} not allowed`))
      },
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true }))
  if (env.NODE_ENV !== 'test') app.use(morgan('dev'))

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'repair-drive-api', env: env.NODE_ENV })
  })

  app.use('/v1', router)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
