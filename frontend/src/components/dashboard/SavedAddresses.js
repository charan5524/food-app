import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaHome, FaBriefcase, FaMapMarkerAlt } from "react-icons/fa";
import "./SavedAddresses.css";

const SavedAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    label: "",
    type: "home",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("savedAddresses");
    if (saved) {
      setAddresses(JSON.parse(saved));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAddress) {
      const updated = addresses.map((addr) =>
        addr.id === editingAddress.id ? { ...formData, id: editingAddress.id } : addr
      );
      setAddresses(updated);
      localStorage.setItem("savedAddresses", JSON.stringify(updated));
      setEditingAddress(null);
    } else {
      const newAddress = { ...formData, id: Date.now().toString() };
      const updated = [...addresses, newAddress];
      setAddresses(updated);
      localStorage.setItem("savedAddresses", JSON.stringify(updated));
    }
    setShowForm(false);
    setFormData({
      label: "",
      type: "home",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
    });
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData(address);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      const updated = addresses.filter((addr) => addr.id !== id);
      setAddresses(updated);
      localStorage.setItem("savedAddresses", JSON.stringify(updated));
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "home":
        return <FaHome />;
      case "work":
        return <FaBriefcase />;
      default:
        return <FaMapMarkerAlt />;
    }
  };

  return (
    <div className="saved-addresses">
      <div className="section-header">
        <h2>Saved Addresses</h2>
        <p>Manage your delivery addresses</p>
      </div>

      {!showForm && (
        <button className="btn-add-address" onClick={() => setShowForm(true)}>
          <FaPlus />
          Add New Address
        </button>
      )}

      {showForm && (
        <div className="address-form-card">
          <h3>{editingAddress ? "Edit Address" : "Add New Address"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Home, Work"
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => {
                setShowForm(false);
                setEditingAddress(null);
                setFormData({
                  label: "",
                  type: "home",
                  street: "",
                  city: "",
                  state: "",
                  zipCode: "",
                  phone: "",
                });
              }}>
                Cancel
              </button>
              <button type="submit" className="btn-save">
                {editingAddress ? "Update Address" : "Save Address"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="addresses-grid">
        {addresses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📍</div>
            <h3>No saved addresses</h3>
            <p>Add your first address to get started!</p>
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="address-card">
              <div className="address-header">
                <div className="address-type-icon">
                  {getTypeIcon(address.type)}
                </div>
                <div className="address-info">
                  <h3>{address.label}</h3>
                  <span className="address-type-badge">{address.type}</span>
                </div>
              </div>
              <div className="address-details">
                <p>{address.street}</p>
                <p>
                  {address.city}, {address.state} {address.zipCode}
                </p>
                {address.phone && <p>Phone: {address.phone}</p>}
              </div>
              <div className="address-actions">
                <button className="btn-edit" onClick={() => handleEdit(address)}>
                  <FaEdit />
                  Edit
                </button>
                <button className="btn-delete" onClick={() => handleDelete(address.id)}>
                  <FaTrash />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SavedAddresses;

