const Notification = require("../models/Notification");
const Order = require("../models/Order");
const User = require("../models/User");
const MenuItem = require("../models/Menu");

// Get all notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const { unread } = req.query;
    const query = unread === "true" ? { read: false } : {};
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ read: false });

    res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.read = true;
    await notification.save();

    res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notification",
    });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });

    res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notifications",
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
    });
  }
};

// Helper function to create notifications (called from other controllers)
exports.createNotification = async (type, title, message, link = "") => {
  try {
    const notification = new Notification({
      type,
      title,
      message,
      link,
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

