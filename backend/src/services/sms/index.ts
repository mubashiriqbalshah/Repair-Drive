import { env } from '../../config/env'
import { MockSmsProvider } from './MockSmsProvider'
import { TwilioSmsProvider } from './TwilioSmsProvider'
import type { SmsProvider } from './types'

let provider: SmsProvider | null = null

export function getSmsProvider(): SmsProvider {
  if (provider) return provider
  switch (env.SMS_PROVIDER) {
    case 'twilio':
      provider = new TwilioSmsProvider()
      break
    case 'mock':
    default:
      provider = new MockSmsProvider()
      break
  }
  return provider
}

export type { SmsProvider } from './types'
