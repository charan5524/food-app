const mongoose = require("mongoose");

const deliveryPartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  vehicleType: {
    type: String,
    enum: ["Bike", "Scooter", "Car", "Auto", "Cycle"],
    default: "Bike",
  },
  vehicleNumber: {
    type: String,
    trim: true,
    default: "",
  },
  status: {
    type: String,
    enum: ["free", "busy", "offline"],
    default: "free",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const DeliveryPartner = mongoose.model("DeliveryPartner", deliveryPartnerSchema);

module.exports = DeliveryPartner;

