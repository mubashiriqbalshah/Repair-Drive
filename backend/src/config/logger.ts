type Level = 'info' | 'warn' | 'error' | 'debug'

function log(level: Level, scope: string, msg: string, meta?: unknown) {
  const time = new Date().toISOString()
  const line = `[${time}] [${level}] [${scope}] ${msg}`
  if (meta !== undefined) {
    console.log(line, meta)
  } else {
    console.log(line)
  }
}

export const logger = {
  info: (scope: string, msg: string, meta?: unknown) => log('info', scope, msg, meta),
  warn: (scope: string, msg: string, meta?: unknown) => log('warn', scope, msg, meta),
  error: (scope: string, msg: string, meta?: unknown) => log('error', scope, msg, meta),
  debug: (scope: string, msg: string, meta?: unknown) => {
    if (process.env.NODE_ENV !== 'production') log('debug', scope, msg, meta)
  },
}
