const DeliveryPartner = require("../models/DeliveryPartner");
const Order = require("../models/Order");

// Get all delivery partners
exports.getAllDeliveryPartners = async (req, res) => {
  try {
    const partners = await DeliveryPartner.find().sort({ createdAt: -1 });
    
    // Count active orders for each partner
    const partnersWithOrderCount = await Promise.all(
      partners.map(async (partner) => {
        const activeOrders = await Order.countDocuments({
          deliveryPartnerId: partner._id,
          status: { $in: ["ready", "processing"] },
        });
        
        return {
          ...partner.toObject(),
          activeOrders,
        };
      })
    );

    res.json({
      success: true,
      data: partnersWithOrderCount,
    });
  } catch (error) {
    console.error("Error fetching delivery partners:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching delivery partners",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get free delivery partners
exports.getFreeDeliveryPartners = async (req, res) => {
  try {
    const freePartners = await DeliveryPartner.find({ status: "free" }).sort({ name: 1 });
    
    res.json({
      success: true,
      data: freePartners,
    });
  } catch (error) {
    console.error("Error fetching free delivery partners:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching free delivery partners",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Create a new delivery partner
exports.createDeliveryPartner = async (req, res) => {
  try {
    const { name, phone, vehicleType, vehicleNumber } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    const partner = new DeliveryPartner({
      name,
      phone,
      vehicleType: vehicleType || "Bike",
      vehicleNumber: vehicleNumber || "",
      status: "free",
    });

    await partner.save();

    res.status(201).json({
      success: true,
      message: "Delivery partner added successfully",
      data: partner,
    });
  } catch (error) {
    console.error("Error creating delivery partner:", error);
    res.status(500).json({
      success: false,
      message: "Error creating delivery partner",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update delivery partner status
exports.updateDeliveryPartnerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["free", "busy", "offline"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'free', 'busy', or 'offline'",
      });
    }

    const partner = await DeliveryPartner.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found",
      });
    }

    res.json({
      success: true,
      message: "Delivery partner status updated",
      data: partner,
    });
  } catch (error) {
    console.error("Error updating delivery partner status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating delivery partner status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Assign delivery partner to order
exports.assignDeliveryPartner = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryPartnerId } = req.body;

    if (!deliveryPartnerId) {
      return res.status(400).json({
        success: false,
        message: "Delivery partner ID is required",
      });
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if delivery partner exists
    const partner = await DeliveryPartner.findById(deliveryPartnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found",
      });
    }

    // Update order with delivery partner
    order.deliveryPartnerId = deliveryPartnerId;
    
    // If order is ready, set status to processing
    if (order.status === "ready") {
      order.status = "processing";
    }
    
    await order.save();

    // Update partner status to busy if they were free
    if (partner.status === "free") {
      partner.status = "busy";
      await partner.save();
    }

    // Populate delivery partner details
    await order.populate("deliveryPartnerId");

    res.json({
      success: true,
      message: "Delivery partner assigned successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error assigning delivery partner:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning delivery partner",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete delivery partner
exports.deleteDeliveryPartner = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if partner has active orders
    const activeOrders = await Order.countDocuments({
      deliveryPartnerId: id,
      status: { $in: ["ready", "processing"] },
    });

    if (activeOrders > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete delivery partner. They have ${activeOrders} active order(s).`,
      });
    }

    const partner = await DeliveryPartner.findByIdAndDelete(id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery partner not found",
      });
    }

    res.json({
      success: true,
      message: "Delivery partner deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting delivery partner:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting delivery partner",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

