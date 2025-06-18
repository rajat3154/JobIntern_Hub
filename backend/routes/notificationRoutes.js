import express from 'express';
import { getUserNotifications, markAsRead, clearAllNotifications } from '../controllers/notificationController.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

// Get user notifications
router.get('/', isAuthenticated, getUserNotifications);

// Mark notification as read
router.patch('/:notificationId/read', isAuthenticated, markAsRead);

// Clear all notifications
router.delete('/clear-all', isAuthenticated, clearAllNotifications);

export default router; 