const Order = require("../models/Order");
const PDFDocument = require("pdfkit");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Validate scheduled order if provided
    const isScheduled = req.body.isScheduled || false;
    let scheduledDate = null;
    let scheduledTime = null;
    let orderType = "immediate";

    if (isScheduled) {
      if (!req.body.scheduledDate || !req.body.scheduledTime) {
        return res.status(400).json({
          success: false,
          message: "Scheduled date and time are required for scheduled orders",
        });
      }

      // Parse scheduled date and time
      scheduledDate = new Date(req.body.scheduledDate);
      scheduledTime = req.body.scheduledTime;

      // Validate date is not in the past
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const scheduledDateOnly = new Date(scheduledDate);
      scheduledDateOnly.setHours(0, 0, 0, 0);

      if (scheduledDateOnly < now) {
        return res.status(400).json({
          success: false,
          message: "Scheduled date cannot be in the past",
        });
      }

      // Validate date is not more than 30 days in the future
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 30);
      if (scheduledDateOnly > maxDate) {
        return res.status(400).json({
          success: false,
          message: "Scheduled date cannot be more than 30 days in the future",
        });
      }

      // If scheduled for today, validate time is in the future
      if (scheduledDateOnly.getTime() === now.getTime()) {
        const [hours, minutes] = scheduledTime.split(":").map(Number);
        const scheduledDateTime = new Date(scheduledDate);
        scheduledDateTime.setHours(hours, minutes, 0, 0);

        if (scheduledDateTime < new Date()) {
          return res.status(400).json({
            success: false,
            message: "Scheduled time cannot be in the past",
          });
        }
      }

      orderType = "scheduled";
    }

    const order = new Order({
      userId: req.user.id,
      items: req.body.items,
      customerDetails: req.body.customerDetails,
      subtotal: req.body.subtotal,
      deliveryFee: req.body.deliveryFee,
      total: req.body.total,
      status: "pending",
      isScheduled: isScheduled,
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime,
      orderType: orderType,
    });

    const savedOrder = await order.save();

    // Create notification for admin
    try {
      const Notification = require("../models/Notification");
      const orderTypeText = isScheduled ? "Scheduled Order" : "New Order";
      const scheduledInfo = isScheduled 
        ? ` (Scheduled: ${scheduledDate.toLocaleDateString()} at ${scheduledTime})`
        : "";
      const notification = new Notification({
        type: "new_order",
        title: `${orderTypeText} Received`,
        message: `${orderTypeText} #${savedOrder._id.toString().slice(-6)} for ₹${savedOrder.total.toFixed(2)}${scheduledInfo}`,
        link: `/admin/dashboard?section=orders&id=${savedOrder._id}`,
      });
      await notification.save();
    } catch (notifError) {
      console.error("Error creating order notification:", notifError);
      // Don't fail order creation if notification fails
    }

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

    const scheduledInfo = orderDetails.isScheduled && orderDetails.scheduledDate
      ? `<p><strong>Scheduled Date:</strong> ${new Date(orderDetails.scheduledDate).toLocaleDateString()}</p>
         <p><strong>Scheduled Time:</strong> ${orderDetails.scheduledTime}</p>`
      : "";

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${orderDetails.isScheduled ? "Scheduled " : ""}Order Confirmation - Order #${orderId}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Your ${orderDetails.isScheduled ? "scheduled " : ""}order has been successfully placed.</p>
        <h2>Order Details:</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
        ${scheduledInfo}
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
        <p>${orderDetails.isScheduled ? "We'll prepare your order for the scheduled date and time." : "We'll notify you when your order is ready for delivery."}</p>
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

