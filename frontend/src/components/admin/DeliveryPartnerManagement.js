import React, { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { FaPlus, FaTrash, FaMotorcycle, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import "./DeliveryPartnerManagement.css";

const DeliveryPartnerManagement = () => {
  const { showToast } = useToast();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    phone: "", 
    vehicleType: "Bike", 
    vehicleNumber: "" 
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    console.log("DeliveryPartnerManagement component mounted");
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllDeliveryPartners();
      console.log("Delivery partners response:", response);
      if (response.success) {
        setPartners(response.data || []);
      } else {
        showToast(response.message || "Error fetching delivery partners", "error");
        setPartners([]);
      }
    } catch (error) {
      console.error("Error fetching delivery partners:", error);
      const errorMessage = error.response?.data?.message || error.message || "Error fetching delivery partners";
      showToast(errorMessage, "error");
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPartner = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showToast("Please fill in name and phone", "error");
      return;
    }

    try {
      setAdding(true);
      const response = await adminService.createDeliveryPartner(formData);
      if (response.success) {
        showToast("Delivery partner added successfully", "success");
        setFormData({ name: "", phone: "", vehicleType: "Bike", vehicleNumber: "" });
        setShowAddForm(false);
        fetchPartners();
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Error adding delivery partner", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleDeletePartner = async (id) => {
    if (!window.confirm("Are you sure you want to delete this delivery partner?")) {
      return;
    }

    try {
      const response = await adminService.deleteDeliveryPartner(id);
      if (response.success) {
        showToast("Delivery partner deleted successfully", "success");
        fetchPartners();
      }
    } catch (error) {
      showToast(error.response?.data?.message || "Error deleting delivery partner", "error");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await adminService.updateDeliveryPartnerStatus(id, newStatus);
      if (response.success) {
        showToast("Status updated successfully", "success");
        fetchPartners();
      }
    } catch (error) {
      showToast("Error updating status", "error");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "free":
        return <FaCheckCircle className="status-icon free" />;
      case "busy":
        return <FaClock className="status-icon busy" />;
      case "offline":
        return <FaTimesCircle className="status-icon offline" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "free":
        return "#10b981";
      case "busy":
        return "#f59e0b";
      case "offline":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="delivery-partner-management">
      <div className="header-section">
        <h2>
          <FaMotorcycle /> Delivery Partners
        </h2>
        <button
          className="add-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <FaPlus /> Add Partner
        </button>
      </div>

      {showAddForm && (
        <div className="add-form">
          <h3>Add New Delivery Partner</h3>
          <form onSubmit={handleAddPartner}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter partner name"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
                required
              />
            </div>
            <div className="form-group">
              <label>Vehicle Type</label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="vehicle-type-select"
              >
                <option value="Bike">Bike</option>
                <option value="Scooter">Scooter</option>
                <option value="Car">Car</option>
                <option value="Auto">Auto</option>
                <option value="Cycle">Cycle</option>
              </select>
            </div>
            <div className="form-group">
              <label>Vehicle Number (Optional)</label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                placeholder="e.g., AP 09 CD 1234"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="submit-btn" disabled={adding}>
                {adding ? "Adding..." : "Add Partner"}
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ name: "", phone: "", vehicleType: "Bike", vehicleNumber: "" });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-container">Loading delivery partners...</div>
      ) : (
        <div className="partners-grid">
          {partners.length === 0 ? (
            <div className="empty-state">
              <FaMotorcycle size={48} />
              <p>No delivery partners yet. Add your first partner!</p>
            </div>
          ) : (
          partners.map((partner) => (
            <div key={partner._id} className="partner-card">
              <div className="partner-header">
                <div className="partner-info">
                  <h3>{partner.name}</h3>
                  <p className="phone">{partner.phone}</p>
                  <div className="vehicle-info">
                    <span className="vehicle-type">{partner.vehicleType || "Bike"}</span>
                    {partner.vehicleNumber && (
                      <span className="vehicle-number">• {partner.vehicleNumber}</span>
                    )}
                  </div>
                </div>
                <div className="status-badge" style={{ color: getStatusColor(partner.status) }}>
                  {getStatusIcon(partner.status)}
                  <span>{partner.status.toUpperCase()}</span>
                </div>
              </div>
              
              {partner.activeOrders > 0 && (
                <div className="active-orders">
                  Active Orders: <strong>{partner.activeOrders}</strong>
                </div>
              )}

              <div className="partner-actions">
                <select
                  value={partner.status}
                  onChange={(e) => handleStatusChange(partner._id, e.target.value)}
                  className="status-select"
                >
                  <option value="free">Free</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
                <button
                  className="delete-btn"
                  onClick={() => handleDeletePartner(partner._id)}
                  title="Delete partner"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryPartnerManagement;

