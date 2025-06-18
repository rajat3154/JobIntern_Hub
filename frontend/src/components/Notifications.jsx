import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import {
  Bell,
  CheckCircle,
  Zap,
  Briefcase,
  AlertCircle,
  UserPlus,
  UserCheck,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useSocket } from "../context/SocketContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import Navbar from "./shared/Navbar";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();

  // Helper function to get sender name
  const getSenderName = (notification) => {
    if (!notification.sender) return "A user";
    return (
      notification.sender.fullname ||
      notification.sender.companyname ||
      "A user"
    );
  };

  // Handler for new notifications received via socket
  const handleNewNotification = useCallback((notification) => {
    console.log("Received new notification:", notification);
    setNotifications((prev) => {
      if (prev.some((n) => n._id === notification._id)) {
        return prev; // Avoid duplicates
      }
      // Play notification sound
      const audio = new Audio("/notification-sound.mp3");
      audio.play().catch(() => {});
      toast.success("New notification received!");
      return [notification, ...prev];
    });
  }, []);

  // Setup socket listeners for real-time notifications
  useEffect(() => {
    if (!socket) return;

    socket.off("newNotification");
    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [socket, handleNewNotification]);

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        console.log("Fetching notifications...");
        const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
          withCredentials: true,
        });
        console.log("Received notifications:", response.data);
        setNotifications(response.data.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(err.message);
        toast.error("Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/notifications/read/${notificationId}`,
        {},
        { withCredentials: true }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch (err) {
      toast.error("Failed to mark notification as read");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "follow":
        return <UserPlus className="w-5 h-5 text-blue-400" />;
      case "job":
        return <Briefcase className="w-5 h-5 text-green-400" />;
      case "application":
        return <CheckCircle className="w-5 h-5 text-yellow-400" />;
      case "system":
        return <Zap className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl shadow-xl border border-gray-800 p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl shadow-xl border border-gray-800 p-8 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">Error: {error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto bg-black rounded-xl shadow-xl border border-gray-800 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Notifications
            </h2>
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-400" />
              <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
                {notifications.filter((n) => !n.read).length}
              </span>
            </div>
          </div>

          <AnimatePresence>
            {notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-400 py-8"
              >
                <Bell className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <p>No notifications yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Your notifications will appear here
                </p>
              </motion.div>
            ) : (
              notifications.map((notification) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`mb-4 p-4 rounded-lg border ${
                    notification.read
                      ? "bg-black border-gray-800"
                      : "bg-black border-blue-800 shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Avatar className="w-10 h-10 border border-gray-800">
                        <AvatarImage
                          src={notification.sender?.profile?.profilePhoto}
                          alt={getSenderName(notification)}
                        />
                        <AvatarFallback className="bg-gray-900 text-gray-400">
                          {getSenderName(notification)
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-gray-100">
                        {notification.title}
                      </h3>
                      <p className="text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <div className="mt-2 text-sm text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="flex-shrink-0 text-blue-400 hover:bg-blue-900/30"
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
};

export default Notifications;
