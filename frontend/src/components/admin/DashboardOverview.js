import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminService } from "../../services/api";
import {
  FaUsers,
  FaShoppingBag,
  FaDollarSign,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaComments,
  FaTicketAlt,
  FaArrowRight,
} from "react-icons/fa";
import "./DashboardOverview.css";

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading statistics...</div>;
  }

  if (!stats) {
    return <div className="error">Failed to load statistics</div>;
  }

  const statCards = [
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: FaUsers,
      color: "#667eea",
      bgColor: "rgba(102, 126, 234, 0.1)",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: FaShoppingBag,
      color: "#48bb78",
      bgColor: "rgba(72, 187, 120, 0.1)",
    },
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: FaClock,
      color: "#ed8936",
      bgColor: "rgba(237, 137, 54, 0.1)",
    },
    {
      title: "Total Revenue",
      value: `$${parseFloat(stats.totalRevenue).toFixed(2)}`,
      icon: FaDollarSign,
      color: "#38b2ac",
      bgColor: "rgba(56, 178, 172, 0.1)",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: FaExclamationCircle,
      color: "#f56565",
      bgColor: "rgba(245, 101, 101, 0.1)",
    },
    {
      title: "Delivered Orders",
      value: stats.deliveredOrders,
      icon: FaCheckCircle,
      color: "#48bb78",
      bgColor: "rgba(72, 187, 120, 0.1)",
    },
    {
      title: "New Tickets",
      value: stats.newFeedback || 0,
      icon: FaTicketAlt,
      color: "#ed8936",
      bgColor: "rgba(237, 137, 54, 0.1)",
    },
    {
      title: "Total Feedback",
      value: stats.totalFeedback || 0,
      icon: FaComments,
      color: "#4299e1",
      bgColor: "rgba(66, 153, 225, 0.1)",
    },
  ];

  return (
    <div className="dashboard-overview">
      <div className="overview-header">
        <h2>Dashboard Overview</h2>
        <p>Welcome to the admin dashboard</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isClickable = stat.title === "New Tickets" || stat.title === "Total Feedback";
          return (
            <div 
              key={index} 
              className={`stat-card ${isClickable ? "clickable" : ""}`}
              onClick={isClickable ? () => {
                // Navigate to feedback section in admin dashboard
                window.dispatchEvent(new CustomEvent("adminSectionChange", { detail: "feedback" }));
              } : undefined}
            >
              <div
                className="stat-icon"
                style={{ backgroundColor: stat.bgColor, color: stat.color }}
              >
                <Icon />
              </div>
              <div className="stat-content">
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
                {stat.title === "New Tickets" && stat.value > 0 && (
                  <span className="urgent-badge">Action Required</span>
                )}
                {isClickable && (
                  <span className="view-link">
                    View All <FaArrowRight />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardOverview;

