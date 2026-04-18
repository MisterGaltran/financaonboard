import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
const RECONNECT_DELAY = parseInt(import.meta.env.VITE_WS_RECONNECT_DELAY || '1000', 10);
const RECONNECT_DELAY_MAX = parseInt(import.meta.env.VITE_WS_RECONNECT_DELAY_MAX || '15000', 10);

export const socket = io(BACKEND_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: RECONNECT_DELAY,
  reconnectionDelayMax: RECONNECT_DELAY_MAX,
  randomizationFactor: 0.5,
  timeout: 10_000,
  transports: ['websocket', 'polling']
});
