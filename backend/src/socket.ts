import type { Server as HttpServer } from 'http'
import { Server, type Socket } from 'socket.io'
import { verifyAccessToken, type TokenRole } from './services/jwt'
import { logger } from './config/logger'
import { Technician, type OrderDoc } from './models'
import { corsOrigins } from './config/env'

let io: Server | null = null

interface SocketData {
  userId: string
  role: TokenRole
}

export function attachSocket(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: corsOrigins, credentials: true },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined
    if (!token) return next(new Error('Auth token required'))
    try {
      const payload = verifyAccessToken(token)
      socket.data = { userId: payload.sub, role: payload.role } as SocketData
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const data = socket.data as SocketData
    logger.debug('socket', `connected ${data.role}:${data.userId}`)

    socket.join(userRoom(data.userId, data.role))

    socket.on('order:join_room', (orderId: string) => {
      if (typeof orderId === 'string') socket.join(orderRoom(orderId))
    })

    socket.on('order:leave_room', (orderId: string) => {
      if (typeof orderId === 'string') socket.leave(orderRoom(orderId))
    })

    socket.on('technician:location_update', async (payload: { lat: number; lng: number }) => {
      if (data.role !== 'technician') return
      if (typeof payload?.lat !== 'number' || typeof payload?.lng !== 'number') return
      await Technician.updateOne(
        { _id: data.userId },
        {
          currentLocation: {
            type: 'Point',
            coordinates: [payload.lng, payload.lat],
            updatedAt: new Date(),
          },
        },
      )
    })

    socket.on('disconnect', () => {
      logger.debug('socket', `disconnected ${data.role}:${data.userId}`)
    })
  })

  return io
}

const userRoom = (userId: string, role: TokenRole) => `${role}:${userId}`
const orderRoom = (orderId: string) => `order:${orderId}`

export function emitToUser(userId: string, role: TokenRole, event: string, payload: unknown) {
  io?.to(userRoom(userId, role)).emit(event, payload)
}

export function emitToOrder(orderId: string, event: string, payload: unknown) {
  io?.to(orderRoom(orderId)).emit(event, payload)
}

export async function broadcastNewOrder(order: OrderDoc, radiusKm: number) {
  const location = order.location
  if (!location?.coordinates) return
  const [lng, lat] = location.coordinates
  const nearby = await Technician.find(
    {
      isOnline: true,
      status: 'approved',
      categories: order.category,
      currentLocation: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000,
        },
      },
    },
    { _id: 1 },
  )
    .limit(50)
    .lean()

  for (const tech of nearby) {
    emitToUser(tech._id.toString(), 'technician', 'order:available', {
      orderId: order._id,
      category: order.category,
      customerBudget: order.customerBudget,
      location: { lat, lng, fullAddress: location.fullAddress },
    })
  }
}
