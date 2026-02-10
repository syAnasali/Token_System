import { io } from "socket.io-client";

// Connect to backend
const SOCKET_URL = "http://localhost:3000";

export const socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'], // Try websocket first
    autoConnect: true,
});
