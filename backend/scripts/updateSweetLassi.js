const mongoose = require("mongoose");
require("dotenv").config();

// Import model
const MenuItem = require("../models/Menu");

// Connect to MongoDB
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

// Update Sweet Lassi
const updateSweetLassi = async () => {
  try {
    console.log("\n🍹 Updating Sweet Lassi...");
    
    const updatedItem = await MenuItem.findOneAndUpdate(
      { name: "Sweet Lassi" },
      {
        description: "Creamy sweet yogurt drink topped with chopped pistachios and dried rose petals, garnished with aromatic cardamom",
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (updatedItem) {
      console.log("✅ Sweet Lassi updated successfully!");
      console.log(`   Name: ${updatedItem.name}`);
      console.log(`   Description: ${updatedItem.description}`);
      console.log(`   Price: $${updatedItem.price}`);
      console.log(`   Category: ${updatedItem.category}`);
    } else {
      console.log("⚠️  Sweet Lassi not found in database");
    }

    return true;
  } catch (error) {
    console.error("❌ Error updating Sweet Lassi:", error);
    return false;
  }
};

// Main function
const runUpdate = async () => {
  try {
    console.log("🚀 Starting Sweet Lassi update...\n");
    
    await connectDB();
    const success = await updateSweetLassi();
    
    if (success) {
      console.log("\n✅ Update completed successfully!");
    } else {
      console.log("\n⚠️  Update completed with errors");
    }
    
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error during update:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the update script
if (require.main === module) {
  runUpdate();
}

module.exports = { updateSweetLassi };

