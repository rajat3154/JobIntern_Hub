import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

// Create a context for socket
const SocketContext = createContext(null);

// Custom hook to access socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

// SocketProvider component to wrap your app
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user?._id) return;

    const newSocket = io("http://localhost:8000", {
      autoConnect: true,
      withCredentials: true,
      transports: ["polling", "websocket"],
      path: "/socket.io/",
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttempts: 10,
      agent: false,
      upgrade: true,
      rejectUnauthorized: false,
    });

    newSocket.on("connect_error", (err) => {
      console.log("Socket connection error:", err);
    });

    newSocket.on("connect", () => {
      console.log("Socket Connected");
      newSocket.emit("setup", user);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
