import React, { useState } from "react";
import { FaBell, FaCheck, FaTrash, FaShoppingBag, FaTag, FaInfoCircle } from "react-icons/fa";
import "./NotificationsCenter.css";

const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "order",
      title: "Order Confirmed",
      message: "Your order #12345678 has been confirmed",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      type: "offer",
      title: "New Offer Available",
      message: "Get 20% off on your next order with code WELCOME20",
      time: "1 day ago",
      read: false,
    },
    {
      id: 3,
      type: "order",
      title: "Order Delivered",
      message: "Your order #12345678 has been delivered",
      time: "3 days ago",
      read: true,
    },
    {
      id: 4,
      type: "system",
      title: "System Update",
      message: "We've updated our menu with new items",
      time: "1 week ago",
      read: true,
    },
  ]);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
        return <FaShoppingBag />;
      case "offer":
        return <FaTag />;
      case "system":
        return <FaInfoCircle />;
      default:
        return <FaBell />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notifications-center">
      <div className="section-header">
        <div>
          <h2>Notifications</h2>
          <p>Stay updated with your orders and offers</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn-mark-all" onClick={markAllAsRead}>
            <FaCheck />
            Mark All as Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <h3>No notifications</h3>
          <p>You're all caught up!</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.read ? "read" : "unread"}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <span className="notification-time">{notification.time}</span>
              </div>
              <div className="notification-actions">
                {!notification.read && (
                  <button
                    className="btn-mark-read"
                    onClick={() => markAsRead(notification.id)}
                    title="Mark as read"
                  >
                    <FaCheck />
                  </button>
                )}
                <button
                  className="btn-delete"
                  onClick={() => deleteNotification(notification.id)}
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsCenter;

