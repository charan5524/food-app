const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      id: String,
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    },
  ],
  customerDetails: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  deliveryFee: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "processing",
      "completed",
      "cancelled",
    ],
    default: "pending",
  },
  // Delivery Tracking Fields
  delivery: {
    driver: {
      name: String,
      phone: String,
      vehicleNumber: String,
      vehicleType: { type: String, default: "Bike" },
    },
    status: {
      type: String,
      enum: [
        "searching",
        "assigned",
        "arriving_pickup",
        "reached_pickup",
        "picked_up",
        "enroute",
        "arriving",
        "delivered",
      ],
      default: null,
    },
    currentLocation: {
      lat: Number,
      lng: Number,
    },
    restaurantLocation: {
      lat: Number,
      lng: Number,
    },
    customerLocation: {
      lat: Number,
      lng: Number,
    },
    estimatedArrival: Date,
    statusHistory: [
      {
        status: String,
        timestamp: Date,
        message: String,
      },
    ],
  },
  isScheduled: {
    type: Boolean,
    default: false,
  },
  scheduledDate: {
    type: Date,
    default: null,
  },
  scheduledTime: {
    type: String, // Store as "HH:MM" format
    default: null,
  },
  orderType: {
    type: String,
    enum: ["immediate", "scheduled"],
    default: "immediate",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
