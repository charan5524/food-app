const Category = require("../models/Category");
const MenuItem = require("../models/Menu");

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
    });
  }
};

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    
    const category = new Category({
      name,
      description: description || "",
      icon: icon || "",
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }
    res.status(500).json({
      success: false,
      message: "Error creating category",
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;

    await category.save();

    res.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      success: false,
      message: "Error updating category",
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if any menu items use this category
    const itemsCount = await MenuItem.countDocuments({ category: category.name });
    if (itemsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${itemsCount} menu item(s) are using this category.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting category",
    });
  }
};

