import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { SendIcon } from "lucide-react";
import axios from "axios";
import { setMessages } from "../../redux/messageSlice";
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ChevronLeft, Paperclip, Send, Smile, Video } from "lucide-react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const MessageContainer = ({ selectedUser, unreadCounts, setUnreadCounts, socket }) => {
  const { user: authUser } = useSelector((state) => state.auth);
  const { onlineUsers = [] } = useSelector((state) => state.auth);
  const { messages } = useSelector((state) => state.message);
  const dispatch = useDispatch();
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState({});
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const chatId = useRef(null);

  const isUserOnline = (userId) => {
    return Array.isArray(onlineUsers) && onlineUsers.includes(userId);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedUser && authUser) {
      // Create a consistent chat ID by sorting user IDs
      const userIds = [authUser._id, selectedUser._id].sort();
      chatId.current = `${userIds[0]}-${userIds[1]}`;
      
      // Join the chat room
      if (socket.current) {
        socket.current.emit("join_chat", chatId.current);
      }
    }
  }, [selectedUser, authUser]);

  useEffect(() => {
    if (socket.current && selectedUser) {
      const handleTypingStart = ({ userId }) => {
        if (userId === selectedUser._id) {
          setIsTyping(true);
        }
      };

      const handleTypingStop = ({ userId }) => {
        if (userId === selectedUser._id) {
          setIsTyping(false);
        }
      };

      socket.current.on("typing:start", handleTypingStart);
      socket.current.on("typing:stop", handleTypingStop);

      return () => {
        socket.current.off("typing:start", handleTypingStart);
        socket.current.off("typing:stop", handleTypingStop);
      };
    }
  }, [selectedUser, socket.current]);

  const handleTyping = () => {
    if (socket.current && selectedUser) {
      socket.current.emit("typing:start", { receiverId: selectedUser._id });

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout
      typingTimeoutRef.current = setTimeout(() => {
        socket.current.emit("typing:stop", { receiverId: selectedUser._id });
      }, 2000);
    }
  };

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (socket.current && selectedUser) {
      const handler = (newMessage) => {
        if (
          (newMessage.senderId === selectedUser._id &&
            newMessage.receiverId === authUser._id) ||
          (newMessage.senderId === authUser._id &&
            newMessage.receiverId === selectedUser._id)
        ) {
          const updatedMessages = [...messages, newMessage];
          setConversations((prev) => ({
            ...prev,
            [selectedUser._id]: updatedMessages,
          }));
          dispatch(setMessages(updatedMessages));
          scrollToBottom();
        }
      };
      socket.current.on("message:new", handler);
      return () => {
        socket.current.off("message:new", handler);
      };
    }
  }, [selectedUser, authUser._id, dispatch, messages]);

  useEffect(() => {
    if (!selectedUser?._id) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/message/${selectedUser._id}`,
          { withCredentials: true }
        );

        if (response.data.success) {
          const fetchedMessages = response.data.messages;
          setConversations((prev) => ({
            ...prev,
            [selectedUser._id]: fetchedMessages,
          }));
          dispatch(setMessages(fetchedMessages));
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
        dispatch(setMessages([]));
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedUser?._id, dispatch]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser?._id) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/message/send/${selectedUser._id}`,
        { message: newMessage.trim() },
        { withCredentials: true }
      );

      if (response.data.success && response.data.newMessage) {
        const currentMessages = conversations[selectedUser._id] || [];
        const updatedMessages = [...currentMessages, response.data.newMessage];

        setConversations((prev) => ({
          ...prev,
          [selectedUser._id]: updatedMessages,
        }));

        dispatch(setMessages(updatedMessages));
        setNewMessage("");
        scrollToBottom();

        // Emit socket event for real-time update
        socket.current?.emit("new_message", response.data.newMessage);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <p className="text-gray-400">Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-black bg-opacity-90 border-t border-r border-b border-gray-800">
      {selectedUser ? (
        <>
          {/* Chat header */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={selectedUser.profilePhoto}
                  alt={selectedUser.fullName}
                />
                <AvatarFallback>
                  {selectedUser.fullName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedUser.fullName}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className={`h-2 w-2 rounded-full ${isUserOnline(selectedUser._id) ? "bg-green-500" : "bg-gray-500"}`}></div>
                  <span className="text-sm text-gray-400">
                    {isUserOnline(selectedUser._id) ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 border-r border-gray-800">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : messages.length > 0 ? (
              <>
                {messages.map((message) => {
                  const isSender = message.senderId === authUser._id;
                  return (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 relative ${
                          isSender
                            ? "bg-blue-600 rounded-tr-none"
                            : "bg-gray-800 rounded-tl-none"
                        }`}
                      >
                        <p className="text-white">{message.message}</p>
                        <div className="flex items-center justify-end mt-1 gap-1">
                          <p className="text-xs text-gray-300 text-right">
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {isSender && (
                            <span
                              className="ml-1 flex items-center"
                              title={message.read ? "Read" : "Delivered"}
                            >
                              {message.read ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="w-4 h-4 text-black"
                                >
                                  <path d="M18.7 3.3c-.4-.4-1-.4-1.4 0L9 11.6 6.7 9.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l3 3c.2.2.4.3.7.3.3 0 .5-.1.7-.3l9-9c.4-.4.4-1 0-1.4z" />
                                  <path d="M18.7 3.3c-.4-.4-1-.4-1.4 0L9 11.6 6.7 9.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l3 3c.2.2.4.3.7.3.3 0 .5-.1.7-.3l9-9c.4-.4.4-1 0-1.4z" transform="translate(0 4)" />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="w-4 h-4 text-white"
                                >
                                  <path d="M18.7 3.3c-.4-.4-1-.4-1.4 0L9 11.6 6.7 9.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l3 3c.2.2.4.3.7.3.3 0 .5-.1.7-.3l9-9c.4-.4.4-1 0-1.4z" />
                                  <path d="M18.7 3.3c-.4-.4-1-.4-1.4 0L9 11.6 6.7 9.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l3 3c.2.2.4.3.7.3.3 0 .5-.1.7-.3l9-9c.4-.4.4-1 0-1.4z" transform="translate(0 4)" />
                                </svg>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {isTyping && (
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span>{selectedUser.fullName} is typing...</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-400">No messages yet. Start the conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <div className="p-4 border-t border-r border-gray-800">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                className="flex-1 bg-gray-900 border-gray-700 text-white"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!newMessage.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-black">
          <p className="text-gray-400">Select a user to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
