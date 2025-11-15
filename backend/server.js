const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
require("dotenv").config();
const path = require("path");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your Gmail App Password
  },
});

// API to handle contact form submission
app.post("/send-email", async (req, res) => {
  const { fname, lname, email, phone, inquiryType, message } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "charank5524@gmail.com", // Replace with your email
    subject: `New Contact Form Submission from ${fname} ${lname}`,
    text: `Name: ${fname} ${lname}\nEmail: ${email}\nPhone: ${phone}\nInquiry Type: ${inquiryType}\nMessage: ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

// API to handle franchise form submission
app.post("/api/franchise-apply", async (req, res) => {
  const {
    name,
    email,
    phone,
    location,
    investmentBudget,
    experience,
    message,
  } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "charank5524@gmail.com",
    subject: `New Franchise Application from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nLocation: ${location}\nInvestment Budget: ${investmentBudget}\nExperience: ${experience}\nMessage: ${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      success: true,
      message: "Franchise application submitted successfully!",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send application email" });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.get("/", (req, res) => {
  res.send("Food App Backend is Running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
