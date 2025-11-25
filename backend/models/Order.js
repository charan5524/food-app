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
  discount: {
    type: Number,
    default: 0,
  },
  promoCode: {
    type: String,
    default: null,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "received",
      "confirmed",
      "preparing",
      "almost_ready",
      "ready",
      "processing",
      "completed",
      "cancelled",
    ],
    default: "pending",
  },
  statusTimestamps: {
    received: Date,
    preparing: Date,
    almostReady: Date,
    deliveryPartnerAssigned: Date,
    enroute: Date,
    delivered: Date,
  },
  deliveryPartnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeliveryPartner",
    default: null,
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
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  paymentIntentId: {
    type: String,
    default: null,
  },
  paymentMethod: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
