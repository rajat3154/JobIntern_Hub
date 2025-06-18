import express from "express";
import { getMessage, sendMessage } from "../controllers/message.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { Message } from "../models/message.model.js";

const router = express.Router();

// Add this route BEFORE the getMessage route
router.get('/latest-per-user', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).sort({ createdAt: -1 });

    // Map to latest message per user
    const latestMap = {};
    messages.forEach(msg => {
      const otherUserId = msg.senderId.equals(userId) ? msg.receiverId.toString() : msg.senderId.toString();
      if (!latestMap[otherUserId]) {
        latestMap[otherUserId] = {
          ...msg.toObject(),
          createdAt: msg.createdAt
        };
      }
    });

    res.json({ success: true, latestMessages: latestMap });
  } catch (err) {
    console.error("Error in latest-per-user:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get messages between two users
router.get('/:id', isAuthenticated, getMessage);

// Send a message to a specific user
router.post('/send/:id', isAuthenticated, sendMessage);

export default router;
