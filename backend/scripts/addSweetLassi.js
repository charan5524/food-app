const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const MenuItem = require("../models/Menu");

const sweetLassi = {
  name: "Sweet Lassi",
  description:
    "Traditional Punjabi sweet lassi - creamy, refreshing yogurt-based drink made with homemade yogurt, whole milk, sugar, and aromatic cardamom. Topped with slivered pistachios and dried rose petals. Perfectly chilled and frothy!",
  price: 4.99,
  category: "Beverages",
  image:
    "https://images.unsplash.com/photo-1609501676725-7186f3a1f0f9?w=800&h=600&fit=crop&q=80",
  popular: true,
  available: true,
};

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI is not set in environment variables!");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const addSweetLassi = async () => {
  try {
    await connectDB();

    const existingItem = await MenuItem.findOne({ name: "Sweet Lassi" });

    if (existingItem) {
      // Update existing item
      existingItem.description = sweetLassi.description;
      existingItem.price = sweetLassi.price;
      existingItem.category = sweetLassi.category;
      existingItem.image = sweetLassi.image;
      existingItem.popular = sweetLassi.popular;
      existingItem.available = sweetLassi.available;
      await existingItem.save();
      console.log("✅ Updated Sweet Lassi in database");
    } else {
      // Create new item
      const menuItem = new MenuItem(sweetLassi);
      await menuItem.save();
      console.log("✅ Added Sweet Lassi to database");
    }

    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

addSweetLassi();

