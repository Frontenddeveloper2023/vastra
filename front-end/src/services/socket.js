import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000'

let socket = null

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      // console.log('[Socket.io Connected to server]', socket.id)
    })

    socket.on('disconnect', () => {
      // console.log('[Socket.io Disconnected from server]')
    })
  }

  return socket
}

export default getSocket

