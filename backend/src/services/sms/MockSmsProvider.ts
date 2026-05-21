import { logger } from '../../config/logger'
import type { SmsProvider } from './types'

export class MockSmsProvider implements SmsProvider {
  name = 'mock'
  async sendOtp(phone: string, code: string) {
    logger.info('sms:mock', `OTP for ${phone}: ${code}`)
    return { success: true, messageId: `mock-${Date.now()}` }
  }
}
