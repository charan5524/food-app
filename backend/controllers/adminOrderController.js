const Order = require("../models/Order");
const User = require("../models/User");
const DeliveryPartner = require("../models/DeliveryPartner");
const nodemailer = require("nodemailer");
const { assignNextDriver } = require("../utils/deliveryAssignment");

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("userId", "name email")
      .populate(
        "deliveryPartnerId",
        "name phone vehicleType vehicleNumber status"
      )
      .sort({ createdAt: -1 });

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

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email phone")
      .populate(
        "deliveryPartnerId",
        "name phone vehicleType vehicleNumber status"
      );

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

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "processing",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const previousStatus = order.status;
    order.status = status;

    // Automatically assign driver when order becomes "ready" and no driver is assigned yet
    let assignedDriver = null;
    if (status === "ready" && !order.deliveryPartnerId) {
      assignedDriver = await assignNextDriver(order);
      if (assignedDriver) {
        // Change status to processing when driver is assigned
        order.status = "processing";
        // Reload order to get populated delivery partner
        await order.populate(
          "deliveryPartnerId",
          "name phone vehicleType vehicleNumber status"
        );
      }
    }

    // If order is completed or cancelled, free up the delivery partner
    if (
      (status === "completed" || status === "cancelled") &&
      order.deliveryPartnerId
    ) {
      // Populate delivery partner if not already populated
      if (typeof order.deliveryPartnerId === 'string' || order.deliveryPartnerId._id) {
        const partnerId = order.deliveryPartnerId._id || order.deliveryPartnerId;
        const partner = await DeliveryPartner.findById(partnerId);
        
        if (partner) {
          // Check if partner has other active orders (not completed or cancelled)
          const activeOrders = await Order.countDocuments({
            deliveryPartnerId: partner._id,
            status: { $nin: ["completed", "cancelled"] },
            _id: { $ne: order._id },
          });

          // Only mark as free if no other active orders
          if (activeOrders === 0) {
            partner.status = "free";
            await partner.save();
            console.log(`✅ Freed up delivery partner: ${partner.name} (Order ${order._id} ${status})`);
          } else {
            console.log(`ℹ️  Delivery partner ${partner.name} still has ${activeOrders} active order(s)`);
          }
        }
      }
    }

    await order.save();

    let emailNotification = null;

    if (status === "completed") {
      const customerEmail = order.customerDetails?.email || order.userId?.email;
      if (!customerEmail) {
        emailNotification = {
          sent: false,
          message:
            "Order completed, but no customer email was available for notification.",
        };
      } else if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        emailNotification = {
          sent: false,
          message: "Order completed, but email credentials are not configured.",
        };
      } else {
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          const itemsList = order.items
            .map(
              item =>
                `${item.name} x ${item.quantity} - ₹${(
                  item.price * item.quantity
                ).toFixed(2)}`
            )
            .join("<br>");

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: customerEmail,
            subject: `Your Order #${order._id
              .toString()
              .slice(-6)} is Completed`,
            html: `
              <h2>Hi ${
                order.customerDetails?.name || order.userId?.name || "there"
              },</h2>
              <p>Great news! Your order has been completed and is on its way.</p>
              <h3>Order Summary</h3>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Total Paid:</strong> ₹${order.total.toFixed(2)}</p>
              <h4>Items</h4>
              <p>${itemsList}</p>
              <p>If you have any questions, feel free to reply to this email.</p>
              <p>Thank you for choosing us!</p>
            `,
          };

          await transporter.sendMail(mailOptions);
          emailNotification = {
            sent: true,
            message: `Completion email sent to ${customerEmail}.`,
          };
        } catch (emailError) {
          console.error("Error sending order completion email:", emailError);
          emailNotification = {
            sent: false,
            message:
              "Order completed, but we could not send the completion email.",
          };
        }
      }
    }

    // Reload order with populated delivery partner if it was assigned
    if (assignedDriver || order.deliveryPartnerId) {
      await order.populate(
        "deliveryPartnerId",
        "name phone vehicleType vehicleNumber status"
      );
    }

    res.json({
      success: true,
      message: assignedDriver
        ? `Order status updated and driver ${assignedDriver.name} automatically assigned`
        : "Order status updated successfully",
      order,
      emailNotification,
      driverAssigned: assignedDriver
        ? {
            name: assignedDriver.name,
            phone: assignedDriver.phone,
            vehicleType: assignedDriver.vehicleType,
            vehicleNumber: assignedDriver.vehicleNumber,
          }
        : null,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
    });
  }
};
