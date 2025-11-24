import React, { useState, useEffect, useRef } from "react";
import { adminService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { FaEye, FaCheckCircle, FaMotorcycle, FaSpinner } from "react-icons/fa";
import "./OrderManagement.css";

const OrderManagement = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [freePartners, setFreePartners] = useState([]);
  const [assigningPartner, setAssigningPartner] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    fetchOrders();
    fetchFreePartners();
  }, [statusFilter]);

  // Start/stop polling based on active orders
  useEffect(() => {
    // Check if there are any active orders (not completed or cancelled)
    const hasActiveOrders = orders.some(
      (order) => order.status !== "completed" && order.status !== "cancelled"
    );

    if (!hasActiveOrders) {
      setIsPolling(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [orders]);

  // Real-time polling for active orders
  useEffect(() => {
    // Clear any existing interval first
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Check if there are any active orders (not completed or cancelled)
    const hasActiveOrders = orders.some(
      (order) => order.status !== "completed" && order.status !== "cancelled"
    );

    if (!hasActiveOrders) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);
    
    // Poll every 3 seconds for active orders
    const pollOrders = async () => {
      try {
        const response = await adminService.getAllOrders(
          statusFilter || undefined
        );
        if (response.success) {
          // Update orders
          setOrders(response.orders);
          
          // If there's a selected order, update it too
          if (selectedOrder) {
            const updatedSelectedOrder = response.orders.find(
              (o) => o._id === selectedOrder._id
            );
            if (updatedSelectedOrder) {
              setSelectedOrder(updatedSelectedOrder);
            }
          }

          // Check if all orders are now completed/cancelled
          const allInactive = response.orders.every(
            (order) =>
              order.status === "completed" || order.status === "cancelled"
          );
          if (allInactive) {
            setIsPolling(false);
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
          }
        }
      } catch (error) {
        console.error("Error polling orders:", error);
      }
    };

    // Start polling
    pollingIntervalRef.current = setInterval(pollOrders, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [statusFilter]); // Only depend on statusFilter, check orders inside the effect

  const fetchFreePartners = async () => {
    try {
      const response = await adminService.getFreeDeliveryPartners();
      console.log("Free partners response:", response);
      if (response.success) {
        setFreePartners(response.data || []);
      } else {
        console.error("Failed to fetch free partners:", response.message);
        setFreePartners([]);
      }
    } catch (error) {
      console.error("Error fetching free partners:", error);
      setFreePartners([]);
    }
  };

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
        // Update selected order with new data
        const updatedOrderResponse = await adminService.getOrderById(orderId);
        if (updatedOrderResponse.success) {
          setSelectedOrder(updatedOrderResponse.order);
        } else {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }

      // Show notification if driver was automatically assigned
      if (response?.driverAssigned) {
        showToast(
          `Driver ${response.driverAssigned.name} automatically assigned!`,
          "success"
        );
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
      received: "#4299e1",
      confirmed: "#4299e1",
      preparing: "#667eea",
      almost_ready: "#9f7aea",
      ready: "#48bb78",
      processing: "#667eea",
      completed: "#48bb78",
      cancelled: "#f56565",
    };
    return colors[status] || "#666";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleAssignPartner = async (orderId, partnerId) => {
    if (!partnerId) {
      showToast("Please select a delivery partner", "error");
      return;
    }

    try {
      setAssigningPartner(true);
      const response = await adminService.assignDeliveryPartner(orderId, partnerId);
      if (response.success) {
        showToast("Delivery partner assigned successfully", "success");
        await fetchOrders();
        await fetchFreePartners();
        if (selectedOrder && selectedOrder._id === orderId) {
          const updatedOrder = await adminService.getOrderById(orderId);
          if (updatedOrder.success) {
            setSelectedOrder(updatedOrder.order);
          }
        }
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Error assigning delivery partner", "error");
    } finally {
      setAssigningPartner(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="order-management">
      <div className="section-header">
        <h2>Order Management</h2>
        <div className="filter-group">
          {isPolling && (
            <div className="live-status-indicator">
              <FaSpinner className="spinning" />
              <span>Live updates active</span>
            </div>
          )}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="">All Orders</option>
            <option value="pending">Pending</option>
            <option value="received">Received</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="almost_ready">Almost Ready</option>
            <option value="ready">Ready</option>
            <option value="processing">Processing</option>
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
                {order.deliveryPartnerId && (
                  <div className="info-item delivery-partner-info">
                    <strong>
                      <FaMotorcycle /> Delivery Partner:
                    </strong>{" "}
                    {order.deliveryPartnerId.name} ({order.deliveryPartnerId.phone})
                    <div className="partner-details">
                      <span className="vehicle-badge">
                        {order.deliveryPartnerId.vehicleType || "Bike"}
                        {order.deliveryPartnerId.vehicleNumber && ` • ${order.deliveryPartnerId.vehicleNumber}`}
                      </span>
                      <span
                        className="partner-status"
                        style={{
                          color:
                            order.deliveryPartnerId.status === "free"
                              ? "#10b981"
                              : order.deliveryPartnerId.status === "busy"
                              ? "#f59e0b"
                              : "#6b7280",
                        }}
                      >
                        {order.deliveryPartnerId.status}
                      </span>
                    </div>
                  </div>
                )}
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
                  <option value="received">Received</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="almost_ready">Almost Ready</option>
                  <option value="ready">Ready</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {order.status === "ready" && !order.deliveryPartnerId && (
                  <div className="assign-partner-section">
                    <select
                      className="partner-select"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignPartner(order._id, e.target.value);
                        }
                      }}
                      disabled={assigningPartner || freePartners.length === 0}
                      defaultValue=""
                    >
                      <option value="">
                        {freePartners.length === 0
                          ? "No free partners available"
                          : "Assign Delivery Partner"}
                      </option>
                      {freePartners.map((partner) => (
                        <option key={partner._id} value={partner._id}>
                          {partner.name} ({partner.phone}) - {partner.vehicleType || "Bike"}
                          {partner.vehicleNumber && ` [${partner.vehicleNumber}]`}
                        </option>
                      ))}
                    </select>
                    {freePartners.length === 0 && (
                      <p style={{ fontSize: "0.85rem", color: "#f59e0b", marginTop: "0.5rem" }}>
                        Add delivery partners in the Delivery Partners section
                      </p>
                    )}
                  </div>
                )}
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
                {selectedOrder.deliveryPartnerId && (
                  <div>
                    <p>
                      <strong>
                        <FaMotorcycle /> Delivery Partner:
                      </strong>{" "}
                      {selectedOrder.deliveryPartnerId.name} (
                      {selectedOrder.deliveryPartnerId.phone})
                    </p>
                    <p>
                      <strong>Vehicle:</strong>{" "}
                      {selectedOrder.deliveryPartnerId.vehicleType || "Bike"}
                      {selectedOrder.deliveryPartnerId.vehicleNumber && 
                        ` (${selectedOrder.deliveryPartnerId.vehicleNumber})`
                      }
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        style={{
                          color:
                            selectedOrder.deliveryPartnerId.status === "free"
                              ? "#10b981"
                              : selectedOrder.deliveryPartnerId.status === "busy"
                              ? "#f59e0b"
                              : "#6b7280",
                          fontWeight: "600",
                        }}
                      >
                        {selectedOrder.deliveryPartnerId.status.toUpperCase()}
                      </span>
                    </p>
                  </div>
                )}
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

            {selectedOrder.status === "ready" && !selectedOrder.deliveryPartnerId && (
              <div className="detail-section">
                <h4>Assign Delivery Partner</h4>
                <select
                  className="partner-select"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAssignPartner(selectedOrder._id, e.target.value);
                    }
                  }}
                  disabled={assigningPartner || freePartners.length === 0}
                  defaultValue=""
                >
                  <option value="">
                    {freePartners.length === 0
                      ? "No free partners available"
                      : "Select a delivery partner"}
                  </option>
                  {freePartners.map((partner) => (
                    <option key={partner._id} value={partner._id}>
                      {partner.name} ({partner.phone}) - {partner.vehicleType || "Bike"}
                      {partner.vehicleNumber && ` [${partner.vehicleNumber}]`}
                    </option>
                  ))}
                </select>
                {freePartners.length === 0 && (
                  <p style={{ color: "#f59e0b", marginTop: "0.5rem", fontSize: "0.9rem" }}>
                    No free delivery partners available. Add partners in the Delivery Partners section.
                  </p>
                )}
              </div>
            )}

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

