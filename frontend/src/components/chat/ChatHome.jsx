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
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    if (!authUser?._id) return;
    socket.current = io(`${apiUrl}`, {
      withCredentials: true,
      auth: { token: localStorage.getItem("token") }
    });
    socket.current.emit("setup", authUser._id);
    socket.current.on("online_users", (onlineUserIds) => {
      onlineUserIds.forEach(userId => {
        dispatch(setOnlineUsers({ userId, isOnline: true }));
      });
    });
    socket.current.on("user:status", ({ userId, isOnline }) => {
      dispatch(setOnlineUsers({ userId, isOnline }));
    });
    return () => { if (socket.current) { socket.current.disconnect(); } };
  }, [authUser?._id, dispatch]);

  // Responsive: update sidebar visibility and mobile state on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSidebar(false);
        setIsMobile(true);
      } else {
        setShowSidebar(true);
        setIsMobile(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectUser = (user) => {
    dispatch(setSelectedUser(user));
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  const handleSidebarToggle = () => {
    setShowSidebar((prev) => !prev);
  };

  // On mobile: only show sidebar or chat, each full screen
  // On desktop: show both side by side
  return (
    <>
      <Navbar/>
      <div className="flex items-center justify-center bg-black mx-auto h-screen">
        <div className="flex w-full max-w-7xl h-full bg-black mx-auto sm:h-[90vh] sm:rounded-xl sm:overflow-hidden border border-gray-800 relative">
          {/* Mobile: Sidebar full screen when toggled */}
          {isMobile && showSidebar && (
            <div className="fixed inset-0 z-30 w-full h-full bg-black">
              <Sidebar
                selectedUser={selectedUser}
                onSelectUser={handleSelectUser}
                unreadCounts={unreadCounts}
                setUnreadCounts={setUnreadCounts}
                socket={socket}
                onUserSelected={() => setShowSidebar(false)}
              />
            </div>
          )}
          {/* Mobile: Chat full screen when sidebar is hidden and a user is selected */}
          {isMobile && !showSidebar && selectedUser && (
            <div className="fixed inset-0 z-30 w-full h-full bg-black">
              <MessageContainer
                selectedUser={selectedUser}
                unreadCounts={unreadCounts}
                setUnreadCounts={setUnreadCounts}
                socket={socket}
                onSidebarToggle={handleSidebarToggle}
                isMobile={true}
              />
            </div>
          )}
          {/* Desktop: Sidebar and chat side by side */}
          {!isMobile && (
            <>
              <div className="h-full w-1/3">
                <Sidebar
                  selectedUser={selectedUser}
                  onSelectUser={handleSelectUser}
                  unreadCounts={unreadCounts}
                  setUnreadCounts={setUnreadCounts}
                  socket={socket}
                />
              </div>
              <div className="h-full flex-1">
                <MessageContainer
                  selectedUser={selectedUser}
                  unreadCounts={unreadCounts}
                  setUnreadCounts={setUnreadCounts}
                  socket={socket}
                  isMobile={false}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatHome;