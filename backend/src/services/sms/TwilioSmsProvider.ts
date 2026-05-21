import twilio from 'twilio'
import { env } from '../../config/env'
import { logger } from '../../config/logger'
import type { SmsProvider } from './types'

export class TwilioSmsProvider implements SmsProvider {
  name = 'twilio'
  private client: ReturnType<typeof twilio>
  private fromNumber: string

  constructor() {
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM_NUMBER) {
      throw new Error('Twilio environment variables missing')
    }
    this.client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)
    this.fromNumber = env.TWILIO_FROM_NUMBER
  }

  async sendOtp(phone: string, code: string) {
    try {
      const msg = await this.client.messages.create({
        body: `Repair Drive: Your verification code is ${code}. Don't share this with anyone.`,
        from: this.fromNumber,
        to: phone,
      })
      return { success: true, messageId: msg.sid }
    } catch (err) {
      logger.error('sms:twilio', 'send failed', err)
      return { success: false, error: (err as Error).message }
    }
  }
}