// Download invoice as PDF
exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const doc = new PDFDocument({ margin: 50 });
    const filename = `invoice-${order._id.toString().slice(-6)}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    doc.pipe(res);

    const primaryColor = "#ff6b6b";
    const accentColor = "#ffe3e3";

    const writeHeader = () => {
      const headerHeight = 60;
      doc
        .rect(0, 0, doc.page.width, headerHeight)
        .fill(primaryColor)
        .fillColor("white")
        .fontSize(26)
        .text("Food App", 50, 20, { align: "left" })
        .fontSize(14)
        .text("Invoice", { align: "right", continued: false, width: doc.page.width - 100 })
        .moveDown();
      doc.moveDown();
      doc.fillColor("black");
    };

    const writeCustomerInfo = () => {
      doc.fontSize(12);
      doc.text(`Invoice #: ${order._id}`);
      doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);
      doc.moveDown();
      doc.text("Billed To:");
      doc.text(order.customerDetails?.name || "N/A");
      if (order.customerDetails?.address) {
        doc.text(order.customerDetails.address);
      }
      const locationLine = [
        order.customerDetails?.city,
        order.customerDetails?.state,
        order.customerDetails?.zipCode,
      ]
        .filter(Boolean)
        .join(", ");
      if (locationLine) {
        doc.text(locationLine);
      }
      if (order.customerDetails?.phone) {
        doc.text(`Phone: ${order.customerDetails.phone}`);
      }
      if (order.customerDetails?.email) {
        doc.text(`Email: ${order.customerDetails.email}`);
      }
      doc.moveDown();
    };

    const writeItemsTable = () => {
      doc
        .fontSize(12)
        .fillColor(primaryColor)
        .text("Order Items", { underline: true })
        .fillColor("black")
        .moveDown(0.5);

      const tableTop = doc.y;
      const itemX = 50;
      const qtyX = 300;
      const priceX = 360;
      const totalX = 450;

      doc.font("Helvetica-Bold").fillColor(primaryColor);
      doc.text("Item", itemX, tableTop);
      doc.text("Qty", qtyX, tableTop);
      doc.text("Price", priceX, tableTop, { width: 80, align: "right" });
      doc.text("Total", totalX, tableTop, { width: 80, align: "right" });

      doc.font("Helvetica").fillColor("black");

      order.items.forEach((item, index) => {
        const y = tableTop + 20 + index * 20;
        if (index % 2 === 0) {
          doc
            .rect(45, y - 4, doc.page.width - 90, 18)
            .fill(accentColor)
            .fillColor("black");
        }
        doc.text(item.name, itemX, y);
        doc.text(String(item.quantity), qtyX, y);
        doc.text(`₹${(item.price || 0).toFixed(2)}`, priceX, y, {
          width: 80,
          align: "right",
        });
        const lineTotal = (item.price || 0) * (item.quantity || 0);
        doc.text(`₹${lineTotal.toFixed(2)}`, totalX, y, {
          width: 80,
          align: "right",
        });
      });

      doc.moveDown(2);
    };

    const writeTotals = () => {
      const summaryX = 320;
      doc
        .font("Helvetica-Bold")
        .fillColor(primaryColor)
        .text("Summary", summaryX, doc.y);
      doc.moveDown(0.5);
      doc.font("Helvetica").fillColor("black");
      doc.text(
        `Subtotal: ₹${(order.subtotal || 0).toFixed(2)}`,
        summaryX,
        doc.y
      );
      doc.text(
        `Delivery Fee: ₹${(order.deliveryFee || 0).toFixed(2)}`,
        summaryX,
        doc.y
      );
      doc.text(
        `Total Paid: ₹${(order.total || 0).toFixed(2)}`,
        summaryX,
        doc.y
      );
      if (order.isScheduled && order.scheduledDate) {
        doc.text(
          `Scheduled For: ${new Date(order.scheduledDate).toLocaleDateString()} ${
            order.scheduledTime || ""
          }`,
          summaryX,
          doc.y
        );
      }
      doc.moveDown();
    };

    writeHeader();
    writeCustomerInfo();
    writeItemsTable();
    writeTotals();

    doc
      .moveDown()
      .fontSize(10)
      .fillColor(primaryColor)
      .text(
        "Thank you for your order!",
        { align: "center" }
      )
      .fillColor("black")
      .text(
        "If you have questions about this invoice, contact support@foodapp.com.",
        { align: "center" }
      );

    doc.end();
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({
      success: false,
      message: "Error generating invoice",
    });
  }
};

