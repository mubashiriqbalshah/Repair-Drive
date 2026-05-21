import Constants from 'expo-constants'

interface AppExtra {
  apiBaseUrl?: string
  socketUrl?: string
}

const extra = (Constants.expoConfig?.extra ?? {}) as AppExtra

export const env = {
  API_BASE_URL: extra.apiBaseUrl ?? 'http://localhost:4000/v1',
  SOCKET_URL: extra.socketUrl ?? 'http://localhost:4000',
}
