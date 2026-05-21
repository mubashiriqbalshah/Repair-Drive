import { api } from './client'

export interface SendOtpResponse {
  success: boolean
  phone: string
  expiresIn: number
  devCode?: string
}

export async function sendOtp(phone: string): Promise<SendOtpResponse> {
  const res = await api.post<SendOtpResponse>('/auth/send-otp', { phone })
  return res.data
}

export interface VerifyOtpResponse {
  success: boolean
  isNewUser: boolean
  user: { id: string; role: 'customer'; phone: string }
  accessToken: string
  refreshToken: string
}

export async function verifyOtp(phone: string, code: string): Promise<VerifyOtpResponse> {
  const res = await api.post<VerifyOtpResponse>('/auth/verify-otp', {
    phone,
    code,
    role: 'customer',
  })
  return res.data
}
