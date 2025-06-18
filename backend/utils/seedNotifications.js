import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Notification from '../models/Notification.js';
import Student from '../models/student.model.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdbname';

const sampleNotifications = [
  {
    type: 'follow',
    title: 'New Follower',
    message: 'John Doe started following you.',
  },
  {
    type: 'job',
    title: 'New Job Posted',
    message: 'A new job matching your profile has been posted.',
  },
  {
    type: 'application',
    title: 'Application Update',
    message: 'Your application status has been updated.',
  },
];

async function seedNotifications() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find a test student user to assign notifications to
    const testUser = await Student.findOne();
    if (!testUser) {
      console.error('No student user found in database. Please create one first.');
      process.exit(1);
    }

    // Clear existing notifications for test user
    await Notification.deleteMany({ recipient: testUser._id });

    // Create sample notifications
    for (const notif of sampleNotifications) {
      const notification = new Notification({
        recipient: testUser._id,
        sender: testUser._id, // For simplicity, sender is same as recipient
        type: notif.type,
        title: notif.title,
        message: notif.message,
        read: false,
      });
      await notification.save();
      console.log('Created notification:', notification);
    }

    console.log('Sample notifications seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding notifications:', error);
    process.exit(1);
  }
}

seedNotifications();
