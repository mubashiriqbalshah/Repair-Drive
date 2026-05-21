export interface SmsProvider {
  name: string
  sendOtp(phone: string, code: string): Promise<{ success: boolean; messageId?: string; error?: string }>
}
