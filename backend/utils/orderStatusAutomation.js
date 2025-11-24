const Order = require("../models/Order");
const DeliveryPartner = require("../models/DeliveryPartner");

// Store active timers for orders
const activeTimers = new Map();

/**
 * Start automated order status flow for a new order
 * @param {String} orderId - MongoDB order ID
 */
const startOrderStatusAutomation = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`Order ${orderId} not found for automation`);
      return;
    }

    // Skip automation for scheduled orders (they'll be processed later)
    if (order.isScheduled && order.orderType === "scheduled") {
      console.log(`Skipping automation for scheduled order ${orderId}`);
      return;
    }

    // Clear any existing timers for this order
    clearOrderTimers(orderId);

    console.log(`🚀 Starting automated status flow for order ${orderId}`);

    // 1. Order Received (Immediate)
    await updateOrderStatus(orderId, "received", {
      message: "Order received and confirmed",
    });

    // 2. Preparing (After 30 seconds = 30000ms)
    const preparingTimer = setTimeout(async () => {
      await updateOrderStatus(orderId, "preparing", {
        message: "Your order is being prepared",
      });
    }, 30 * 1000); // 30 seconds

    // 3. Almost Ready (After 40 seconds = 40000ms)
    const almostReadyTimer = setTimeout(async () => {
      await updateOrderStatus(orderId, "almost_ready", {
        message: "Your order is almost ready",
      });
    }, 40 * 1000); // 40 seconds

    // 4. Delivery Partner Assigned (After 50 seconds = 50000ms)
    const partnerAssignedTimer = setTimeout(async () => {
      await assignDeliveryPartnerAndUpdateStatus(orderId);
    }, 50 * 1000); // 50 seconds

    // Store timers
    activeTimers.set(orderId, {
      preparing: preparingTimer,
      almostReady: almostReadyTimer,
      partnerAssigned: partnerAssignedTimer,
    });

    console.log(`✅ Automation timers set for order ${orderId}`);
  } catch (error) {
    console.error(`Error starting order automation for ${orderId}:`, error);
  }
};

/**
 * Update order status and add timestamp
 */
const updateOrderStatus = async (orderId, status, options = {}) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`Order ${orderId} not found`);
      return;
    }

    // Don't update if order is cancelled or already completed
    if (order.status === "cancelled" || order.status === "completed") {
      console.log(`Skipping status update for ${orderId} - order is ${order.status}`);
      return;
    }

    order.status = status;
    const timestampField = getTimestampField(status);
    if (timestampField) {
      order.statusTimestamps = order.statusTimestamps || {};
      order.statusTimestamps[timestampField] = new Date();
    }

    await order.save();

    console.log(`✅ Order ${orderId} status updated to: ${status}`);

    // Add to status history if delivery object exists
    if (order.delivery && order.delivery.statusHistory) {
      order.delivery.statusHistory.push({
        status: status,
        timestamp: new Date(),
        message: options.message || `Order status changed to ${status}`,
      });
      await order.save();
    }
  } catch (error) {
    console.error(`Error updating order status for ${orderId}:`, error);
  }
};

/**
 * Assign delivery partner and update delivery status
 */
const assignDeliveryPartnerAndUpdateStatus = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate(
      "deliveryPartnerId",
      "name phone vehicleType vehicleNumber"
    );

    if (!order) {
      console.error(`Order ${orderId} not found`);
      return;
    }

    // If partner already assigned, use it; otherwise assign one
    if (!order.deliveryPartnerId) {
      const { assignNextDriver } = require("./deliveryAssignment");
      const partner = await assignNextDriver(order);
      if (!partner) {
        console.log(`No delivery partner available for order ${orderId}`);
        return;
      }
      // Reload order to get populated partner
      await order.populate(
        "deliveryPartnerId",
        "name phone vehicleType vehicleNumber"
      );
    } else {
      console.log(
        `Order ${orderId} already has delivery partner assigned: ${order.deliveryPartnerId.name}`
      );
    }

    // Update delivery status to assigned
    if (order.deliveryPartnerId) {
      order.delivery = order.delivery || {};
      order.delivery.status = "assigned";
      order.delivery.driver = {
        name: order.deliveryPartnerId.name,
        phone: order.deliveryPartnerId.phone,
        vehicleNumber: order.deliveryPartnerId.vehicleNumber,
        vehicleType: order.deliveryPartnerId.vehicleType || "Bike",
      };

      // Initialize locations (using default restaurant location)
      // In production, these would come from actual coordinates
      order.delivery.restaurantLocation = {
        lat: 28.7041, // Default restaurant location (Delhi)
        lng: 77.1025,
      };

      // Generate customer location (slightly offset for simulation)
      order.delivery.customerLocation = {
        lat: 28.7041 + (Math.random() - 0.5) * 0.1, // Random nearby location
        lng: 77.1025 + (Math.random() - 0.5) * 0.1,
      };

      // Set initial driver location at restaurant
      order.delivery.currentLocation = {
        lat: order.delivery.restaurantLocation.lat,
        lng: order.delivery.restaurantLocation.lng,
      };

      // Add status history
      order.delivery.statusHistory = order.delivery.statusHistory || [];
      order.delivery.statusHistory.push({
        status: "assigned",
        timestamp: new Date(),
        message: `Delivery partner ${order.deliveryPartnerId.name} assigned`,
      });

      // Update status timestamp
      order.statusTimestamps = order.statusTimestamps || {};
      order.statusTimestamps.deliveryPartnerAssigned = new Date();

      await order.save();

      console.log(
        `✅ Delivery partner ${order.deliveryPartnerId.name} assigned to order ${orderId}`
      );

      // Start delivery tracking simulation
      startDeliveryTracking(orderId);
    }
  } catch (error) {
    console.error(`Error assigning delivery partner for ${orderId}:`, error);
  }
};

