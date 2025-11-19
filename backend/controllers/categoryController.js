const Category = require("../models/Category");
const MenuItem = require("../models/Menu");

// Get all categories (admin)
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

// Simple in-memory cache for public categories (1 minute TTL)
let publicCategoryCache = {
  data: null,
  timestamp: null,
  ttl: 60 * 1000, // 1 minute in milliseconds
};

// Get public categories (only categories that have available menu items)
exports.getPublicCategories = async (req, res) => {
  try {
    // Check cache first
    const now = Date.now();
    if (publicCategoryCache.data && publicCategoryCache.timestamp && 
        (now - publicCategoryCache.timestamp) < publicCategoryCache.ttl) {
      return res.json(publicCategoryCache.data);
    }

    const MenuItem = require("../models/Menu");
    
    // Get distinct categories from available menu items
    const categoriesWithItems = await MenuItem.distinct("category", { available: true });
    
    // Get full category details for those categories
    const categories = await Category.find({ 
      name: { $in: categoriesWithItems } 
    }).sort({ name: 1 }).lean();
    
    // If category doesn't exist in Category collection, create a basic entry
    const categoryMap = new Map(categories.map(cat => [cat.name, cat]));
    const allCategories = categoriesWithItems.map(catName => {
      if (categoryMap.has(catName)) {
        return categoryMap.get(catName);
      }
      // Return basic category info if not in Category collection
      return { name: catName, icon: "", description: "" };
    });
    
    const response = {
      success: true,
      categories: allCategories,
    };

    // Update cache
    publicCategoryCache.data = response;
    publicCategoryCache.timestamp = now;
    
    res.json(response);
  } catch (error) {
    console.error("Error fetching public categories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
    });
  }
};

// Clear public category cache (call this when categories are updated)
exports.clearPublicCategoryCache = () => {
  publicCategoryCache.data = null;
  publicCategoryCache.timestamp = null;
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

    // Clear public category cache when category is updated
    exports.clearPublicCategoryCache();

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

    // Clear public category cache when category is updated
    exports.clearPublicCategoryCache();

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

    // Clear public category cache when category is deleted
    exports.clearPublicCategoryCache();

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

