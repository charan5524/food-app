const MenuItem = require("../models/Menu");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/menu");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "menu-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

exports.upload = upload.single("image");

// Get all menu items (admin - includes unavailable items)
exports.getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      menuItems,
      count: menuItems.length,
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching menu items",
    });
  }
};

// Simple in-memory cache for public menu items (1 minute TTL)
let publicMenuCache = {
  data: null,
  timestamp: null,
  ttl: 60 * 1000, // 1 minute in milliseconds
};

// Get public menu items (only available items, optimized for customers)
exports.getPublicMenuItems = async (req, res) => {
  try {
    // Check cache first
    const now = Date.now();
    if (publicMenuCache.data && publicMenuCache.timestamp && 
        (now - publicMenuCache.timestamp) < publicMenuCache.ttl) {
      return res.json(publicMenuCache.data);
    }

    // Only return available items, sorted by popular first, then by name
    const menuItems = await MenuItem.find({ available: true })
      .sort({ popular: -1, name: 1 })
      .select('name description price category image popular available')
      .lean(); // Use lean() for better performance
    
    const response = {
      success: true,
      menuItems,
      count: menuItems.length,
    };

    // Update cache
    publicMenuCache.data = response;
    publicMenuCache.timestamp = now;
    
    res.json(response);
  } catch (error) {
    console.error("Error fetching public menu items:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching menu items",
    });
  }
};

// Clear public menu cache (call this when menu items are updated)
exports.clearPublicMenuCache = () => {
  publicMenuCache.data = null;
  publicMenuCache.timestamp = null;
};

// Get menu item by ID
exports.getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.json({
      success: true,
      menuItem,
    });
  } catch (error) {
    console.error("Error fetching menu item:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching menu item",
    });
  }
};

// Create new menu item
exports.createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, available, popular } = req.body;
    
    // Handle image upload
    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/menu/${req.file.filename}`;
    } else if (req.body.image) {
      // Allow URL from frontend
      imageUrl = req.body.image;
    }

    const menuItem = new MenuItem({
      name,
      description,
      price: parseFloat(price),
      category,
      image: imageUrl,
      available: available !== undefined ? available : true,
      popular: popular !== undefined ? popular : false,
    });

    await menuItem.save();

    // Clear public menu cache when menu is updated
    exports.clearPublicMenuCache();

    res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      menuItem,
    });
  } catch (error) {
    console.error("Error creating menu item:", error);
    res.status(500).json({
      success: false,
      message: "Error creating menu item",
      error: error.message,
    });
  }
};

// Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, available, popular } = req.body;
    
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (menuItem.image && menuItem.image.startsWith("/uploads/")) {
        const oldImagePath = path.join(__dirname, "..", menuItem.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      menuItem.image = `/uploads/menu/${req.file.filename}`;
    } else if (req.body.image) {
      menuItem.image = req.body.image;
    }

      // Update fields
      if (name) menuItem.name = name;
      if (description) menuItem.description = description;
      if (price) menuItem.price = parseFloat(price);
      if (category) menuItem.category = category;
      if (available !== undefined) menuItem.available = available;
      if (popular !== undefined) menuItem.popular = popular;

      await menuItem.save();

      // Clear public menu cache when menu is updated
      exports.clearPublicMenuCache();

      // Check for low stock (if availability is set to false)
      if (menuItem.available === false) {
        try {
          const Notification = require("../models/Notification");
          // Check if notification already exists for this item
          const existingNotif = await Notification.findOne({
            type: "low_stock",
            message: { $regex: menuItem.name },
            read: false,
          });
          
          if (!existingNotif) {
            const notification = new Notification({
              type: "low_stock",
              title: "Item Out of Stock",
              message: `${menuItem.name} is now out of stock`,
              link: `/admin/dashboard?section=menu&id=${menuItem._id}`,
            });
            await notification.save();
          }
        } catch (notifError) {
          console.error("Error creating low stock notification:", notifError);
        }
      }

    res.json({
      success: true,
      message: "Menu item updated successfully",
      menuItem,
    });
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({
      success: false,
      message: "Error updating menu item",
      error: error.message,
    });
  }
};

// Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    // Delete associated image
    if (menuItem.image && menuItem.image.startsWith("/uploads/")) {
      const imagePath = path.join(__dirname, "..", menuItem.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await MenuItem.findByIdAndDelete(req.params.id);

    // Clear public menu cache when menu is deleted
    exports.clearPublicMenuCache();

    res.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting menu item",
    });
  }
};

