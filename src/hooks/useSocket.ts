import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, getSocket } from '../lib/socket';

/**
 * Use a shared Socket.IO connection for the session.
 * Does NOT disconnect on unmount — keeps the socket alive across route changes.
 * Only joins/leaves event rooms as eventId changes.
 */
export function useSocket(eventId?: string): Socket | null {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    let socket = getSocket();
    if (!socket) {
      socket = connectSocket(token);
    }
    socketRef.current = socket;

    if (eventId) {
      const joinWhenReady = () => socket!.emit('join:event', { eventId });
      if (socket.connected) {
        joinWhenReady();
      } else {
        socket.once('connect', joinWhenReady);
      }
    }

    // Do NOT disconnect on unmount — socket stays alive for whole session
    return () => {
      if (eventId && socket) {
        socket.off('connect');
      }
    };
  }, [eventId]);

  return socketRef.current;
}
