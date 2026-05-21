import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { env } from '@/config/env'
import { useAuthStore } from '@/stores/authStore'

export const api = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 15000,
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

let refreshing: Promise<string | null> | null = null

async function tryRefresh(): Promise<string | null> {
  if (refreshing) return refreshing
  refreshing = (async () => {
    const { refreshToken, setTokens, logout } = useAuthStore.getState()
    if (!refreshToken) {
      await logout()
      return null
    }
    try {
      const res = await axios.post(`${env.API_BASE_URL}/auth/refresh`, { refreshToken })
      await setTokens(res.data.accessToken, res.data.refreshToken)
      return res.data.accessToken as string
    } catch {
      await logout()
      return null
    } finally {
      refreshing = null
    }
  })()
  return refreshing
}

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
    if (err.response?.status === 401 && original && !original._retried) {
      original._retried = true
      const newToken = await tryRefresh()
      if (newToken) {
        original.headers?.set('Authorization', `Bearer ${newToken}`)
        return api(original)
      }
    }
    return Promise.reject(err)
  },
)

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export function extractError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: ApiError } | undefined
    if (data?.error) return data.error
    return { code: 'NETWORK', message: err.message || 'Network error' }
  }
  return { code: 'UNKNOWN', message: 'Unknown error' }
}
