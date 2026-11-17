import { Server } from 'socket.io'

let io = null

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:4173',
        process.env.VITE_FRONTEND_URL,
      ].filter(Boolean),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    // console.log(`[Socket Connected] ID: ${socket.id}`)

    // Admin joins admin-room for instant admin notifications
    socket.on('join:admin', () => {
      socket.join('admin-room')
      // console.log(`[Socket] Admin joined admin-room: ${socket.id}`)
    })

    // Customer joins their own room for order updates
    socket.on('join:customer', (customerId) => {
      if (customerId) {
        socket.join(`customer_${customerId}`)
        // console.log(`[Socket] Customer joined customer_${customerId}: ${socket.id}`)
      }
    })

    // Join specific order room for real-time tracking
    socket.on('join:order', (orderId) => {
      if (orderId) {
        socket.join(`order_${orderId}`)
        // console.log(`[Socket] Joined order room order_${orderId}`)
      }
    })

    socket.on('disconnect', () => {
      // console.log(`[Socket Disconnected] ID: ${socket.id}`)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) {
    console.warn('[Socket Warning] getIO called before initSocket.')
  }
  return io
}

// Helper utility to emit events
export const emitEvent = (eventName, data, room = null) => {
  if (!io) return
  if (room) {
    io.to(room).emit(eventName, data)
  } else {
    io.emit(eventName, data)
  }
}

