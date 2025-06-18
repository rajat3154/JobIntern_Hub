import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedUser, setOnlineUsers } from "../../redux/authSlice";
import { io } from "socket.io-client";
import Sidebar from "./Sidebar";
import MessageContainer from "./MessageContainer";
import Navbar from "../shared/Navbar";

const ChatHome = () => {
  const { user: authUser } = useSelector((state) => state.auth);
  const { selectedUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [unreadCounts, setUnreadCounts] = useState({});
  const socket = useRef(null);
  const apiUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!authUser?._id) return;

    // Initialize socket connection
    socket.current = io(`${apiUrl}`, {
      withCredentials: true,
      auth: {
        token: localStorage.getItem("token")
      }
    });

    // Setup user connection
    socket.current.emit("setup", authUser._id);

    // Listen for initial online users list
    socket.current.on("online_users", (onlineUserIds) => {
      console.log("Received initial online_users:", onlineUserIds);
      // Set all users as online
      onlineUserIds.forEach(userId => {
        dispatch(setOnlineUsers({ userId, isOnline: true }));
      });
    });

    // Listen for user status updates
    socket.current.on("user:status", ({ userId, isOnline }) => {
      console.log(`Received user:status for userId: ${userId}, isOnline: ${isOnline}`);
      dispatch(setOnlineUsers({ userId, isOnline }));
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [authUser?._id, dispatch]);

  const handleSelectUser = (user) => {
    dispatch(setSelectedUser(user));
  };

  return (
    <>
      <Navbar/>
      <div className="flex items-center justify-center bg-black mx-auto h-screen">
        <div className="flex justify-center w-7xl h-150 bg-black mx-auto">
          <Sidebar
            selectedUser={selectedUser}
            onSelectUser={handleSelectUser}
            unreadCounts={unreadCounts}
            setUnreadCounts={setUnreadCounts}
            socket={socket}
          />
          <MessageContainer
            selectedUser={selectedUser}
            unreadCounts={unreadCounts}
            setUnreadCounts={setUnreadCounts}
            socket={socket}
          />
        </div>
      </div>
    </>
  );
};

export default ChatHome;