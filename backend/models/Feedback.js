const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: "",
  },
  inquiryType: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["new", "read", "replied", "resolved"],
    default: "new",
  },
  adminReply: {
    message: {
      type: String,
      default: "",
    },
    repliedAt: {
      type: Date,
    },
    repliedBy: {
      type: String,
      default: "",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Feedback", feedbackSchema);

