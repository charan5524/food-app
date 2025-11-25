import React, { useState, useEffect } from "react";
import { adminService, menuService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { FaPlus, FaEdit, FaTrash, FaImage } from "react-icons/fa";
import "./MenuManagement.css";

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Breakfast",
    available: true,
    popular: false,
    image: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const categories = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Drinks",
    "Beverages",
    "Desserts",
    "Biryani",
    "Rice Dishes",
    "Curries",
    "Appetizers",
    "Vegetable Dishes",
    "Non-Veg Dry Items",
    "Breads",
  ];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await adminService.getAllMenuItems();
      if (response.success) {
        setMenuItems(response.menuItems);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("available", formData.available);
      formDataToSend.append("popular", formData.popular);

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      } else if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      if (editingItem) {
        await adminService.updateMenuItem(editingItem._id, formDataToSend);
        showToast("Menu item updated successfully!", "success");
      } else {
        await adminService.createMenuItem(formDataToSend);
        showToast("Menu item created successfully!", "success");
      }

      // Clear menu cache to force refresh
      menuService.clearCache();

      resetForm();
      // Add a small delay to ensure backend processes the update
      setTimeout(() => {
        fetchMenuItems();
      }, 500);
    } catch (error) {
      console.error("Error saving menu item:", error);
      showToast(
        error.response?.data?.message || "Error saving menu item",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async id => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await adminService.deleteMenuItem(id);
        fetchMenuItems();
      } catch (error) {
        console.error("Error deleting menu item:", error);
        alert("Error deleting menu item");
      }
    }
  };

  const handleEdit = item => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      available: item.available,
      popular: item.popular,
      image: item.image,
    });
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Breakfast",
      available: true,
      popular: false,
      image: "",
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingItem(null);
    setShowModal(false);
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  if (loading) {
    return <div className="loading">Loading menu items...</div>;
  }

  return (
    <div className="menu-management">
      <div className="section-header">
        <h2>Menu Management</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Add New Item
        </button>
      </div>

      <div className="menu-grid">
        {menuItems.map(item => (
          <div key={item._id} className="menu-item-card">
            <div className="menu-item-image">
              {item.image ? (
                <img
                  src={
                    item.image.startsWith("http")
                      ? `${item.image}?t=${Date.now()}`
                      : `${API_URL}${item.image}?t=${Date.now()}`
                  }
                  alt={item.name}
                  key={`${item._id}-${item.updatedAt || Date.now()}`}
                  onError={e => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              {(!item.image || item.image === "") && (
                <div className="no-image">
                  <FaImage />
                </div>
              )}
              <div className="item-badges">
                {item.popular && <span className="badge popular">Popular</span>}
                {!item.available && (
                  <span className="badge unavailable">Out of Stock</span>
                )}
              </div>
            </div>
            <div className="menu-item-content">
              <h3>{item.name}</h3>
              <p className="item-description">{item.description}</p>
              <div className="item-details">
                <span className="item-category">{item.category}</span>
                <span className="item-price">${item.price}</span>
              </div>
              <div className="item-actions">
                <button className="btn-edit" onClick={() => handleEdit(item)}>
                  <FaEdit /> Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(item._id)}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={e =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="remove-preview-btn"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {!imageFile && formData.image && (
                  <div className="current-image">
                    <p>Current Image:</p>
                    <img
                      src={
                        formData.image.startsWith("http")
                          ? formData.image
                          : `${API_URL}${formData.image}`
                      }
                      alt="Current"
                      onError={e => {
                        e.target.style.display = "none";
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Or enter image URL"
                      value={formData.image}
                      onChange={e =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="form-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={e =>
                      setFormData({ ...formData, available: e.target.checked })
                    }
                  />
                  Available
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.popular}
                    onChange={e =>
                      setFormData({ ...formData, popular: e.target.checked })
                    }
                  />
                  Popular
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingItem
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
