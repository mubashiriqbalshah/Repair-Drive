import type { NativeStackScreenProps } from '@react-navigation/native-stack'

export type AuthStackParamList = {
  Splash: undefined
  Phone: undefined
  Otp: { phone: string; devCode?: string }
  ProfileSetup: undefined
}

export type RootStackParamList = {
  Main: undefined
  CategoryDetail: { categorySlug: string }
  NewOrder: { categorySlug: string; subcategorySlug?: string }
  FindingTechnician: { orderId: string }
  OrderTracking: { orderId: string }
  OrderDetail: { orderId: string }
  Chat: { orderId: string; technicianName?: string }
  Rating: { orderId: string }
  AddAddress: undefined
}

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>
export type RootScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>
