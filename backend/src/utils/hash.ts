import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export async function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, 8)
}

export async function verifyOtp(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash)
}

export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex')
}

export function randomDigits(length: number): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += crypto.randomInt(0, 10).toString()
  }
  return result
}
