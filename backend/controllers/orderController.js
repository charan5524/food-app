const Order = require("../models/Order");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
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

    const savedOrder = await order.save();

    res.status(201).json({
      success: true,
      orderId: savedOrder._id,
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all orders for a user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("-__v");

    res.json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
    });
  }
};

// Get a specific order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).select("-__v");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
    });
  }
};

// Send order confirmation email
exports.sendOrderConfirmation = async (req, res) => {
  try {
    const { email, orderId, orderDetails } = req.body;
    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

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
          ${orderDetails.customerDetails.city}, ${orderDetails.customerDetails.state} ${orderDetails.customerDetails.zipCode}
        </p>
        <p>We'll notify you when your order is ready for delivery.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({
      success: true,
      message: "Order confirmation email sent successfully",
    });
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    res.status(500).json({
      success: false,
      message: "Error sending order confirmation email",
    });
  }
};

