import React, { useState, useEffect } from "react";
import { adminService } from "../../services/api";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "./CategoryManagement.css";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await adminService.getAllCategories();
      if (response.success) {
        setCategories(response.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory._id, formData);
      } else {
        await adminService.createCategory(formData);
      }
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Error saving category");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await adminService.deleteCategory(id);
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        alert(error.response?.data?.message || "Error deleting category");
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", icon: "" });
    setEditingCategory(null);
    setShowModal(false);
  };

  if (loading) {
    return <div className="loading">Loading categories...</div>;
  }

  return (
    <div className="category-management">
      <div className="section-header">
        <h2>Category Management</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus /> Add Category
        </button>
      </div>

      <div className="categories-grid">
        {categories.map((category) => (
          <div key={category._id} className="category-card">
            <div className="category-icon">{category.icon || "📁"}</div>
            <h3>{category.name}</h3>
            <p>{category.description || "No description"}</p>
            <div className="category-actions">
              <button className="btn-edit" onClick={() => handleEdit(category)}>
                <FaEdit /> Edit
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(category._id)}
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
            <h3>{editingCategory ? "Edit Category" : "Add Category"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Icon (emoji or text)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  placeholder="📁"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;

