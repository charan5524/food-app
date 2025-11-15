const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const nodemailer = require("nodemailer");

// Create a new order
router.post("/", auth, async (req, res) => {
  try {
    console.log("Received order request:", req.body);
    console.log("User ID from auth:", req.user.id);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const order = new Order({
      userId: req.user.id,
      items: req.body.items,
      customerDetails: req.body.customerDetails,
      subtotal: req.body.subtotal,
      deliveryFee: req.body.deliveryFee,
      total: req.body.total,
      status: "pending",
    });

    console.log("Creating order:", order);

    const savedOrder = await order.save();
    console.log("Order saved successfully:", savedOrder);

    res.status(201).json({ orderId: savedOrder._id });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      message: "Error creating order",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Get all orders for a user
router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Get a specific order
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Error fetching order" });
  }
});

// Send order confirmation email
router.post("/send-order-confirmation", async (req, res) => {
  try {
    const { email, orderId, orderDetails } = req.body;

    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Create email content
    const itemsList = orderDetails.items
      .map(
        (item) =>
          `${item.name} x ${item.quantity} - ₹${item.price * item.quantity}`
      )
      .join("\n");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Order Confirmation - Order #${orderId}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Your order has been successfully placed.</p>
        <h2>Order Details:</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
        <h3>Items:</h3>
        <pre>${itemsList}</pre>
        <p><strong>Subtotal:</strong> ₹${orderDetails.subtotal}</p>
        <p><strong>Delivery Fee:</strong> ₹${orderDetails.deliveryFee}</p>
        <p><strong>Total:</strong> ₹${orderDetails.total}</p>
        <h3>Delivery Address:</h3>
        <p>
          ${orderDetails.customerDetails.name}<br>
          ${orderDetails.customerDetails.address}<br>
          ${orderDetails.customerDetails.city}, ${
        orderDetails.customerDetails.state
      } ${orderDetails.customerDetails.zipCode}
        </p>
        <p>We'll notify you when your order is ready for delivery.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Order confirmation email sent successfully" });
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    res.status(500).json({ message: "Error sending order confirmation email" });
  }
});

module.exports = router;
