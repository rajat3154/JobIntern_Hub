import { Notification } from "../models/Notification.js";
import { Student } from "../models/student.model.js";
import { Recruiter } from "../models/recruiter.model.js";



/**
 * Create a new notification
 * @param {String} recipientId - ID of the notification recipient
 * @param {String} senderId - ID of the notification sender
 * @param {String} type - Type of notification (e.g., job, follow)
 * @param {String} title - Title of the notification
 * @param {String} message - Message content of the notification
 * @returns {Promise<Object>} Created notification object
 */
export const createNotification = async (recipientId, senderId, type, title, message) => {
  try {
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      title,
      message,
    });
    console.log('Notification created:', notification);
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get notifications for the authenticated user
 * @param {Object} req - Express request object (expects req.user)
 * @param {Object} res - Express response object
 */
export const getUserNotifications = async (req, res) => {
  try {
    console.log('Request received to fetch notifications');
    const userId = req.user._id;
    console.log('Authenticated user ID:', userId);

    // Get all notifications first
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 });

    console.log('Base notifications:', notifications);

    // Manually populate sender for each notification based on senderModel
    const populatedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        const notificationObj = notification.toObject();
        try {
          const ModelToUse = notificationObj.senderModel === 'Student' ? Student : Recruiter;
          console.log('Using model:', notificationObj.senderModel, 'for notification:', notification._id);
          
          const sender = await ModelToUse.findById(notificationObj.sender)
            .select('fullname companyname profile.profilePhoto role');
          console.log('Found sender:', sender, 'for notification:', notification._id);
          
          return {
            ...notificationObj,
            sender
          };
        } catch (err) {
          console.error('Error populating sender for notification:', notification._id, err);
          return notificationObj;
        }
      })
    );

    console.log('Populated notifications:', populatedNotifications);
    
    res.status(200).json({
      status: 200,
      data: populatedNotifications,
      message: "Notifications retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

/**
 * Mark a notification as read by ID
 * @param {Object} req - Express request object (expects req.params.notificationId)
 * @param {Object} res - Express response object
 */
export const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

/**
 * Clear all notifications for the authenticated user
 * @param {Object} req - Express request object (expects req.user)
 * @param {Object} res - Express response object
 */
export const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ recipient: userId });
    res.status(200).json({ message: 'All notifications cleared' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ message: 'Failed to clear notifications' });
  }
};
