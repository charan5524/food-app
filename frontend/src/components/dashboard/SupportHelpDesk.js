import React, { useState, useEffect } from "react";
import { FaTicketAlt, FaPlus, FaCheckCircle, FaClock, FaTimesCircle, FaReply, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { feedbackService } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./SupportHelpDesk.css";

const SupportHelpDesk = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      console.log("👤 Current user:", user.email);
      fetchTickets();
    } else {
      setError("Please log in to view your tickets");
      setLoading(false);
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

  return (
    <div className="support-helpdesk">
      <div className="section-header">
        <h2>Support & Help Desk</h2>
        <p>Manage your support tickets and get help</p>
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

