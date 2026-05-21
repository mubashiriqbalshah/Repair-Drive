import { api } from './client'
import type { Address, Customer, Order } from './types'

export async function getProfile(): Promise<Customer> {
  const res = await api.get<{ customer: Customer }>('/customer/profile')
  return res.data.customer
}

export async function updateProfile(data: { name?: string; profilePhoto?: string; fcmToken?: string }) {
  const res = await api.patch<{ customer: Customer }>('/customer/profile', data)
  return res.data.customer
}

export async function addAddress(address: Omit<Address, '_id'>) {
  const res = await api.post<{ addresses: Address[] }>('/customer/addresses', address)
  return res.data.addresses
}

export async function removeAddress(id: string) {
  const res = await api.delete<{ addresses: Address[] }>(`/customer/addresses/${id}`)
  return res.data.addresses
}

export interface CreateOrderInput {
  category: string
  subcategory?: string
  problemDescription: string
  photos?: string[]
  location: { lat: number; lng: number; fullAddress: string; landmark?: string }
  customerBudget?: number
  paymentMethod?: 'cash' | 'jazzcash' | 'easypaisa'
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const res = await api.post<{ order: Order }>('/customer/orders', input)
  return res.data.order
}

export async function listOrders(): Promise<Order[]> {
  const res = await api.get<{ orders: Order[] }>('/customer/orders')
  return res.data.orders
}

export async function getOrder(id: string): Promise<Order> {
  const res = await api.get<{ order: Order }>(`/customer/orders/${id}`)
  return res.data.order
}

export async function acceptOffer(orderId: string, offerId: string): Promise<Order> {
  const res = await api.patch<{ order: Order }>(`/customer/orders/${orderId}/accept-offer`, { offerId })
  return res.data.order
}

export async function cancelOrder(orderId: string, reason: string): Promise<Order> {
  const res = await api.patch<{ order: Order }>(`/customer/orders/${orderId}/cancel`, { reason })
  return res.data.order
}

export async function rateOrder(orderId: string, stars: number, review = ''): Promise<Order> {
  const res = await api.post<{ order: Order }>(`/customer/orders/${orderId}/rate`, { stars, review })
  return res.data.order
}
