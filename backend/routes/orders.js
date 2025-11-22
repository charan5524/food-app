const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const deliveryController = require("../controllers/deliveryController");
const auth = require("../middleware/auth");
const { validateOrder } = require("../middleware/validation");
const { apiLimiter } = require("../middleware/rateLimiter");

// Create a new order
router.post("/", apiLimiter, auth, validateOrder, orderController.createOrder);

// Get all orders for a user
router.get("/", apiLimiter, auth, orderController.getUserOrders);

// Send order confirmation email (must be before /:id routes)
router.post(
  "/send-order-confirmation",
  apiLimiter,
  orderController.sendOrderConfirmation
);

// Delivery Tracking Routes (MUST be before /:id route to avoid route conflicts)
router.post(
  "/:orderId/delivery/assign",
  apiLimiter,
  auth,
  deliveryController.assignDriver
);
router.get(
  "/:orderId/delivery/tracking",
  apiLimiter,
  auth,
  deliveryController.getTracking
);
router.get(
  "/:orderId/delivery/update",
  apiLimiter,
  auth,
  deliveryController.updateDeliveryStatus
);

// Download invoice
router.get("/:id/invoice", apiLimiter, auth, orderController.downloadInvoice);

// Get a specific order (MUST be last to avoid catching delivery routes)
router.get("/:id", apiLimiter, auth, orderController.getOrderById);

module.exports = router;
