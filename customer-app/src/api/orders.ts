import { api } from './client'
import type { Chat, ChatMessage } from './types'

export async function getChat(orderId: string): Promise<Chat> {
  const res = await api.get<{ chat: Chat }>(`/orders/${orderId}/chat`)
  return res.data.chat
}

export async function sendMessage(orderId: string, payload: { text?: string; imageUrl?: string }): Promise<ChatMessage> {
  const res = await api.post<{ message: ChatMessage }>(`/orders/${orderId}/chat`, payload)
  return res.data.message
}

export async function fileDispute(
  orderId: string,
  body: { reason: string; description?: string; attachments?: string[] },
) {
  const res = await api.post(`/orders/${orderId}/dispute`, body)
  return res.data
}
