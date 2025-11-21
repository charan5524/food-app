const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const auth = require("../middleware/auth");
const { validateOrder } = require("../middleware/validation");
const { apiLimiter } = require("../middleware/rateLimiter");

// Create a new order
router.post(
  "/",
  apiLimiter,
  auth,
  validateOrder,
  orderController.createOrder
);

// Get all orders for a user
router.get("/", apiLimiter, auth, orderController.getUserOrders);

// Download invoice
router.get(
  "/:id/invoice",
  apiLimiter,
  auth,
  orderController.downloadInvoice
);

// Get a specific order
router.get("/:id", apiLimiter, auth, orderController.getOrderById);

// Send order confirmation email
router.post(
  "/send-order-confirmation",
  apiLimiter,
  orderController.sendOrderConfirmation
);

module.exports = router;
