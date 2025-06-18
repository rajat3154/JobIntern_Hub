import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Input } from "../ui/input";
import { BiSearchAlt2 } from "react-icons/bi";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Sidebar = ({ selectedUser, onSelectUser, unreadCounts, setUnreadCounts, socket }) => {
  const { user: authUser, onlineUsers } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [latestMessages, setLatestMessages] = useState({});

  const isUserOnline = (userId) => {
    return Array.isArray(onlineUsers) && onlineUsers.includes(userId);
  };
  const apiUrl = import.meta.env.VITE_BACKEND_URL;

  // Load unread counts from localStorage on component mount
  useEffect(() => {
    const savedUnreadCounts = localStorage.getItem('unreadCounts');
    if (savedUnreadCounts) {
      try {
        const parsedCounts = JSON.parse(savedUnreadCounts);
        setUnreadCounts(parsedCounts);
      } catch (err) {
        console.error('Error parsing unread counts:', err);
        localStorage.removeItem('unreadCounts');
      }
    }
  }, []);

  // Save unread counts to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(unreadCounts).length > 0) {
      localStorage.setItem('unreadCounts', JSON.stringify(unreadCounts));
    }
  }, [unreadCounts]);

  // Listen for new messages and update unread counts
  useEffect(() => {
    if (socket.current) {
      const handleNewMessage = (message) => {
        // Only increment if the message is from someone else and not from the currently selected user
        if (message.senderId !== authUser._id && message.senderId !== selectedUser?._id) {
          setUnreadCounts(prev => {
            const newCounts = {
              ...prev,
              [message.senderId]: (prev[message.senderId] || 0) + 1
            };
            localStorage.setItem('unreadCounts', JSON.stringify(newCounts));
            return newCounts;
          });
        }
      };

      socket.current.on('message:new', handleNewMessage);
      return () => {
        socket.current.off('message:new', handleNewMessage);
      };
    }
  }, [socket.current, authUser._id, selectedUser?._id]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const [studentsResponse, recruitersResponse] = await Promise.all([
          axios.get(`${apiUrl}/api/v1/student/students`, { withCredentials: true }),
          axios.get(`${apiUrl}/api/v1/recruiter/recruiters`, { withCredentials: true })
        ]);

        // Process students data
        const students = (studentsResponse.data.students || []).map(student => ({
          _id: student._id,
          fullName: student.fullname,
          email: student.email,
          role: "student",
          profilePhoto: student.profile?.profilePhoto
        }));

        // Process recruiters data
        const recruiters = (recruitersResponse.data.recruiters || []).map(recruiter => ({
          _id: recruiter._id,
          fullName: recruiter.companyname,
          email: recruiter.email,
          role: "recruiter",
          profilePhoto: recruiter.profile?.profilePhoto
        }));
        
        // Combine and filter out the current user
        const allUsers = [...students, ...recruiters].filter(
          (user) => user._id !== authUser._id
        );

        setUsers(allUsers);
        setError(null);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    if (authUser?._id) {
      fetchUsers();
    }
  }, [authUser?._id]);

  useEffect(() => {
    const fetchLatestMessages = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/v1/message/latest-per-user`, { withCredentials: true });
        if (res.data.success) {
          setLatestMessages(res.data.latestMessages || {});
        }
      } catch (err) {
        console.error("Error fetching latest messages:", err);
        // Initialize with empty object if fetch fails
        setLatestMessages({});
      }
    };

    if (authUser?._id) {
      fetchLatestMessages();
    }
  }, [authUser?._id]);

  const filteredUsers = users.filter((user) =>
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLatestMessage = (userId) => {
    return latestMessages[userId] || null;
  };

  // Sort users by unread count first, then by latest message time
  const sortUsers = (users) => {
    return users.sort((a, b) => {
      // First sort by unread count
      const unreadA = unreadCounts[a._id] || 0;
      const unreadB = unreadCounts[b._id] || 0;
      if (unreadA > 0 && unreadB === 0) return -1;
      if (unreadA === 0 && unreadB > 0) return 1;
      
      // Then sort by latest message time
      const latestA = getLatestMessage(a._id);
      const latestB = getLatestMessage(b._id);
      const timeA = latestA ? new Date(latestA.createdAt) : new Date(0);
      const timeB = latestB ? new Date(latestB.createdAt) : new Date(0);
      return timeB - timeA;
    });
  };

  const students = sortUsers(filteredUsers.filter((user) => user.role === "student"));
  const recruiters = sortUsers(filteredUsers.filter((user) => user.role === "recruiter"));

  const handleUserSelect = (user) => {
    onSelectUser(user);
    // Reset unread count for selected user
    setUnreadCounts(prev => {
      const newCounts = {
        ...prev,
        [user._id]: 0
      };
      localStorage.setItem('unreadCounts', JSON.stringify(newCounts));
      return newCounts;
    });
    // Emit socket event to mark messages as read
    socket.current?.emit("mark_messages_read", {
      senderId: user._id,
      receiverId: authUser._id,
    });
  };

  const logoutHandler = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/v1/logout`, {
        withCredentials: true,
      });
      navigate("/login");
      toast.success(res.data.message);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  return (
    <div className="w-full sm:w-1/3  border-t border-l border-b border-gray-800 bg-black bg-opacity-90 overflow-hidden flex flex-col ">
      {/* User Profile */}
      <div className="p-4 border-b border-r border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blue-400">Chats</h2>
        </div>

        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <BiSearchAlt2 className="text-gray-400 w-5 h-5" />
          </span>
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-700 text-white"
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 text-red-400 text-sm text-center border-b border-gray-800">
          {error}
        </div>
      )}

      {/* Users list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="space-y-1 p-2">
            {/* Students Section */}
            {students.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-blue-300 mb-2 px-2">
                  Students
                </h3>
                {students.map((user) => {
                  const latestMessage = getLatestMessage(user._id);
                  const hasUnread = unreadCounts[user._id] > 0;
                  const unreadCount = unreadCounts[user._id] || 0;
                  return (
                    <motion.div
                      key={user._id}
                      whileHover={{
                        backgroundColor: "rgba(30, 41, 59, 0.5)",
                      }}
                      className={`flex items-center p-3 rounded-lg cursor-pointer ${selectedUser?._id === user._id ? "bg-gray-700" : ""}`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user.profilePhoto || "/placeholder-avatar.jpg"}
                            alt={user.fullName}
                          />
                          <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {isUserOnline(user._id) && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full ring-2 ring-black"></span>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="text-md font-semibold text-white">
                            {user.fullName}
                          </h4>
                          {unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                          {latestMessage ? (
                            <span
                              className={hasUnread ? "font-bold" : "text-gray-400"}
                            >
                              {latestMessage.senderId === authUser._id
                                ? "You: "
                                : ""}
                              {latestMessage.message}
                            </span>
                          ) : (
                            user.email
                          )}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Recruiters Section */}
            {recruiters.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-blue-300 mb-2 px-2">
                  Recruiters
                </h3>
                {recruiters.map((user) => {
                  const latestMessage = getLatestMessage(user._id);
                  const hasUnread = unreadCounts[user._id] > 0;
                  const unreadCount = unreadCounts[user._id] || 0;
                  return (
                    <motion.div
                      key={user._id}
                      whileHover={{
                        backgroundColor: "rgba(30, 41, 59, 0.5)",
                      }}
                      className={`flex items-center p-3 rounded-lg cursor-pointer ${selectedUser?._id === user._id ? "bg-gray-700" : ""}`}
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={user.profilePhoto || "/placeholder-avatar.jpg"}
                            alt={user.fullName}
                          />
                          <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {isUserOnline(user._id) && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full ring-2 ring-black"></span>
                        )}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="text-md font-semibold text-white">
                            {user.fullName}
                          </h4>
                          {unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]">
                          {latestMessage ? (
                            <span
                              className={hasUnread ? "font-bold" : "text-gray-400"}
                            >
                              {latestMessage.senderId === authUser._id
                                ? "You: "
                                : ""}
                              {latestMessage.message}
                            </span>
                          ) : (
                            user.email
                          )}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-4">No users found</div>
        )}
      </div>

      {/* Current User Profile & Logout */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={authUser?.profile?.profilePhoto} />
              <AvatarFallback>
                {authUser?.fullName?.charAt(0) || authUser?.fullname?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-white">
                {authUser?.fullName || authUser?.fullname}
              </h3>
              <p className="text-xs text-gray-400">
                {authUser?.role === "student" ? "Student" : "Recruiter"}
              </p>
            </div>
          </div>
          <button
            onClick={logoutHandler}
            className="text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
