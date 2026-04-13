import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket } from '../lib/socket';

export function useSocket(eventId?: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = connectSocket(token);
    socketRef.current = socket;

    if (eventId) {
      socket.emit('join:event', { eventId });
    }

    return () => {
      disconnectSocket();
    };
  }, [eventId]);

  return socketRef.current;
}
