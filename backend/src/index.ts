import http from 'http'
import { connectDb } from './config/db'
import { env } from './config/env'
import { logger } from './config/logger'
import { createApp } from './app'
import { attachSocket } from './socket'

async function bootstrap() {
  await connectDb()

  const app = createApp()
  const server = http.createServer(app)

  attachSocket(server)

  server.listen(env.PORT, () => {
    logger.info('server', `repair-drive api listening on :${env.PORT} (${env.NODE_ENV})`)
  })

  const shutdown = (signal: string) => {
    logger.info('server', `received ${signal}, shutting down`)
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(1), 10_000).unref()
  }
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

bootstrap().catch((err) => {
  logger.error('server', 'bootstrap failed', err)
  process.exit(1)
})