/**
 * Start delivery tracking simulation
 */
const startDeliveryTracking = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order || !order.delivery) {
      return;
    }

    // Wait 40 seconds before starting enroute status (total 90 seconds from order start)
    // Partner assigned at 50s, enroute at 90s = 40s wait
    setTimeout(async () => {
      await updateDeliveryStatus(orderId, "enroute", {
        message: "Driver is on the way to your location",
      });

      // Start location simulation
      simulateDeliveryLocation(orderId);
    }, 40 * 1000); // 40 seconds (90 seconds total from order start)
  } catch (error) {
    console.error(`Error starting delivery tracking for ${orderId}:`, error);
  }
};

/**
 * Simulate driver location updates during delivery
 */
const simulateDeliveryLocation = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order || !order.delivery || !order.delivery.customerLocation) {
      return;
    }

    const restaurant = order.delivery.restaurantLocation;
    const customer = order.delivery.customerLocation;
    const steps = 20; // Number of location updates
    const interval = 3000; // Update every 3 seconds
    let currentStep = 0;

    const locationUpdateInterval = setInterval(async () => {
      try {
        const updatedOrder = await Order.findById(orderId);
        if (
          !updatedOrder ||
          updatedOrder.status === "cancelled" ||
          updatedOrder.status === "completed"
        ) {
          clearInterval(locationUpdateInterval);
          return;
        }

        currentStep++;

        // Calculate progress (0 to 1)
        const progress = currentStep / steps;

        // Interpolate between restaurant and customer location
        const currentLat =
          restaurant.lat + (customer.lat - restaurant.lat) * progress;
        const currentLng =
          restaurant.lng + (customer.lng - restaurant.lng) * progress;

        // Add small random variation for realism
        const variation = 0.001;
        updatedOrder.delivery.currentLocation = {
          lat: currentLat + (Math.random() - 0.5) * variation,
          lng: currentLng + (Math.random() - 0.5) * variation,
        };

        // Calculate estimated arrival time (decreasing as we get closer)
        const remainingSteps = steps - currentStep;
        const estimatedSeconds = remainingSteps * (interval / 1000);
        updatedOrder.delivery.estimatedArrival = new Date(
          Date.now() + estimatedSeconds * 1000
        );

        await updatedOrder.save();

        // When we reach the destination, mark as delivered
        if (currentStep >= steps) {
          clearInterval(locationUpdateInterval);
          await completeDelivery(orderId);
        }
      } catch (error) {
        console.error(`Error updating location for order ${orderId}:`, error);
        clearInterval(locationUpdateInterval);
      }
    }, interval);
  } catch (error) {
    console.error(`Error simulating delivery location for ${orderId}:`, error);
  }
};

/**
 * Update delivery status
 */
const updateDeliveryStatus = async (orderId, status, options = {}) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return;
    }

    order.delivery = order.delivery || {};
    order.delivery.status = status;

    // Update status timestamps
    if (status === "enroute") {
      order.statusTimestamps = order.statusTimestamps || {};
      order.statusTimestamps.enroute = new Date();
    }

    // Add to status history
    order.delivery.statusHistory = order.delivery.statusHistory || [];
    order.delivery.statusHistory.push({
      status: status,
      timestamp: new Date(),
      message: options.message || `Delivery status: ${status}`,
    });

    await order.save();
    console.log(`✅ Order ${orderId} delivery status: ${status}`);
  } catch (error) {
    console.error(`Error updating delivery status for ${orderId}:`, error);
  }
};

/**
 * Complete delivery and update order status
 */
const completeDelivery = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate("deliveryPartnerId");
    if (!order) {
      return;
    }

    // Update delivery status
    await updateDeliveryStatus(orderId, "delivered", {
      message: "Order has been delivered successfully",
    });

    // Update order status to completed
    order.status = "completed";
    order.statusTimestamps = order.statusTimestamps || {};
    order.statusTimestamps.delivered = new Date();

    // Set final location to customer location
    if (order.delivery && order.delivery.customerLocation) {
      order.delivery.currentLocation = {
        lat: order.delivery.customerLocation.lat,
        lng: order.delivery.customerLocation.lng,
      };
    }

    // Free up delivery partner
    if (order.deliveryPartnerId) {
      order.deliveryPartnerId.status = "free";
      await order.deliveryPartnerId.save();
    }

    await order.save();

    console.log(`✅ Order ${orderId} delivered successfully`);

    // Clear timers
    clearOrderTimers(orderId);
  } catch (error) {
    console.error(`Error completing delivery for ${orderId}:`, error);
  }
};

/**
 * Get timestamp field name for status
 */
const getTimestampField = (status) => {
  const mapping = {
    received: "received",
    preparing: "preparing",
    almost_ready: "almostReady",
    enroute: "enroute",
    delivered: "delivered",
  };
  return mapping[status];
};

/**
 * Clear all timers for an order
 */
const clearOrderTimers = (orderId) => {
  const timers = activeTimers.get(orderId);
  if (timers) {
    if (timers.preparing) clearTimeout(timers.preparing);
    if (timers.almostReady) clearTimeout(timers.almostReady);
    if (timers.partnerAssigned) clearTimeout(timers.partnerAssigned);
    activeTimers.delete(orderId);
  }
};

/**
 * Cancel automation for an order (e.g., when order is cancelled)
 */
const cancelOrderAutomation = async (orderId) => {
  clearOrderTimers(orderId);
  console.log(`🛑 Automation cancelled for order ${orderId}`);
};

module.exports = {
  startOrderStatusAutomation,
  updateOrderStatus,
  cancelOrderAutomation,
  clearOrderTimers,
};

