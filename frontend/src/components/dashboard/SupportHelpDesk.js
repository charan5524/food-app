import React, { useState, useEffect } from "react";
import {
  FaTicketAlt,
  FaPlus,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaReply,
  FaEnvelope,
  FaClipboardList,
  FaShippingFast,
  FaCalendarCheck,
  FaInfoCircle,
  FaDollarSign,
  FaBox,
  FaCreditCard,
  FaArrowRight,
  FaShoppingBag,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { feedbackService, orderService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./SupportHelpDesk.css";

const SupportHelpDesk = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [error, setError] = useState(null);
  const [orderSummary, setOrderSummary] = useState({
    loading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    if (user) {
      fetchTickets();
      fetchOrderSummary();
    } else {
      setError("Please log in to view your tickets");
      setLoading(false);
      setOrderSummary((prev) => ({ ...prev, loading: false }));
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching customer tickets...");
      const response = await feedbackService.getMyTickets();
      console.log("📦 Response:", response);
      if (response.success) {
        setTickets(response.feedback || []);
        console.log(`✅ Loaded ${response.feedback?.length || 0} tickets`);
      } else {
        console.error("❌ Failed to fetch tickets:", response.message);
        alert(response.message || "Failed to load tickets. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error fetching tickets:", error);
      alert("Error loading tickets. Please make sure you're logged in and try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderSummary = async () => {
    try {
      setOrderSummary((prev) => ({ ...prev, loading: true, error: null }));
      const response = await orderService.getAll();
      if (response.success) {
        const orders = response.orders || [];
        const totalOrders = orders.length;
        const activeOrders = orders.filter((order) =>
          ["pending", "processing"].includes(order.status)
        );
        const scheduledOrders = orders.filter(
          (order) => order.isScheduled && order.scheduledDate
        );
        const lastOrder = orders
          .slice()
          .sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];

        setOrderSummary({
          loading: false,
          data: {
            totalOrders,
            activeOrders: activeOrders.length,
            scheduledOrders: scheduledOrders.length,
            lastOrder,
            activeOrderList: activeOrders
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
              .slice(0, 3),
          },
          error: null,
        });
      } else {
        setOrderSummary({
          loading: false,
          data: null,
          error: response.message || "Unable to load order summary.",
        });
      }
    } catch (err) {
      console.error("Error fetching order summary:", err);
      setOrderSummary({
        loading: false,
        data: null,
        error: "Unable to load your order summary right now.",
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <FaCheckCircle className="status-icon resolved" />;
      case "replied":
        return <FaReply className="status-icon replied" />;
      case "read":
        return <FaEnvelope className="status-icon read" />;
      case "new":
        return <FaClock className="status-icon pending" />;
      default:
        return <FaTimesCircle className="status-icon cancelled" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      new: "New",
      read: "Read",
      replied: "Replied",
      resolved: "Resolved",
    };
    return labels[status] || status;
  };

  const formatOrderDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) =>
    typeof amount === "number" ? `₹${amount.toFixed(2)}` : "—";

  const renderOrderSummary = () => {
    if (orderSummary.loading) {
      return (
        <div className="order-summary-grid">
          {[1, 2, 3].map((id) => (
            <div key={id} className="order-summary-card skeleton">
              <div className="skeleton-line w-50" />
              <div className="skeleton-line w-30" />
              <div className="skeleton-line w-80" />
            </div>
          ))}
        </div>
      );
    }

    if (orderSummary.error) {
      return (
        <div className="order-summary-error">
          <FaInfoCircle />
          <div>
            <strong>Heads up</strong>
            <p>{orderSummary.error}</p>
          </div>
        </div>
      );
    }

    if (!orderSummary.data || orderSummary.data.totalOrders === 0) {
      return (
        <div className="order-summary-empty">
          <p>No orders yet. Your upcoming orders will appear here for quick reference.</p>
        </div>
      );
    }

    const { totalOrders, activeOrders, scheduledOrders, lastOrder } =
      orderSummary.data;

    return (
      <>
        <div className="order-summary-layout">
          <div className="order-summary-main">
            <div className="order-summary-grid">
              <div className="order-summary-card">
                <div className="card-icon blue">
                  <FaClipboardList />
                </div>
                <div>
                  <p>Total Orders</p>
                  <h3>{totalOrders}</h3>
                  <span>All completed + active orders</span>
                </div>
              </div>
              <div className="order-summary-card">
                <div className="card-icon green">
                  <FaShippingFast />
                </div>
                <div>
                  <p>Active Orders</p>
                  <h3>{activeOrders}</h3>
                  <span>Pending or in-progress</span>
                </div>
              </div>
              <div className="order-summary-card">
                <div className="card-icon purple">
                  <FaCalendarCheck />
                </div>
                <div>
                  <p>Scheduled</p>
                  <h3>{scheduledOrders}</h3>
                  <span>Upcoming deliveries</span>
                </div>
              </div>
            </div>

            {lastOrder && (
              <div className="last-order-card">
                <div className="last-order-header">
                  <div className="last-order-title-section">
                    <div className="order-icon-wrapper">
                      <FaShoppingBag />
                    </div>
                    <div>
                      <p className="last-order-label">Latest Order</p>
                      <h3 className="last-order-id">#{lastOrder._id.slice(-8).toUpperCase()}</h3>
                    </div>
                  </div>
                  <span className={`status-chip status-${lastOrder.status}`}>
                    {getStatusLabel(lastOrder.status)}
                  </span>
                </div>
                
                <div className="last-order-meta">
                  <div className="meta-item">
                    <div className="meta-icon">
                      <FaClock />
                    </div>
                    <div className="meta-content">
                      <p className="meta-label">Placed on</p>
                      <strong className="meta-value">{formatOrderDate(lastOrder.createdAt)}</strong>
                    </div>
                  </div>
                  <div className="meta-item">
                    <div className="meta-icon">
                      <FaDollarSign />
                    </div>
                    <div className="meta-content">
                      <p className="meta-label">Total Amount</p>
                      <strong className="meta-value amount">{formatCurrency(lastOrder.total)}</strong>
                    </div>
                  </div>
                  <div className="meta-item">
                    <div className="meta-icon">
                      <FaBox />
                    </div>
                    <div className="meta-content">
                      <p className="meta-label">Items</p>
                      <strong className="meta-value">{lastOrder.items?.length || 0} item(s)</strong>
                    </div>
                  </div>
                  <div className="meta-item">
                    <div className="meta-icon">
                      <FaCreditCard />
                    </div>
                    <div className="meta-content">
                      <p className="meta-label">Payment</p>
                      <strong className="meta-value">{lastOrder.paymentMethod || "Cash on Delivery"}</strong>
                    </div>
                  </div>
                </div>

                {lastOrder.items && lastOrder.items.length > 0 && (
                  <div className="order-items-preview">
                    <p className="items-preview-label">Order Items:</p>
                    <div className="items-list">
                      {lastOrder.items.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="item-preview">
                          <span className="item-name">{item.name}</span>
                          <span className="item-qty">×{item.quantity}</span>
                        </div>
                      ))}
                      {lastOrder.items.length > 3 && (
                        <div className="item-preview more-items">
                          +{lastOrder.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="order-hint">
                  <FaInfoCircle className="hint-icon" />
                  <span>
                    Mention <strong>#{lastOrder._id.slice(-6).toUpperCase()}</strong> when
                    raising a ticket for quicker support.
                  </span>
                </div>
                <div className="order-actions-inline">
                  <button
                    className="outline-btn"
                    onClick={() => navigate("/dashboard?section=orders")}
                  >
                    <FaClipboardList />
                    View All Orders
                  </button>
                  <button className="primary-btn" onClick={() => navigate("/contact")}>
                    Create Support Ticket
                    <FaArrowRight />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="order-summary-side">
            {renderActiveTimeline(orderSummary.data?.activeOrderList || [])}
            <div className="support-tip-card">
              <p className="tip-title">Need faster help?</p>
              <ul>
                <li>Reference your order ID when chatting with support.</li>
                <li>Attach screenshots or delivery photos for quicker triage.</li>
                <li>Use the “Raise Ticket” button to track replies.</li>
              </ul>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderActiveTimeline = (activeOrderList) => {
    if (!activeOrderList || activeOrderList.length === 0) {
      return (
        <div className="active-timeline empty">
          <p>No active orders right now.</p>
          <span>New orders will appear here automatically.</span>
        </div>
      );
    }

    return (
      <div className="active-timeline">
        <div className="timeline-header">
          <h4>Active Orders</h4>
          <span>{activeOrderList.length} in progress</span>
        </div>
        <div className="timeline-list">
          {activeOrderList.map((order) => (
            <div key={order._id} className="timeline-item">
              <div className="timeline-dot" />
              <div className="timeline-content">
                <div className="timeline-top">
                  <strong>#{order._id.slice(-6).toUpperCase()}</strong>
                  <span className={`status-chip status-${order.status}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <p>{formatOrderDate(order.createdAt)}</p>
                <p className="timeline-amount">
                  {order.items?.length || 0} items · {formatCurrency(order.total)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="support-helpdesk">
      <div className="section-header">
        <h2>Support & Help Desk</h2>
        <p>Manage your support tickets and get help</p>
      </div>

      <div className="order-summary-section">
        <div className="order-summary-header">
          <div>
            <h3>Your Order Snapshot</h3>
            <p>We surface your recent orders here so support can assist faster.</p>
          </div>
          <button className="order-refresh-btn" onClick={fetchOrderSummary}>
            Refresh
          </button>
        </div>
        {renderOrderSummary()}
      </div>

      <div className="support-actions">
        <button
          className="btn-new-ticket"
          onClick={() => navigate("/contact")}
        >
          <FaPlus />
          Raise a New Ticket
        </button>
      </div>

      {error && (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your tickets...</p>
        </div>
      ) : !error && tickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <h3>No support tickets</h3>
          <p>You haven't raised any support tickets yet.</p>
          <p style={{ fontSize: "14px", color: "#999", marginTop: "10px" }}>
            <strong>Note:</strong> Make sure you submit tickets using the same email address you used to register: <strong>{user?.email}</strong>
          </p>
          <button
            className="btn-new-ticket"
            onClick={() => navigate("/contact")}
            style={{ marginTop: "20px" }}
          >
            <FaPlus />
            Raise Your First Ticket
          </button>
        </div>
      ) : !error && tickets.length > 0 ? (
        <div className="tickets-list">
          {tickets.map((ticket) => (
            <div key={ticket._id} className="ticket-card">
              <div className="ticket-header">
                <div className="ticket-icon">
                  <FaTicketAlt />
                </div>
                <div className="ticket-info">
                  <h3>{ticket.inquiryType}</h3>
                  <p className="ticket-date">
                    Created: {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={`ticket-status status-${ticket.status}`}>
                  {getStatusIcon(ticket.status)}
                  <span>{getStatusLabel(ticket.status)}</span>
                  {ticket.adminReply && ticket.adminReply.message && (
                    <span className="reply-badge">💬 Reply Available</span>
                  )}
                </div>
              </div>
              <div className="ticket-message">
                <p><strong>Your Message:</strong></p>
                <p>{ticket.message}</p>
              </div>
              
              {ticket.adminReply && ticket.adminReply.message && (
                <div className="admin-reply-section">
                  <div className="reply-header">
                    <FaReply className="reply-icon" />
                    <h4>Admin Response</h4>
                    <span className="reply-date">
                      {new Date(ticket.adminReply.repliedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="reply-message">
                    <p>{ticket.adminReply.message}</p>
                    <p className="reply-by">
                      Replied by: <strong>{ticket.adminReply.repliedBy}</strong>
                    </p>
                  </div>
                </div>
              )}

              <div className="ticket-actions">
                <button 
                  className="btn-view-ticket"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  View Full Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content ticket-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ticket Details</h2>
              <button className="close-btn" onClick={() => setSelectedTicket(null)}>×</button>
            </div>
            
            <div className="ticket-details">
              <div className="detail-row">
                <strong>Inquiry Type:</strong>
                <span>{selectedTicket.inquiryType}</span>
              </div>
              <div className="detail-row">
                <strong>Status:</strong>
                <span className={`status-badge status-${selectedTicket.status}`}>
                  {getStatusLabel(selectedTicket.status)}
                </span>
              </div>
              <div className="detail-row">
                <strong>Created:</strong>
                <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
              </div>
              {selectedTicket.phone && (
                <div className="detail-row">
                  <strong>Phone:</strong>
                  <span>{selectedTicket.phone}</span>
                </div>
              )}
              
              <div className="detail-section">
                <h4>Your Message</h4>
                <div className="message-box">
                  <p>{selectedTicket.message}</p>
                </div>
              </div>

              {selectedTicket.adminReply && selectedTicket.adminReply.message ? (
                <div className="detail-section">
                  <h4>Admin Response</h4>
                  <div className="admin-reply-box">
                    <div className="reply-meta">
                      <span>
                        <strong>Replied by:</strong> {selectedTicket.adminReply.repliedBy}
                      </span>
                      <span>
                        {new Date(selectedTicket.adminReply.repliedAt).toLocaleString()}
                      </span>
                    </div>
                    <p>{selectedTicket.adminReply.message}</p>
                  </div>
                </div>
              ) : (
                <div className="no-reply">
                  <FaClock />
                  <p>No response yet. Our team will get back to you soon!</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setSelectedTicket(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportHelpDesk;

