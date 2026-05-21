import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../config/env'

export type TokenRole = 'customer' | 'technician' | 'admin'

export interface AccessTokenPayload {
  sub: string
  role: TokenRole
  type: 'access'
}

export interface RefreshTokenPayload {
  sub: string
  role: TokenRole
  type: 'refresh'
  tokenVersion?: number
}

export function signAccessToken(userId: string, role: TokenRole): string {
  const payload: AccessTokenPayload = { sub: userId, role, type: 'access' }
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as SignOptions['expiresIn'],
  })
}

export function signRefreshToken(userId: string, role: TokenRole): string {
  const payload: RefreshTokenPayload = { sub: userId, role, type: 'refresh' }
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES as SignOptions['expiresIn'],
  })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload
  if (payload.type !== 'access') throw new Error('Wrong token type')
  return payload
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload
  if (payload.type !== 'refresh') throw new Error('Wrong token type')
  return payload
}

export function issueTokenPair(userId: string, role: TokenRole) {
  return {
    accessToken: signAccessToken(userId, role),
    refreshToken: signRefreshToken(userId, role),
  }
}
