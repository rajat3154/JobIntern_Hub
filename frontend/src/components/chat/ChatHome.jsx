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
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768); // hidden by default on mobile

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

  // Responsive: update sidebar visibility on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      } else {
        setShowSidebar(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show message container and hide sidebar on mobile when a user is selected
  useEffect(() => {
    if (selectedUser) {
      setShowSidebar(false);
    }
  }, [selectedUser]);

  const handleSelectUser = (user) => {
    dispatch(setSelectedUser(user));
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  const handleBackToSidebar = () => {
    dispatch(setSelectedUser(null));
    setShowSidebar(true);
  };

  const handleSidebarToggle = () => {
    setShowSidebar((prev) => !prev);
  };

  return (
    <>
      <Navbar/>
      <div className="flex items-center justify-center bg-black mx-auto h-screen">
        <div className="flex w-full max-w-7xl h-full bg-black mx-auto sm:h-[90vh] sm:rounded-xl sm:overflow-hidden border border-gray-800">
          {/* Sidebar: show on desktop or if showSidebar is true on mobile */}
          <div className={`h-full ${showSidebar ? 'block' : 'hidden'} md:block md:w-1/3 w-full z-20 bg-black absolute md:static left-0 top-0 transition-all duration-300`}>
            <Sidebar
              selectedUser={selectedUser}
              onSelectUser={handleSelectUser}
              unreadCounts={unreadCounts}
              setUnreadCounts={setUnreadCounts}
              socket={socket}
              onUserSelected={() => setShowSidebar(false)}
            />
          </div>
          {/* MessageContainer: show on desktop or if sidebar is hidden on mobile */}
          <div className={`h-full ${showSidebar && window.innerWidth < 768 ? 'hidden' : 'block'} md:block flex-1 relative`}>
            <MessageContainer
              selectedUser={selectedUser}
              unreadCounts={unreadCounts}
              setUnreadCounts={setUnreadCounts}
              socket={socket}
              onBack={window.innerWidth < 768 && showSidebar === false ? handleBackToSidebar : undefined}
              onSidebarToggle={window.innerWidth < 768 ? handleSidebarToggle : undefined}
              isMobile={window.innerWidth < 768}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatHome;