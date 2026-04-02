import Notification from '../models/Notification.js';
import Message from '../models/Message.js';

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const notifs = await Notification
      .find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const notifications = await Notification.countDocuments({
      user: req.user._id, read: false,
    });
    const messages = await Message.countDocuments({
      receiver: req.user._id, read: false,
    });
    res.json({ notifications, messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/notifications/read — mark all as read
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};