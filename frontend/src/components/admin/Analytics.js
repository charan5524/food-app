import React, { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import "./Analytics.css";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await adminService.getAnalytics();
      if (response.success) {
        setAnalytics(response.analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="error">Failed to load analytics</div>;
  }

  const maxRevenue = Math.max(...analytics.dailyRevenue.map(d => d.revenue), 1);
  const maxOrders = Math.max(...analytics.weeklyOrders.map(w => w.orders), 1);
  const maxPopular = Math.max(...analytics.popularDishes.map(d => d.totalQuantity), 1);

  return (
    <div className="analytics">
      <div className="section-header">
        <h2>Analytics Dashboard</h2>
      </div>

      <div className="analytics-grid">
        {/* Daily Revenue Chart */}
        <div className="chart-card">
          <h3>Daily Revenue (Last 7 Days)</h3>
          <div className="chart-container">
            {analytics.dailyRevenue.map((day, index) => (
              <div key={index} className="chart-bar-container">
                <div className="chart-bar-wrapper">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${(day.revenue / maxRevenue) * 100}%`,
                      backgroundColor: "#667eea",
                    }}
                    title={`$${day.revenue.toFixed(2)}`}
                  />
                </div>
                <div className="chart-label">{new Date(day._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                <div className="chart-value">${day.revenue.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Orders Chart */}
        <div className="chart-card">
          <h3>Weekly Orders (Last 4 Weeks)</h3>
          <div className="chart-container">
            {analytics.weeklyOrders.map((week, index) => (
              <div key={index} className="chart-bar-container">
                <div className="chart-bar-wrapper">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${(week.orders / maxOrders) * 100}%`,
                      backgroundColor: "#48bb78",
                    }}
                    title={`${week.orders} orders`}
                  />
                </div>
                <div className="chart-label">Week {week._id.split('-W')[1]}</div>
                <div className="chart-value">{week.orders}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Dishes */}
        <div className="chart-card full-width">
          <h3>Most Ordered Dishes</h3>
          <div className="popular-dishes-list">
            {analytics.popularDishes.map((dish, index) => (
              <div key={index} className="dish-item">
                <div className="dish-info">
                  <span className="dish-rank">#{index + 1}</span>
                  <span className="dish-name">{dish._id}</span>
                </div>
                <div className="dish-stats">
                  <span className="dish-quantity">{dish.totalQuantity} orders</span>
                  <span className="dish-revenue">${dish.totalRevenue.toFixed(2)}</span>
                </div>
                <div className="dish-bar">
                  <div
                    className="dish-bar-fill"
                    style={{
                      width: `${(dish.totalQuantity / maxPopular) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Users */}
        <div className="stat-card">
          <h3>Active Users</h3>
          <div className="stat-value">{analytics.activeUsers}</div>
          <p>Users who placed orders in the last 30 days</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

