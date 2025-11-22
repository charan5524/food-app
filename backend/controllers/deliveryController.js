const Order = require("../models/Order");

// Fake driver names for simulation
const FAKE_DRIVERS = [
  { name: "Ravi Kumar", phone: "+91 9876543210", vehicle: "AP 09 CD 1234" },
  { name: "Suresh Reddy", phone: "+91 9876543211", vehicle: "TS 10 AB 5678" },
  { name: "Kiran Patel", phone: "+91 9876543212", vehicle: "GJ 11 XY 9012" },
  { name: "Amit Sharma", phone: "+91 9876543213", vehicle: "DL 12 MN 3456" },
  { name: "Rajesh Singh", phone: "+91 9876543214", vehicle: "UP 13 PQ 7890" },
];

// Default restaurant location (you can change this)
const RESTAURANT_LOCATION = {
  lat: 17.385, // Hyderabad coordinates (example)
  lng: 78.4867,
};

/**
 * Assign a fake driver to an order
 */
exports.assignDriver = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if driver already assigned
    if (order.delivery?.driver?.name) {
      return res.json({
        success: true,
        message: "Driver already assigned",
        delivery: order.delivery,
      });
    }

    // Randomly select a fake driver
    const randomDriver =
      FAKE_DRIVERS[Math.floor(Math.random() * FAKE_DRIVERS.length)];

    // Parse customer address to get coordinates (simplified - using default location with slight variation)
    // In real app, you'd use geocoding API
    const customerLocation = {
      lat: RESTAURANT_LOCATION.lat + (Math.random() * 0.1 - 0.05), // Random nearby location
      lng: RESTAURANT_LOCATION.lng + (Math.random() * 0.1 - 0.05),
    };

    // Calculate estimated arrival (5-10 minutes from now)
    const estimatedArrival = new Date();
    estimatedArrival.setMinutes(
      estimatedArrival.getMinutes() + 5 + Math.floor(Math.random() * 5)
    );

    // Initialize delivery tracking
    order.delivery = {
      driver: {
        name: randomDriver.name,
        phone: randomDriver.phone,
        vehicleNumber: randomDriver.vehicle,
        vehicleType: "Bike",
      },
      status: "searching",
      currentLocation: {
        lat: RESTAURANT_LOCATION.lat + 0.02, // Driver starts 2km away
        lng: RESTAURANT_LOCATION.lng + 0.02,
      },
      restaurantLocation: RESTAURANT_LOCATION,
      customerLocation: customerLocation,
      estimatedArrival: estimatedArrival,
      statusHistory: [
        {
          status: "searching",
          timestamp: new Date(),
          message: "Searching for a driver nearby...",
        },
      ],
    };

    await order.save();

    res.json({
      success: true,
      message: "Driver assigned successfully",
      delivery: order.delivery,
    });
  } catch (error) {
    console.error("Error assigning driver:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning driver",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get delivery tracking information
 */
exports.getTracking = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.delivery) {
      return res.json({
        success: true,
        delivery: null,
        message: "Delivery not started yet",
      });
    }

    res.json({
      success: true,
      delivery: order.delivery,
    });
  } catch (error) {
    console.error("Error getting tracking:", error);
    res.status(500).json({
      success: false,
      message: "Error getting tracking information",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Simulate driver movement and status updates
 * This is called periodically from frontend to update driver location
 */
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order || !order.delivery) {
      return res.status(404).json({
        success: false,
        message: "Order or delivery not found",
      });
    }

    const delivery = order.delivery;
    const now = new Date();
    const orderCreatedAt = new Date(order.createdAt);
    const secondsSinceOrder = (now - orderCreatedAt) / 1000;

    // Simulate status progression based on time
    let newStatus = delivery.status;
    let newLocation = { ...delivery.currentLocation };
    let statusMessage = "";

    // Status progression timeline (in seconds)
    if (secondsSinceOrder < 10) {
      // 0-10 seconds: Searching for driver
      if (delivery.status === "searching" || !delivery.status) {
        newStatus = "searching";
        statusMessage = "Searching for a driver nearby...";
      }
    } else if (secondsSinceOrder < 30) {
      // 10-30 seconds: Driver assigned, moving to restaurant
      if (delivery.status === "searching" || delivery.status === "assigned") {
        newStatus = "arriving_pickup";
        statusMessage = "Driver is on the way to restaurant";
        // Move driver closer to restaurant
        const progress = (secondsSinceOrder - 10) / 20; // 0 to 1
        newLocation.lat =
          delivery.restaurantLocation.lat +
          (delivery.currentLocation.lat - delivery.restaurantLocation.lat) *
            (1 - progress);
        newLocation.lng =
          delivery.restaurantLocation.lng +
          (delivery.currentLocation.lng - delivery.restaurantLocation.lng) *
            (1 - progress);
      }
    } else if (secondsSinceOrder < 45) {
      // 30-45 seconds: Reached restaurant
      if (
        delivery.status === "arriving_pickup" ||
        delivery.status === "reached_pickup"
      ) {
        newStatus = "reached_pickup";
        statusMessage = "Driver reached the restaurant";
        newLocation = { ...delivery.restaurantLocation };
      }
    } else if (secondsSinceOrder < 60) {
      // 45-60 seconds: Picked up order
      if (
        delivery.status === "reached_pickup" ||
        delivery.status === "picked_up"
      ) {
        newStatus = "picked_up";
        statusMessage = "Order picked up from restaurant";
        newLocation = { ...delivery.restaurantLocation };
      }
    } else if (secondsSinceOrder < 90) {
      // 60-90 seconds: Enroute to customer
      if (delivery.status === "picked_up" || delivery.status === "enroute") {
        newStatus = "enroute";
        statusMessage = "Driver is on the way to you";
        // Move driver from restaurant to customer
        const progress = (secondsSinceOrder - 60) / 30; // 0 to 1
        newLocation.lat =
          delivery.restaurantLocation.lat +
          (delivery.customerLocation.lat - delivery.restaurantLocation.lat) *
            progress;
        newLocation.lng =
          delivery.restaurantLocation.lng +
          (delivery.customerLocation.lng - delivery.restaurantLocation.lng) *
            progress;
      }
    } else if (secondsSinceOrder < 105) {
      // 90-105 seconds: Arriving
      if (delivery.status === "enroute" || delivery.status === "arriving") {
        newStatus = "arriving";
        statusMessage = "Driver is arriving at your location";
        newLocation = { ...delivery.customerLocation };
      }
    } else {
      // 105+ seconds: Delivered
      if (delivery.status !== "delivered") {
        newStatus = "delivered";
        statusMessage = "Order delivered successfully!";
        newLocation = { ...delivery.customerLocation };
        // Update order status to completed
        order.status = "completed";
      }
    }

    // Update delivery if status changed
    if (newStatus !== delivery.status) {
      delivery.status = newStatus;
      delivery.currentLocation = newLocation;
      delivery.statusHistory.push({
        status: newStatus,
        timestamp: now,
        message: statusMessage,
      });

      // Update order status based on delivery status
      if (newStatus === "picked_up") {
        order.status = "ready";
      } else if (newStatus === "delivered") {
        order.status = "completed";
      }

      await order.save();
    } else {
      // Just update location if status hasn't changed
      delivery.currentLocation = newLocation;
      await order.save();
    }

    res.json({
      success: true,
      delivery: order.delivery,
    });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating delivery status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
