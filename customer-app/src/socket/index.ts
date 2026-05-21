import { io, Socket } from 'socket.io-client'
import { env } from '@/config/env'
import { useAuthStore } from '@/stores/authStore'

let socket: Socket | null = null

export function getSocket(): Socket | null {
  const token = useAuthStore.getState().accessToken
  if (!token) return null

  if (socket && socket.connected) return socket
  if (socket) {
    socket.disconnect()
    socket = null
  }

  socket = io(env.SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
  })
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function joinOrderRoom(orderId: string) {
  getSocket()?.emit('order:join_room', orderId)
}

export function leaveOrderRoom(orderId: string) {
  getSocket()?.emit('order:leave_room', orderId)
}
