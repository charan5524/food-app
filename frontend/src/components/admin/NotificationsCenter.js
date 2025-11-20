import React, { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { FaBell, FaTrash, FaCheck, FaCheckDouble } from "react-icons/fa";
import "./NotificationsCenter.css";

const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [showUnreadOnly]);

  const fetchNotifications = async () => {
    try {
      const response = await adminService.getAllNotifications(showUnreadOnly);
      if (response.success) {
        setNotifications(response.notifications);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await adminService.markNotificationAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await adminService.markAllNotificationsAsRead();
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminService.deleteNotification(id);
      fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      new_order: "🛒",
      low_stock: "⚠️",
      new_user: "👤",
      feedback: "💬",
      system: "⚙️",
    };
    return icons[type] || "🔔";
  };

  const getNotificationColor = (type) => {
    const colors = {
      new_order: "#667eea",
      low_stock: "#ed8936",
      new_user: "#48bb78",
      feedback: "#4299e1",
      system: "#9f7aea",
    };
    return colors[type] || "#666";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  return (
    <div className="notifications-center">
      <div className="section-header">
        <div>
          <h2>Notifications</h2>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
        </div>
        <div className="header-actions">
          <label className="filter-toggle">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
            />
            Show unread only
          </label>
          {unreadCount > 0 && (
            <button
              className="btn-mark-all"
              onClick={handleMarkAllAsRead}
            >
              <FaCheckDouble /> Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <FaBell size={48} />
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-card ${!notification.read ? "unread" : ""}`}
            >
              <div
                className="notification-icon"
                style={{ backgroundColor: getNotificationColor(notification.type) }}
              >
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-header">
                  <h3>{notification.title}</h3>
                  <span className="notification-time">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
                <p className="notification-message">{notification.message}</p>
                {notification.link && (
                  <a
                    href={notification.link}
                    className="notification-link"
                    onClick={() => handleMarkAsRead(notification._id)}
                  >
                    View details →
                  </a>
                )}
              </div>
              <div className="notification-actions">
                {!notification.read && (
                  <button
                    className="btn-mark-read"
                    onClick={() => handleMarkAsRead(notification._id)}
                    title="Mark as read"
                  >
                    <FaCheck />
                  </button>
                )}
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(notification._id)}
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsCenter;

