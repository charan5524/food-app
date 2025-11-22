import React, { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { FaEye, FaCheckCircle } from "react-icons/fa";
import "./OrderManagement.css";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const response = await adminService.getAllOrders(statusFilter || undefined);
      if (response.success) {
        setOrders(response.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (newStatus === "completed") {
      const confirmComplete = window.confirm(
        "Mark this order as completed and notify the customer?"
      );
      if (!confirmComplete) {
        return;
      }
    }

    try {
      const response = await adminService.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      if (response?.emailNotification) {
        alert(response.emailNotification.message);
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error updating order status");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ed8936",
      confirmed: "#4299e1",
      preparing: "#667eea",
      ready: "#48bb78",
      completed: "#48bb78",
      cancelled: "#f56565",
      processing: "#667eea",
    };
    return colors[status] || "#666";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="order-management">
      <div className="section-header">
        <h2>Order Management</h2>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="empty-state">No orders found</div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <p className="order-date">{formatDate(order.createdAt)}</p>
                </div>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              <div className="order-info">
                <div className="info-item">
                  <strong>Customer:</strong>{" "}
                  {order.userId?.name || order.customerDetails?.name || "N/A"}
                </div>
                <div className="info-item">
                  <strong>Email:</strong>{" "}
                  {order.userId?.email || order.customerDetails?.email || "N/A"}
                </div>
                <div className="info-item">
                  <strong>Items:</strong> {order.items.length} item(s)
                </div>
                <div className="info-item">
                  <strong>Total:</strong> ${order.total.toFixed(2)}
                </div>
              </div>

              <div className="order-actions">
                <button
                  className="btn-view"
                  onClick={() => setSelectedOrder(order)}
                >
                  <FaEye /> View Details
                </button>
                <select
                  value={order.status}
                  onChange={(e) =>
                    handleStatusUpdate(order._id, e.target.value)
                  }
                  className="status-select"
                  style={{ borderColor: getStatusColor(order.status) }}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {order.status !== "completed" && order.status !== "cancelled" && (
                  <button
                    className="btn-complete"
                    onClick={() => handleStatusUpdate(order._id, "completed")}
                  >
                    <FaCheckCircle /> Complete & Notify
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Order Details</h3>
            <div className="order-details">
              <div className="detail-section">
                <h4>Order Information</h4>
                <p>
                  <strong>Order ID:</strong> {selectedOrder._id}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(selectedOrder.createdAt)}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(selectedOrder.status),
                    }}
                  >
                    {selectedOrder.status}
                  </span>
                </p>
              </div>

              <div className="detail-section">
                <h4>Customer Information</h4>
                <p>
                  <strong>Name:</strong>{" "}
                  {selectedOrder.userId?.name ||
                    selectedOrder.customerDetails?.name ||
                    "N/A"}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  {selectedOrder.userId?.email ||
                    selectedOrder.customerDetails?.email ||
                    "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  {selectedOrder.customerDetails?.phone || "N/A"}
                </p>
                <p>
                  <strong>Address:</strong>{" "}
                  {selectedOrder.customerDetails?.address || "N/A"}
                </p>
              </div>

              <div className="detail-section">
                <h4>Order Items</h4>
                <div className="items-list">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="item-row">
                      <span>{item.name}</span>
                      <span>
                        {item.quantity} x ${item.price} = $
                        {(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h4>Price Summary</h4>
                <div className="price-summary">
                  <div className="price-row">
                    <span>Subtotal:</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="price-row">
                    <span>Delivery Fee:</span>
                    <span>${selectedOrder.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="price-row total">
                    <span>Total:</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
              {selectedOrder.status !== "completed" &&
                selectedOrder.status !== "cancelled" && (
                  <button
                    className="btn-complete"
                    onClick={() =>
                      handleStatusUpdate(selectedOrder._id, "completed")
                    }
                  >
                    <FaCheckCircle /> Complete & Notify
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

