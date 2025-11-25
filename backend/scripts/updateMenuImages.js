const mongoose = require("mongoose");
require("dotenv").config();
const MenuItem = require("../models/Menu");

// Unique images for each menu item
const menuImageUpdates = {
  "Chicken Biryani":
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&h=600&fit=crop",
  "Hyderabadi Dum Biryani":
    "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
  "Veg Biryani":
    "https://images.unsplash.com/photo-1631452181339-5b604e938f70?w=800&h=600&fit=crop",
  "Butter Chicken":
    "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&h=600&fit=crop",
  "Paneer Butter Masala":
    "https://images.unsplash.com/photo-1631452180519-c014fe006bc0?w=800&h=600&fit=crop",
  "Dal Makhani":
    "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop",
  "Chicken Tikka":
    "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop",
  "Paneer Tikka":
    "https://images.unsplash.com/photo-1609501676725-7186f3a1f0f9?w=800&h=600&fit=crop",
  Samosa:
    "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop",
  "Butter Naan":
    "https://images.unsplash.com/photo-1608198093002-ad4e505484ba?w=800&h=600&fit=crop",
  "Garlic Naan":
    "https://images.unsplash.com/photo-1608198093002-ad4e505484ba?w=800&h=600&fit=crop",
  "Gulab Jamun":
    "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&h=600&fit=crop",
  Kulfi:
    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop",
  "Masala Chai":
    "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&h=600&fit=crop",
  "Sweet Lassi":
    "https://images.unsplash.com/photo-1625220194771-7ea53750b759?w=800&h=600&fit=crop",
};

const updateMenuImages = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI is not set in environment variables!");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("\n🖼️  Updating menu item images...\n");

    let updated = 0;
    let notFound = [];

    for (const [itemName, imageUrl] of Object.entries(menuImageUpdates)) {
      const menuItem = await MenuItem.findOneAndUpdate(
        { name: itemName },
        { image: imageUrl },
        { new: true }
      );

      if (menuItem) {
        console.log(`✅ Updated: ${itemName}`);
        updated++;
      } else {
        console.log(`⚠️  Not found: ${itemName}`);
        notFound.push(itemName);
      }
    }

    console.log(`\n✅ Update completed!`);
    console.log(`   - Updated: ${updated} items`);
    if (notFound.length > 0) {
      console.log(`   - Not found: ${notFound.length} items`);
    }

    // Check for duplicates
    console.log("\n🔍 Checking for duplicate images...");
    const allItems = await MenuItem.find({});
    const imageMap = {};

    allItems.forEach(item => {
      if (!imageMap[item.image]) {
        imageMap[item.image] = [];
      }
      imageMap[item.image].push(item.name);
    });

    const duplicates = Object.entries(imageMap).filter(
      ([_, names]) => names.length > 1
    );

    if (duplicates.length > 0) {
      console.log("⚠️  Found duplicate images:");
      duplicates.forEach(([image, names]) => {
        console.log(`   - Image used by: ${names.join(", ")}`);
      });
    } else {
      console.log("✅ No duplicate images found!");
    }
  } catch (error) {
    console.error("❌ Error updating menu images:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  }
};

if (require.main === module) {
  updateMenuImages();
}

module.exports = { updateMenuImages };
