const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ["Breakfast", "Lunch", "Dinner", "Drinks", "Desserts", "Biryani", "Rice Dishes", "Curries", "Appetizers", "Vegetable Dishes", "Non-Veg Dry Items", "Breads"],
  },
  image: {
    type: String,
    default: "",
  },
  available: {
    type: Boolean,
    default: true,
  },
  popular: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
menuItemSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("MenuItem", menuItemSchema);

