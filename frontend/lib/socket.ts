import { io, Socket } from 'socket.io-client';
import { getClerkToken } from './api';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
    });
  }

  return socket;
}

export async function connectSocket(): Promise<void> {
  const s = getSocket();
  if (!s.connected) {
    const token = await getClerkToken();
    s.auth = { token };
    s.connect();
  }
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}
