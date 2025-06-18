import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
      try {
            const { message } = req.body;
            const senderId = req.user._id;
            const receiverId = req.params.id;

            console.log("Sending message:", { message, senderId, receiverId });

            if (!message || !senderId || !receiverId) {
                  return res.status(400).json({
                        success: false,
                        error: "Message content and both users are required",
                  });
            }

            // Step 1: Create the message document
            const newMessage = await Message.create({
                  senderId,
                  receiverId,
                  message,
                  read: false,
            });

            // Step 2: Sort participants to ensure consistent order
            const participants = [senderId, receiverId].sort((a, b) =>
                  a.toString().localeCompare(b.toString())
            );

            // Step 3: Find existing conversation or create new one with the message
            const conversation = await Conversation.findOneAndUpdate(
                  { "participants.0": participants[0], "participants.1": participants[1] },
                  {
                        $setOnInsert: { participants },
                        $addToSet: { messages: newMessage._id },
                  },
                  { new: true, upsert: true }
            );

            // Step 4: Emit message event to receiver using room
            io.to(receiverId).emit("message:new", newMessage);

            console.log("Message sent successfully:", newMessage);

            return res.status(201).json({
                  success: true,
                  message: "Message sent successfully",
                  newMessage,
            });
      } catch (error) {
            console.error("Error in sendMessage:", error);
            return res.status(500).json({
                  success: false,
                  error: error.message || "Failed to send message",
            });
      }
};

export const getMessage = async (req, res) => {
      try {
            const senderId = req.user._id;
            const receiverId = req.params.id;

            if (!senderId || !receiverId) {
                  return res.status(400).json({
                        success: false,
                        error: "Missing sender or receiver ID",
                  });
            }

            const messages = await Message.find({
                  $or: [
                        { senderId, receiverId },
                        { senderId: receiverId, receiverId: senderId },
                  ],
            })
                  .sort({ createdAt: 1 })
                  .lean();

            // Mark messages as read
            await Message.updateMany(
                  {
                        senderId: receiverId,
                        receiverId: senderId,
                        read: false,
                  },
                  { $set: { read: true } }
            );

            return res.status(200).json({
                  success: true,
                  messages,
            });
      } catch (error) {
            console.error("getMessage error:", error);
            return res.status(500).json({
                  success: false,
                  error: "Failed to fetch messages",
            });
      }
};
