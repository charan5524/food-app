import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaShoppingBag,
  FaHeart,
  FaMapMarkerAlt,
  FaTag,
  FaHeadset,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaHome,
} from "react-icons/fa";
import "./Dashboard.css";
import ProfileOverview from "../components/dashboard/ProfileOverview";
import OrderHistory from "../components/dashboard/OrderHistory";
import Favorites from "../components/dashboard/Favorites";
import SavedAddresses from "../components/dashboard/SavedAddresses";
import OffersDiscounts from "../components/dashboard/OffersDiscounts";
import SupportHelpDesk from "../components/dashboard/SupportHelpDesk";
import NotificationsCenter from "../components/dashboard/NotificationsCenter";
import Settings from "../components/dashboard/Settings";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [profilePicture, setProfilePicture] = useState(
    localStorage.getItem("profilePicture") || null
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Listen for profile picture updates
  useEffect(() => {
    const handleProfilePictureUpdate = (e) => {
      setProfilePicture(e.detail);
    };
    window.addEventListener("profilePictureUpdated", handleProfilePictureUpdate);
    return () => {
      window.removeEventListener("profilePictureUpdated", handleProfilePictureUpdate);
    };
  }, []);

  useEffect(() => {
    document.body.className = darkMode ? "dark-mode" : "light-mode";
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/");
    }
  };

  const menuItems = [
    { id: "profile", label: "Profile", icon: FaUser },
    { id: "orders", label: "Order History", icon: FaShoppingBag },
    { id: "favorites", label: "Favorites", icon: FaHeart },
    { id: "addresses", label: "Saved Addresses", icon: FaMapMarkerAlt },
    { id: "offers", label: "Offers & Discounts", icon: FaTag },
    { id: "support", label: "Support", icon: FaHeadset },
    { id: "notifications", label: "Notifications", icon: FaBell },
    { id: "settings", label: "Settings", icon: FaCog },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileOverview user={user} />;
      case "orders":
        return <OrderHistory />;
      case "favorites":
        return <Favorites />;
      case "addresses":
        return <SavedAddresses />;
      case "offers":
        return <OffersDiscounts />;
      case "support":
        return <SupportHelpDesk />;
      case "notifications":
        return <NotificationsCenter />;
      case "settings":
        return <Settings darkMode={darkMode} setDarkMode={setDarkMode} />;
      default:
        return <ProfileOverview user={user} />;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`dashboard-container ${darkMode ? "dark" : ""}`}>
      {/* Mobile Header */}
      <div className="dashboard-mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        <h2>Dashboard</h2>
        <button className="home-btn" onClick={() => navigate("/")}>
          <FaHome />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="user-avatar">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="sidebar-avatar-image" />
            ) : (
              <span className="sidebar-avatar-initials">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </span>
            )}
          </div>
          <div className="user-info">
            <h3>{user.name || "User"}</h3>
            <p>{user.email || ""}</p>
          </div>
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
                }}
              >
                <Icon className="nav-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">{renderContent()}</div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;

