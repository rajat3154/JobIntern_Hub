import { io } from "socket.io-client";
const apiUrl = import.meta.env.VITE_BACKEND_URL;

let socket;

export const initSocket = () => {
  if (!socket) {
    const token = localStorage.getItem("token");
    console.log("Initializing socket with token:", token ? "Token exists" : "No token");
    
    // Clean the API URL to remove any spaces or formatting issues
    const cleanApiUrl = apiUrl?.trim();
    
    if (!cleanApiUrl || cleanApiUrl.includes('undefined')) {
      console.error("Invalid API URL for socket connection:", apiUrl);
      return null;
    }
    
    console.log("Connecting socket to:", cleanApiUrl);
    
    socket = io(cleanApiUrl, {
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