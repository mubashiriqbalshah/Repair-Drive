import type { LinkingOptions } from '@react-navigation/native'
import type { RootStackParamList } from './types'

const SCHEME = 'repairdrive://'
const WEB_HOST = 'https://repairdrive.pk'

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [SCHEME, WEB_HOST],
  config: {
    screens: {
      Main: {
        screens: {
          Home: 'home',
          Orders: 'orders',
          Profile: 'profile',
        },
      },
      CategoryDetail: 'category/:categorySlug',
      NewOrder: 'book/:categorySlug',
      OrderDetail: 'order/:orderId',
      OrderTracking: 'order/:orderId/track',
      FindingTechnician: 'order/:orderId/finding',
      Chat: 'order/:orderId/chat',
      Rating: 'order/:orderId/rate',
      AddAddress: 'address/new',
      Phone: 'login',
      Otp: 'login/verify',
    },
  },
}

export function buildOrderTrackingUrl(orderId: string): string {
  return `${SCHEME}order/${orderId}/track`
}

export function buildOrderUrl(orderId: string): string {
  return `${SCHEME}order/${orderId}`
}
