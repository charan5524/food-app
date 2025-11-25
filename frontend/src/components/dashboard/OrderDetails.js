import React, { useState, useEffect, useRef } from "react";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaSpinner,
  FaTimesCircle,
  FaDownload,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaMotorcycle,
  FaUser,
  FaUtensils,
  FaShippingFast,
} from "react-icons/fa";
import { orderService } from "../../services/api";
import DeliveryTracking from "../delivery/DeliveryTracking";
import "./OrderDetails.css";

const OrderDetails = ({ order: initialOrder, onBack }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [order, setOrder] = useState(initialOrder);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef(null);

  // Real-time polling for order status updates
  useEffect(() => {
    // Only poll if order is not completed or cancelled
    if (
      order.status !== "completed" &&
      order.status !== "cancelled" &&
      !order.isScheduled
    ) {
      setIsPolling(true);
      pollingIntervalRef.current = setInterval(async () => {
        try {
          const response = await orderService.getStatus(order._id);
          if (response.success) {
            setOrder(prev => ({
              ...prev,
              status: response.status,
              deliveryStatus: response.deliveryStatus,
              statusTimestamps: response.statusTimestamps,
              delivery: response.delivery,
            }));

            // Stop polling if order is completed
            if (response.status === "completed") {
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                setIsPolling(false);
              }
            }
          }
        } catch (error) {
          console.error("Error polling order status:", error);
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [order._id, order.status, order.isScheduled]);

  // Fetch full order details on mount
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await orderService.getById(order._id);
        if (response.success) {
          setOrder(response.order);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };
    fetchOrderDetails();
  }, [order._id]);

  const getStatusSteps = () => {
    // Complete status flow
    const statusOrder = [
      "pending",
      "received",
      "preparing",
      "almost_ready",
      "ready",
      "processing",
      "completed",
    ];

    // Find current status index
    const currentIndex = statusOrder.indexOf(order.status);
    const statusTimestamps = order.statusTimestamps || {};

    return statusOrder.map((status, index) => {
      const isActive = index <= currentIndex;
      const isCurrent = index === currentIndex;

      let label, icon, timestamp;
      switch (status) {
        case "pending":
          label = "Order Placed";
          icon = <FaClock />;
          timestamp = order.createdAt;
          break;
        case "received":
          label = "Order Received";
          icon = <FaCheckCircle />;
          timestamp = statusTimestamps.received;
          break;
        case "preparing":
          label = "Preparing";
          icon = <FaUtensils />;
          timestamp = statusTimestamps.preparing;
          break;
        case "almost_ready":
          label = "Almost Ready";
          icon = <FaSpinner className="spinning" />;
          timestamp = statusTimestamps.almostReady;
          break;
        case "ready":
          label = "Ready for Pickup";
          icon = <FaCheckCircle />;
          timestamp = statusTimestamps.ready;
          break;
        case "processing":
          label = "Out for Delivery";
          icon = <FaShippingFast />;
          timestamp = statusTimestamps.enroute;
          break;
        case "completed":
          label = "Delivered";
          icon = <FaCheckCircle />;
          timestamp = statusTimestamps.delivered;
          break;
        default:
          label = status;
          icon = <FaClock />;
          timestamp = null;
      }

      return { status, label, icon, isActive, isCurrent, timestamp };
    });
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const subtotal = order.subtotal || 0;
  const deliveryFee = order.deliveryFee || 0;
  const tax = (subtotal * 0.1).toFixed(2); // 10% tax
  const total = order.total || 0;

  const handleDownloadInvoice = async () => {
    try {
      setIsDownloading(true);
      const blob = await orderService.downloadInvoice(order._id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `invoice-${order._id.slice(-8).toUpperCase()}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      alert("Failed to download invoice. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="order-details">
      <button className="back-button" onClick={onBack}>
        <FaArrowLeft />
        Back to Orders
      </button>

      <div className="section-header">
        <h2>Order Details</h2>
        <p>Order ID: #{order._id.slice(-8).toUpperCase()}</p>
        {order.isScheduled && order.scheduledDate && (
          <div className="scheduled-info-banner">
            <FaClock />
            <span>
              Scheduled for {new Date(order.scheduledDate).toLocaleDateString()}{" "}
              at {order.scheduledTime}
            </span>
          </div>
        )}
      </div>

      {/* Real-time Status Indicator */}
      {isPolling && order.status !== "completed" && (
        <div className="live-status-indicator">
          <FaSpinner className="spinning" />
          <span>Live tracking active</span>
        </div>
      )}

      {/* Delivery Tracking - Show for delivery orders */}
      {order.customerDetails?.address && (
        <div style={{ marginBottom: "24px" }}>
          <DeliveryTracking orderId={order._id} orderStatus={order.status} />
        </div>
      )}

      {/* Delivery Partner Details */}
      {order.deliveryPartnerId && (
        <div className="delivery-partner-card">
          <h3>
            <FaMotorcycle /> Delivery Partner
          </h3>
          <div className="partner-details">
            <div className="partner-avatar">
              <FaUser />
            </div>
            <div className="partner-info">
              <h4>{order.deliveryPartnerId.name}</h4>
              <div className="partner-meta">
                <p>
                  <FaMotorcycle /> {order.deliveryPartnerId.vehicleType} -{" "}
                  {order.deliveryPartnerId.vehicleNumber}
                </p>
                <a
                  href={`tel:${order.deliveryPartnerId.phone}`}
                  className="call-partner-btn"
                >
                  <FaPhone /> Call {order.deliveryPartnerId.name}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Timeline */}
      <div className="order-timeline">
        <h3>Order Status Timeline</h3>
        <div className="timeline">
          {getStatusSteps().map((step, index) => (
            <div key={step.status} className="timeline-item">
              <div
                className={`timeline-icon ${step.isActive ? "active" : ""} ${
                  step.isCurrent ? "current" : ""
                }`}
              >
                {step.icon}
              </div>
              <div className="timeline-content">
                <h4 className={step.isActive ? "active" : ""}>{step.label}</h4>
                {step.isCurrent && (
                  <p className="current-status">Current Status</p>
                )}
              </div>
              {index < getStatusSteps().length - 1 && (
                <div
                  className={`timeline-line ${step.isActive ? "active" : ""}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary - Show for completed orders */}
      {order.status === "completed" && (
        <div className="order-summary-container">
          <div className="order-summary-header">
            <div className="summary-icon-circle">
              <FaCheckCircle />
            </div>
            <h2 className="order-summary-heading">Order Summary</h2>
          </div>
          <div className="order-summary-details-card">
            <div className="summary-row">
              <span className="summary-label">Order ID</span>
              <span className="summary-value">#{order._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Order Date</span>
              <span className="summary-value">{formatDate(order.createdAt)}</span>
            </div>
            {order.deliveryPartnerId && (
              <div className="summary-row">
                <span className="summary-label">Delivered By</span>
                <span className="summary-value">{order.deliveryPartnerId.name}</span>
              </div>
            )}
            <div className="summary-row summary-total">
              <span className="summary-label">Total Amount</span>
              <span className="summary-value summary-amount">₹{order.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="details-grid">
        {/* Order Items */}
        <div className="details-card">
          <h3>Order Items</h3>
          <div className="items-list">
            {order.items?.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-image">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <div className="item-placeholder">🍽️</div>
                  )}
                </div>
                <div className="item-details">
                  <h4>{item.name}</h4>
                  <p>Quantity: {item.quantity}</p>
                  <p className="item-price">₹{item.price?.toFixed(2)} each</p>
                </div>
                <div className="item-total">
                  ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer & Delivery Info */}
        <div className="details-card">
          <h3>Customer Information</h3>
          <div className="info-section">
            <div className="info-item">
              <FaEnvelope />
              <div>
                <span className="info-label">Email</span>
                <span className="info-value">
                  {order.customerDetails?.email || "N/A"}
                </span>
              </div>
            </div>
            <div className="info-item">
              <FaPhone />
              <div>
                <span className="info-label">Phone</span>
                <span className="info-value">
                  {order.customerDetails?.phone || "N/A"}
                </span>
              </div>
            </div>
            <div className="info-item">
              <FaMapMarkerAlt />
              <div>
                <span className="info-label">Delivery Address</span>
                <span className="info-value">
                  {order.customerDetails?.address
                    ? `${order.customerDetails.address}, ${order.customerDetails.city}, ${order.customerDetails.state} ${order.customerDetails.zipCode}`
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="details-card">
          <h3>Price Breakdown</h3>
          <div className="price-breakdown">
            <div className="price-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>Tax (10%)</span>
              <span>₹{tax}</span>
            </div>
            <div className="price-row">
              <span>Delivery Fee</span>
              <span>₹{deliveryFee.toFixed(2)}</span>
            </div>
            <div className="price-row total">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
          <div className="order-meta">
            <p>
              <strong>Order Date:</strong> {formatDate(order.createdAt)}
            </p>
            {order.isScheduled && order.scheduledDate && (
              <p>
                <strong>Scheduled Date & Time:</strong>{" "}
                {new Date(order.scheduledDate).toLocaleDateString()} at{" "}
                {order.scheduledTime}
              </p>
            )}
            <p>
              <strong>Payment Method:</strong>{" "}
              {order.paymentMethod || "Cash on Delivery"}
            </p>
          </div>
        </div>
      </div>

      <div className="order-actions-footer">
        <button
          className="btn-download-invoice"
          onClick={handleDownloadInvoice}
          disabled={isDownloading}
        >
          <FaDownload />
          {isDownloading ? "Preparing Invoice..." : "Download Invoice"}
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
