import React, { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { FaEye, FaTrash, FaEnvelope, FaReply } from "react-icons/fa";
import "./FeedbackManagement.css";

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, [statusFilter]);

  const fetchFeedback = async () => {
    try {
      const response = await adminService.getAllFeedback(statusFilter || undefined);
      if (response.success) {
        setFeedback(response.feedback);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await adminService.updateFeedbackStatus(id, newStatus);
      fetchFeedback();
      if (selectedFeedback && selectedFeedback._id === id) {
        setSelectedFeedback({ ...selectedFeedback, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating feedback status:", error);
      alert("Error updating feedback status");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        await adminService.deleteFeedback(id);
        fetchFeedback();
        if (selectedFeedback && selectedFeedback._id === id) {
          setSelectedFeedback(null);
        }
      } catch (error) {
        console.error("Error deleting feedback:", error);
        alert("Error deleting feedback");
      }
    }
  };

  const handleView = async (id) => {
    try {
      const response = await adminService.getFeedbackById(id);
      if (response.success) {
        setSelectedFeedback(response.feedback);
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  const handleReply = (feedbackItem) => {
    setReplyingTo(feedbackItem);
    setReplyMessage("");
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    if (!replyMessage.trim()) {
      alert("Please enter a reply message");
      return;
    }

    try {
      await adminService.replyToFeedback(replyingTo._id, replyMessage);
      setShowReplyModal(false);
      setReplyMessage("");
      setReplyingTo(null);
      fetchFeedback();
      if (selectedFeedback && selectedFeedback._id === replyingTo._id) {
        const response = await adminService.getFeedbackById(replyingTo._id);
        if (response.success) {
          setSelectedFeedback(response.feedback);
        }
      }
      alert("Reply sent successfully! Customer will receive an email notification.");
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Error sending reply");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: "#ed8936",
      read: "#4299e1",
      replied: "#667eea",
      resolved: "#48bb78",
    };
    return colors[status] || "#666";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading feedback...</div>;
  }

  return (
    <div className="feedback-management">
      <div className="section-header">
        <h2>Customer Feedback</h2>
        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="">All Feedback</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="feedback-list">
        {feedback.length === 0 ? (
          <div className="empty-state">No feedback found</div>
        ) : (
          feedback.map((item) => (
            <div key={item._id} className="feedback-card">
              <div className="feedback-header">
                <div>
                  <h3>{item.name}</h3>
                  <p className="feedback-email">
                    <FaEnvelope /> {item.email}
                  </p>
                </div>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(item.status) }}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>

              <div className="feedback-info">
                <div className="info-item">
                  <strong>Type:</strong> {item.inquiryType}
                </div>
                <div className="info-item">
                  <strong>Date:</strong> {formatDate(item.createdAt)}
                </div>
                {item.phone && (
                  <div className="info-item">
                    <strong>Phone:</strong> {item.phone}
                  </div>
                )}
              </div>

              <div className="feedback-message">
                <p>{item.message}</p>
              </div>

              <div className="feedback-actions">
                <button
                  className="btn-view"
                  onClick={() => handleView(item._id)}
                >
                  <FaEye /> View Details
                </button>
                <button
                  className="btn-reply"
                  onClick={() => handleReply(item)}
                >
                  <FaReply /> Reply
                </button>
                <select
                  value={item.status}
                  onChange={(e) =>
                    handleStatusUpdate(item._id, e.target.value)
                  }
                  className="status-select"
                  style={{ borderColor: getStatusColor(item.status) }}
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="resolved">Resolved</option>
                </select>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(item._id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedFeedback && (
        <div className="modal-overlay" onClick={() => setSelectedFeedback(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Feedback Details</h3>
            <div className="feedback-details">
              <div className="detail-section">
                <h4>Customer Information</h4>
                <p>
                  <strong>Name:</strong> {selectedFeedback.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedFeedback.email}
                </p>
                {selectedFeedback.phone && (
                  <p>
                    <strong>Phone:</strong> {selectedFeedback.phone}
                  </p>
                )}
                <p>
                  <strong>Inquiry Type:</strong> {selectedFeedback.inquiryType}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(selectedFeedback.createdAt)}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(selectedFeedback.status),
                    }}
                  >
                    {selectedFeedback.status}
                  </span>
                </p>
              </div>

              <div className="detail-section">
                <h4>Message</h4>
                <div className="message-box">
                  <p>{selectedFeedback.message}</p>
                </div>
              </div>

              {selectedFeedback.adminReply && selectedFeedback.adminReply.message && (
                <div className="detail-section">
                  <h4>Admin Reply</h4>
                  <div className="reply-box">
                    <div className="reply-header">
                      <span>
                        <strong>Replied by:</strong> {selectedFeedback.adminReply.repliedBy}
                      </span>
                      <span>
                        {new Date(selectedFeedback.adminReply.repliedAt).toLocaleString()}
                      </span>
                    </div>
                    <p>{selectedFeedback.adminReply.message}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              {!selectedFeedback.adminReply?.message && (
                <button
                  className="btn-reply"
                  onClick={() => {
                    setSelectedFeedback(null);
                    handleReply(selectedFeedback);
                  }}
                >
                  <FaReply /> Reply to Customer
                </button>
              )}
              <button
                className="btn-secondary"
                onClick={() => setSelectedFeedback(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showReplyModal && replyingTo && (
        <div className="modal-overlay" onClick={() => setShowReplyModal(false)}>
          <div className="modal-content reply-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reply to Customer</h3>
            <div className="reply-info">
              <p>
                <strong>Customer:</strong> {replyingTo.name} ({replyingTo.email})
              </p>
              <p>
                <strong>Inquiry Type:</strong> {replyingTo.inquiryType}
              </p>
            </div>
            <div className="form-group">
              <label>Your Reply *</label>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your response to the customer..."
                rows="8"
                required
              />
              <small style={{ color: "#666", fontSize: "12px", marginTop: "5px", display: "block" }}>
                The customer will receive an email notification with your reply.
              </small>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyMessage("");
                  setReplyingTo(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleSendReply}
              >
                <FaReply /> Send Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;

