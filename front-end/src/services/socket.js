import { io } from 'socket.io-client'
import { BACKEND_URL } from '../config/apiConfig'

const SOCKET_URL = BACKEND_URL

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

