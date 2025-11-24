const DeliveryPartner = require("../models/DeliveryPartner");
const Order = require("../models/Order");

// Helper function to automatically assign next driver in round-robin sequence
const assignNextDriver = async order => {
  try {
    // Get all free delivery partners, sorted by creation date for consistent ordering
    const freePartners = await DeliveryPartner.find({
      status: { $in: ["free", "busy"] }, // Include busy ones too, but prefer free
    }).sort({ createdAt: 1 });

    if (freePartners.length === 0) {
      console.log("No delivery partners available for automatic assignment");
      return null;
    }

    // Find the last assigned partner from recent orders (any status, to track sequence)
    const recentOrders = await Order.find({
      deliveryPartnerId: { $ne: null },
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .select("deliveryPartnerId");

    let lastAssignedPartnerId = null;
    if (recentOrders.length > 0) {
      // Find the most recent order with a different partner (to get the last one used)
      for (const recentOrder of recentOrders) {
        if (recentOrder.deliveryPartnerId) {
          lastAssignedPartnerId = recentOrder.deliveryPartnerId.toString();
          break;
        }
      }
    }

    // Separate free and busy partners
    const freePartnersList = freePartners.filter(p => p.status === "free");
    const busyPartnersList = freePartners.filter(p => p.status === "busy");

    // Prefer free partners, but use busy ones if no free partners available
    const availablePartners =
      freePartnersList.length > 0 ? freePartnersList : busyPartnersList;

    if (availablePartners.length === 0) {
      console.log("No available delivery partners");
      return null;
    }

    // Find the index of the last assigned partner
    let nextPartnerIndex = 0;
    if (lastAssignedPartnerId) {
      const lastIndex = availablePartners.findIndex(
        p => p._id.toString() === lastAssignedPartnerId
      );

      if (lastIndex !== -1) {
        // Get next partner in sequence
        nextPartnerIndex = (lastIndex + 1) % availablePartners.length;
      }
    }

    const nextPartner = availablePartners[nextPartnerIndex];

    // Assign the partner to the order
    order.deliveryPartnerId = nextPartner._id;

    // Update partner status to busy if they were free
    if (nextPartner.status === "free") {
      nextPartner.status = "busy";
      await nextPartner.save();
    }

    await order.save();

    // Populate the partner details before returning
    await order.populate(
      "deliveryPartnerId",
      "name phone vehicleType vehicleNumber status"
    );

    console.log(
      `✅ Automatically assigned driver: ${nextPartner.name} (${nextPartner.vehicleType}) to order ${order._id}`
    );

    return nextPartner;
  } catch (error) {
    console.error("Error in automatic driver assignment:", error);
    return null;
  }
};

module.exports = { assignNextDriver };
