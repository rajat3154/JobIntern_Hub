import { io } from "socket.io-client";
const apiUrl = import.meta.env.VITE_BACKEND_URL;

let socket;

export const initSocket = () => {
  if (!socket) {
    console.log("Initializing socket with httpOnly cookies");
    
    // Clean the API URL to remove any spaces or formatting issues
    const cleanApiUrl = apiUrl?.trim();
    
    if (!cleanApiUrl || cleanApiUrl.includes('undefined')) {
      console.error("Invalid API URL for socket connection:", apiUrl);
      return null;
    }
    
    console.log("Connecting socket to:", cleanApiUrl);
    
    socket = io(cleanApiUrl, {
      withCredentials: true, // This will send httpOnly cookies automatically
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

// No longer needed since we use httpOnly cookies
export const updateSocketAuth = () => {
  if (socket) {
    console.log("Socket auth updated (httpOnly cookies handled automatically)");
    // No need to manually update auth - cookies are sent automatically
  }
};

export default getSocket; 