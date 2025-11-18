import React, { useState, useEffect } from "react";
import { orderService } from "../../services/api";
import {
  FaSearch,
  FaFilter,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSpinner,
  FaDownload,
} from "react-icons/fa";
import "./OrderHistory.css";
import OrderDetails from "./OrderDetails";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll();
      if (response.success) {
        setOrders(response.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FaCheckCircle className="status-icon completed" />;
      case "processing":
        return <FaSpinner className="status-icon processing" />;
      case "pending":
        return <FaClock className="status-icon pending" />;
      case "cancelled":
        return <FaTimesCircle className="status-icon cancelled" />;
      default:
        return <FaClock className="status-icon pending" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      completed: "Delivered",
      processing: "In Progress",
      pending: "Pending",
      cancelled: "Cancelled",
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerDetails?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (selectedOrder) {
    return (
      <OrderDetails
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="order-history">
      <div className="section-header">
        <h2>Order History</h2>
        <p>View and track all your past and current orders</p>
      </div>

      <div className="order-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by order ID or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <FaFilter className="filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">In Progress</option>
            <option value="completed">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No orders found</h3>
          <p>
            {orders.length === 0
              ? "You haven't placed any orders yet."
              : "No orders match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-id">
                  <span className="order-id-label">Order ID:</span>
                  <span className="order-id-value">
                    #{order._id.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className={`status-badge status-${order.status}`}>
                  {getStatusIcon(order.status)}
                  <span>{getStatusLabel(order.status)}</span>
                </div>
              </div>

              <div className="order-info">
                <div className="info-row">
                  <span className="info-label">Date & Time:</span>
                  <span className="info-value">{formatDate(order.createdAt)}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Items:</span>
                  <span className="info-value">
                    {order.items?.length || 0} item(s)
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Total Amount:</span>
                  <span className="info-value amount">
                    ${order.total?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Payment:</span>
                  <span className="info-value">
                    {order.paymentMethod || "Cash on Delivery"}
                  </span>
                </div>
              </div>

              <div className="order-actions">
                <button
                  className="btn-view"
                  onClick={() => setSelectedOrder(order)}
                >
                  <FaEye />
                  View Details
                </button>
                {order.status === "completed" && (
                  <button className="btn-download">
                    <FaDownload />
                    Invoice
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;

