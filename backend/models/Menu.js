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
    enum: ["Breakfast", "Lunch", "Dinner", "Drinks", "Beverages", "Desserts", "Biryani", "Rice Dishes", "Curries", "Appetizers", "Vegetable Dishes", "Non-Veg Dry Items", "Breads"],
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

// Add indexes for better query performance
menuItemSchema.index({ available: 1, popular: -1, name: 1 }); // For public menu queries
menuItemSchema.index({ category: 1, available: 1 }); // For category filtering
menuItemSchema.index({ createdAt: -1 }); // For admin listing

module.exports = mongoose.model("MenuItem", menuItemSchema);

