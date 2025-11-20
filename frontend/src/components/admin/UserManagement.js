import React, { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { FaEye, FaBan, FaCheckCircle } from "react-icons/fa";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminService.getAllUsers();
      if (response.success) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const response = await adminService.toggleUserStatus(userId);
      if (response.success) {
        fetchUsers();
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser({ ...selectedUser, blocked: !selectedUser.blocked });
        }
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert("Error updating user status");
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await adminService.getUserById(userId);
      if (response.success) {
        setSelectedUser({ ...response.user, orders: response.orders });
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management">
      <div className="section-header">
        <h2>User Management</h2>
        <p className="user-count">Total Users: {users.length}</p>
      </div>

      <div className="users-table">
        <div className="table-header">
          <div className="table-cell">Name</div>
          <div className="table-cell">Email</div>
          <div className="table-cell">Join Date</div>
          <div className="table-cell">Status</div>
          <div className="table-cell">Actions</div>
        </div>

        {users.length === 0 ? (
          <div className="empty-state">No users found</div>
        ) : (
          users.map((user) => (
            <div key={user._id} className="table-row">
              <div className="table-cell">{user.name}</div>
              <div className="table-cell">{user.email}</div>
              <div className="table-cell">{formatDate(user.createdAt)}</div>
              <div className="table-cell">
                <span
                  className={`status-badge ${user.blocked ? "blocked" : "active"}`}
                >
                  {user.blocked ? "Blocked" : "Active"}
                </span>
              </div>
              <div className="table-cell actions">
                <button
                  className="btn-view"
                  onClick={() => handleViewUser(user._id)}
                >
                  <FaEye /> View
                </button>
                <button
                  className={`btn-toggle ${user.blocked ? "unblock" : "block"}`}
                  onClick={() => handleToggleStatus(user._id)}
                >
                  {user.blocked ? (
                    <>
                      <FaCheckCircle /> Unblock
                    </>
                  ) : (
                    <>
                      <FaBan /> Block
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>User Details</h3>
            <div className="user-details">
              <div className="detail-section">
                <h4>User Information</h4>
                <p>
                  <strong>Name:</strong> {selectedUser.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Join Date:</strong> {formatDate(selectedUser.createdAt)}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`status-badge ${
                      selectedUser.blocked ? "blocked" : "active"
                    }`}
                  >
                    {selectedUser.blocked ? "Blocked" : "Active"}
                  </span>
                </p>
              </div>

              {selectedUser.orders && selectedUser.orders.length > 0 && (
                <div className="detail-section">
                  <h4>Recent Orders ({selectedUser.orders.length})</h4>
                  <div className="orders-list">
                    {selectedUser.orders.map((order) => (
                      <div key={order._id} className="order-item">
                        <div className="order-item-header">
                          <span>
                            <strong>Order #{order._id.slice(-6)}</strong>
                          </span>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor:
                                order.status === "completed"
                                  ? "#48bb78"
                                  : order.status === "cancelled"
                                  ? "#f56565"
                                  : "#ed8936",
                            }}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="order-item-details">
                          <span>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setSelectedUser(null)}
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

export default UserManagement;

