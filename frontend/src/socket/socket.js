import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:8000";

let socket;

export const initSocket = () => {
  if (!socket) {
    const token = localStorage.getItem("token");
    console.log("Initializing socket with token:", token ? "Token exists" : "No token");
    
    socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on("connect", () => {
      console.log("Socket connected successfully");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const updateSocketAuth = (token) => {
  if (socket) {
    console.log("Updating socket auth token");
    socket.auth = { token };
    socket.disconnect().connect();
  }
};

export default getSocket; 