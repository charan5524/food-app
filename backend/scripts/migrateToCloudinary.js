const mongoose = require("mongoose");
const MenuItem = require("../models/Menu");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Check if Cloudinary is configured
let cloudStorage = null;
try {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    cloudStorage = require("../utils/cloudStorage");
    console.log("✅ Cloudinary configured");
  } else {
    console.error("❌ Cloudinary not configured!");
    console.error("Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file");
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Error loading Cloudinary:", error.message);
  process.exit(1);
}

const migrateImages = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI is not set in environment variables!");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all menu items with local image paths
    const menuItems = await MenuItem.find({
      image: { $regex: "^/uploads/" }
    });

    console.log(`\n📦 Found ${menuItems.length} items with local images\n`);

    if (menuItems.length === 0) {
      console.log("✅ No items to migrate!");
      await mongoose.connection.close();
      return;
    }

    let successCount = 0;
    let failCount = 0;
    let skipCount = 0;

    for (const item of menuItems) {
      if (item.image && item.image.startsWith("/uploads/")) {
        const imagePath = path.join(__dirname, "..", item.image);
        
        if (fs.existsSync(imagePath)) {
          try {
            console.log(`📤 Uploading ${item.name}...`);
            const fileBuffer = fs.readFileSync(imagePath);
            const cloudUrl = await cloudStorage.uploadToCloudinary(fileBuffer, "menu");
            
            // Update database
            item.image = cloudUrl;
            await item.save();
            
            console.log(`✅ Migrated: ${item.name}`);
            console.log(`   Old: ${item.image}`);
            console.log(`   New: ${cloudUrl}\n`);
            
            successCount++;
            
            // Optionally delete local file (uncomment to enable)
            // fs.unlinkSync(imagePath);
            // console.log(`   🗑️  Deleted local file`);
            
          } catch (error) {
            console.error(`❌ Failed to migrate ${item.name}:`, error.message);
            failCount++;
          }
        } else {
          console.warn(`⚠️  File not found for ${item.name}: ${imagePath}`);
          skipCount++;
        }
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Migration Summary:");
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   ⚠️  Skipped: ${skipCount}`);
    console.log("=".repeat(50) + "\n");

    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  migrateImages();
}

module.exports = migrateImages;

