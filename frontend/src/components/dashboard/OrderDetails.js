import React from "react";
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
} from "react-icons/fa";
import "./OrderDetails.css";

const OrderDetails = ({ order, onBack }) => {
  const getStatusSteps = () => {
    const statusOrder = ["pending", "processing", "completed"];
    const currentIndex = statusOrder.indexOf(order.status);
    
    return statusOrder.map((status, index) => {
      const isActive = index <= currentIndex;
      const isCurrent = index === currentIndex;
      
      let label, icon;
      switch (status) {
        case "pending":
          label = "Order Placed";
          icon = <FaClock />;
          break;
        case "processing":
          label = "Preparing";
          icon = <FaSpinner />;
          break;
        case "completed":
          label = "Completed";
          icon = <FaCheckCircle />;
          break;
        default:
          label = status;
          icon = <FaClock />;
      }
      
      return { status, label, icon, isActive, isCurrent };
    });
  };

  const formatDate = (dateString) => {
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

  return (
    <div className="order-details">
      <button className="back-button" onClick={onBack}>
        <FaArrowLeft />
        Back to Orders
      </button>

      <div className="section-header">
        <h2>Order Details</h2>
        <p>Order ID: #{order._id.slice(-8).toUpperCase()}</p>
      </div>

      {/* Order Timeline */}
      <div className="order-timeline">
        <h3>Order Status</h3>
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
                  <p className="item-price">${item.price?.toFixed(2)} each</p>
                </div>
                <div className="item-total">
                  ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
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
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>Tax (10%)</span>
              <span>${tax}</span>
            </div>
            <div className="price-row">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="price-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <div className="order-meta">
            <p>
              <strong>Order Date:</strong> {formatDate(order.createdAt)}
            </p>
            <p>
              <strong>Payment Method:</strong>{" "}
              {order.paymentMethod || "Cash on Delivery"}
            </p>
          </div>
        </div>
      </div>

      <div className="order-actions-footer">
        <button className="btn-download-invoice">
          <FaDownload />
          Download Invoice
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;

