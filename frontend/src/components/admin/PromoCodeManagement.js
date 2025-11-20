import React, { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { FaPlus, FaEdit, FaTrash, FaCopy } from "react-icons/fa";
import "./PromoCodeManagement.css";

const PromoCodeManagement = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    expiryDate: "",
    usageLimit: "",
    minOrderAmount: "",
    active: true,
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      const response = await adminService.getAllPromoCodes();
      if (response.success) {
        setPromoCodes(response.promoCodes);
      }
    } catch (error) {
      console.error("Error fetching promo codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
      };
      
      if (editingPromo) {
        await adminService.updatePromoCode(editingPromo._id, data);
      } else {
        await adminService.createPromoCode(data);
      }
      resetForm();
      fetchPromoCodes();
    } catch (error) {
      console.error("Error saving promo code:", error);
      alert("Error saving promo code");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this promo code?")) {
      try {
        await adminService.deletePromoCode(id);
        fetchPromoCodes();
      } catch (error) {
        console.error("Error deleting promo code:", error);
        alert("Error deleting promo code");
      }
    }
  };

  const handleEdit = (promo) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      expiryDate: new Date(promo.expiryDate).toISOString().split('T')[0],
      usageLimit: promo.usageLimit || "",
      minOrderAmount: promo.minOrderAmount || "",
      active: promo.active,
    });
    setShowModal(true);
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert("Promo code copied to clipboard!");
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      expiryDate: "",
      usageLimit: "",
      minOrderAmount: "",
      active: true,
    });
    setEditingPromo(null);
    setShowModal(false);
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return <div className="loading">Loading promo codes...</div>;
  }

  return (
    <div className="promo-management">
      <div className="section-header">
        <h2>Promo Code Management</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Add Promo Code
        </button>
      </div>

      <div className="promo-grid">
        {promoCodes.map((promo) => (
          <div
            key={promo._id}
            className={`promo-card ${!promo.active || isExpired(promo.expiryDate) ? "inactive" : ""}`}
          >
            <div className="promo-header">
              <div className="promo-code">
                <span>{promo.code}</span>
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(promo.code)}
                  title="Copy code"
                >
                  <FaCopy />
                </button>
              </div>
              <span
                className={`status-badge ${promo.active && !isExpired(promo.expiryDate) ? "active" : "inactive"}`}
              >
                {!promo.active
                  ? "Inactive"
                  : isExpired(promo.expiryDate)
                  ? "Expired"
                  : "Active"}
              </span>
            </div>

            <div className="promo-details">
              <div className="discount-info">
                <span className="discount-value">
                  {promo.discountType === "percentage"
                    ? `${promo.discountValue}%`
                    : `$${promo.discountValue}`}{" "}
                  OFF
                </span>
              </div>
              <div className="promo-info">
                <p>
                  <strong>Expires:</strong>{" "}
                  {new Date(promo.expiryDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Usage:</strong> {promo.usedCount} /{" "}
                  {promo.usageLimit || "∞"}
                </p>
                {promo.minOrderAmount > 0 && (
                  <p>
                    <strong>Min Order:</strong> ${promo.minOrderAmount}
                  </p>
                )}
              </div>
            </div>

            <div className="promo-actions">
              <button className="btn-edit" onClick={() => handleEdit(promo)}>
                <FaEdit /> Edit
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(promo._id)}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingPromo ? "Edit Promo Code" : "Add Promo Code"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    required
                    placeholder="SAVE20"
                  />
                </div>
                <div className="form-group">
                  <label>Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value })
                    }
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: e.target.value })
                    }
                    required
                    placeholder="20"
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date *</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div className="form-group">
                  <label>Min Order Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderAmount: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                  />
                  Active
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingPromo ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoCodeManagement;

