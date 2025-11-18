import React, { useState } from "react";
import { FaTicketAlt, FaPlus, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./SupportHelpDesk.css";

const SupportHelpDesk = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([
    {
      id: 1,
      subject: "Order delivery issue",
      status: "resolved",
      date: "2024-11-15",
      message: "My order was delayed",
    },
    {
      id: 2,
      subject: "Payment problem",
      status: "pending",
      date: "2024-11-18",
      message: "Payment not processed",
    },
  ]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <FaCheckCircle className="status-icon resolved" />;
      case "pending":
        return <FaClock className="status-icon pending" />;
      default:
        return <FaTimesCircle className="status-icon cancelled" />;
    }
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

      {tickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎫</div>
          <h3>No support tickets</h3>
          <p>You haven't raised any support tickets yet.</p>
        </div>
      ) : (
        <div className="tickets-list">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-header">
                <div className="ticket-icon">
                  <FaTicketAlt />
                </div>
                <div className="ticket-info">
                  <h3>{ticket.subject}</h3>
                  <p className="ticket-date">
                    Created: {new Date(ticket.date).toLocaleDateString()}
                  </p>
                </div>
                <div className={`ticket-status status-${ticket.status}`}>
                  {getStatusIcon(ticket.status)}
                  <span>{ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}</span>
                </div>
              </div>
              <div className="ticket-message">
                <p>{ticket.message}</p>
              </div>
              <div className="ticket-actions">
                <button className="btn-view-ticket">View Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupportHelpDesk;

