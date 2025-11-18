const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const adminController = require("../controllers/adminController");
const menuController = require("../controllers/menuController");
const adminOrderController = require("../controllers/adminOrderController");
const analyticsController = require("../controllers/analyticsController");
const categoryController = require("../controllers/categoryController");
const promoController = require("../controllers/promoController");
const feedbackController = require("../controllers/feedbackController");
const notificationController = require("../controllers/notificationController");

// Dashboard statistics
router.get("/dashboard/stats", adminAuth, adminController.getDashboardStats);

// User management routes
router.get("/users", adminAuth, adminController.getAllUsers);
router.get("/users/:id", adminAuth, adminController.getUserById);
router.patch("/users/:id/toggle-status", adminAuth, adminController.toggleUserStatus);

// Menu management routes
router.get("/menu", adminAuth, menuController.getAllMenuItems);
router.get("/menu/:id", adminAuth, menuController.getMenuItemById);
router.post("/menu", adminAuth, menuController.upload, menuController.createMenuItem);
router.put("/menu/:id", adminAuth, menuController.upload, menuController.updateMenuItem);
router.delete("/menu/:id", adminAuth, menuController.deleteMenuItem);

// Order management routes
router.get("/orders", adminAuth, adminOrderController.getAllOrders);
router.get("/orders/:id", adminAuth, adminOrderController.getOrderById);
router.patch("/orders/:id/status", adminAuth, adminOrderController.updateOrderStatus);

// Analytics routes
router.get("/analytics", adminAuth, analyticsController.getAnalytics);

// Category management routes
router.get("/categories", adminAuth, categoryController.getAllCategories);
router.post("/categories", adminAuth, categoryController.createCategory);
router.put("/categories/:id", adminAuth, categoryController.updateCategory);
router.delete("/categories/:id", adminAuth, categoryController.deleteCategory);

// Promo code routes
router.get("/promo-codes", adminAuth, promoController.getAllPromoCodes);
router.post("/promo-codes", adminAuth, promoController.createPromoCode);
router.put("/promo-codes/:id", adminAuth, promoController.updatePromoCode);
router.delete("/promo-codes/:id", adminAuth, promoController.deletePromoCode);

// Feedback routes
router.get("/feedback", adminAuth, feedbackController.getAllFeedback);
router.get("/feedback/:id", adminAuth, feedbackController.getFeedbackById);
router.patch("/feedback/:id/status", adminAuth, feedbackController.updateFeedbackStatus);
router.post("/feedback/:id/reply", adminAuth, feedbackController.replyToFeedback);
router.delete("/feedback/:id", adminAuth, feedbackController.deleteFeedback);

// Notification routes
router.get("/notifications", adminAuth, notificationController.getAllNotifications);
router.patch("/notifications/:id/read", adminAuth, notificationController.markAsRead);
router.patch("/notifications/read-all", adminAuth, notificationController.markAllAsRead);
router.delete("/notifications/:id", adminAuth, notificationController.deleteNotification);

module.exports = router;
