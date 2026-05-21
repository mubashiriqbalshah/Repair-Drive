import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'auth:state'

export interface AuthUser {
  id: string
  role: 'customer'
  phone: string
}

interface AuthState {
  ready: boolean
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  hydrate: () => Promise<void>
  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => Promise<void>
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  ready: false,
  user: null,
  accessToken: null,
  refreshToken: null,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as {
          user: AuthUser
          accessToken: string
          refreshToken: string
        }
        set({
          user: parsed.user,
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken,
        })
      }
    } finally {
      set({ ready: true })
    }
  },

  setSession: async (user, accessToken, refreshToken) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user, accessToken, refreshToken }))
    set({ user, accessToken, refreshToken })
  },

  setTokens: async (accessToken, refreshToken) => {
    const user = get().user
    if (!user) return
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user, accessToken, refreshToken }))
    set({ accessToken, refreshToken })
  },

  logout: async () => {
    await AsyncStorage.removeItem(STORAGE_KEY)
    set({ user: null, accessToken: null, refreshToken: null })
  },
}))
