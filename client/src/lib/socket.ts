import { io, Socket } from "socket.io-client";
import { useUserStore } from "@/stores/userStore";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    // Empty/unset VITE_SOCKET_URL connects to the same origin (combined deployment)
    socket = io(import.meta.env.VITE_SOCKET_URL || "/", {
      autoConnect: false,
      auth: (cb) => cb({ token: useUserStore.getState().accessToken }),
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  socket?.disconnect();
};