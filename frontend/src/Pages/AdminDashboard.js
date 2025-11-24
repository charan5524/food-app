import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaChartLine,
  FaUsers,
  FaShoppingBag,
  FaUtensils,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartBar,
  FaTags,
  FaComments,
  FaBell,
  FaFolder,
  FaMotorcycle,
} from "react-icons/fa";
import "./AdminDashboard.css";
import DashboardOverview from "../components/admin/DashboardOverview";
import MenuManagement from "../components/admin/MenuManagement";
import OrderManagement from "../components/admin/OrderManagement";
import UserManagement from "../components/admin/UserManagement";
import Analytics from "../components/admin/Analytics";
import CategoryManagement from "../components/admin/CategoryManagement";
import PromoCodeManagement from "../components/admin/PromoCodeManagement";
import FeedbackManagement from "../components/admin/FeedbackManagement";
import NotificationsCenter from "../components/admin/NotificationsCenter";
import DeliveryPartnerManagement from "../components/admin/DeliveryPartnerManagement";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/admin/login");
    }
  }, [user, navigate]);

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { adminService } = await import("../services/api");
        const response = await adminService.getAllNotifications(true);
        if (response.success) {
          setUnreadNotifications(response.unreadCount || 0);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    if (user && user.role === "admin") {
      fetchUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Listen for section change events (from dashboard overview)
  useEffect(() => {
    const handleSectionChange = (e) => {
      setActiveSection(e.detail);
    };
    window.addEventListener("adminSectionChange", handleSectionChange);
    return () => window.removeEventListener("adminSectionChange", handleSectionChange);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/admin/login");
    }
  };

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: FaChartLine },
    { id: "analytics", label: "Analytics", icon: FaChartBar },
    { id: "menu", label: "Menu Items", icon: FaUtensils },
    { id: "categories", label: "Categories", icon: FaFolder },
    { id: "orders", label: "Orders", icon: FaShoppingBag },
    { id: "delivery-partners", label: "Delivery Partners", icon: FaMotorcycle },
    { id: "promo-codes", label: "Promo Codes", icon: FaTags },
    { id: "users", label: "Users", icon: FaUsers },
    { id: "feedback", label: "Feedback", icon: FaComments },
    { 
      id: "notifications", 
      label: "Notifications", 
      icon: FaBell,
      badge: unreadNotifications > 0 ? unreadNotifications : null,
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <DashboardOverview />;
      case "analytics":
        return <Analytics />;
      case "menu":
        return <MenuManagement />;
      case "categories":
        return <CategoryManagement />;
      case "orders":
        return <OrderManagement />;
      case "delivery-partners":
        return <DeliveryPartnerManagement />;
      case "promo-codes":
        return <PromoCodeManagement />;
      case "users":
        return <UserManagement />;
      case "feedback":
        return <FeedbackManagement />;
      case "notifications":
        return <NotificationsCenter />;
      default:
        return <DashboardOverview />;
    }
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="admin-dashboard-container">
      {/* Mobile Header */}
      <div className="admin-mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        <h2>Admin Dashboard</h2>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p>{user.email}</p>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeSection === item.id ? "active" : ""}`}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                  // Reset notification count when viewing notifications
                  if (item.id === "notifications") {
                    setUnreadNotifications(0);
                  }
                  // Refresh dashboard stats when viewing overview
                  if (item.id === "overview") {
                    window.location.reload();
                  }
                }}
              >
                <Icon className="nav-icon" />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">{renderContent()}</div>
      </main>
    </div>
  );
};

export default AdminDashboard;

