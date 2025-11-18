const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get email from command line argument or use default
    const email = process.argv[2];

    if (!email) {
      console.log("❌ Please provide an email address");
      console.log("Usage: node scripts/createAdmin.js <email>");
      process.exit(1);
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      console.log("Please register first at /register or /admin/login");
      process.exit(1);
    }

    // Update user role to admin
    user.role = "admin";
    await user.save();

    console.log(`✅ User ${email} is now an admin!`);
    console.log(`You can now login at /admin/login with:`);
    console.log(`Email: ${email}`);
    console.log(`Password: (your registered password)`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

createAdmin();

