const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const MenuItem = require("../models/Menu");
const Category = require("../models/Category");

// Menu data from frontend/src/data/menuData.js
const menuCategories = [
  { name: "Biryani", icon: "🍛" },
  { name: "Rice Dishes", icon: "🍚" },
  { name: "Curries", icon: "🍲" },
  { name: "Appetizers", icon: "🥟" },
  { name: "Vegetable Dishes", icon: "🥬" },
  { name: "Non-Veg Dry Items", icon: "🍗" },
  { name: "Breads", icon: "🍞" },
  { name: "Desserts", icon: "🍰" },
  { name: "Beverages", icon: "🥤" },
];

const menuItems = [
  // Biryani Section
  {
    name: "Chicken Biryani",
    description:
      "Classic chicken biryani with tender chicken pieces and aromatic spices",
    price: 16.99,
    category: "Biryani",
    image:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&h=600&fit=crop",
    popular: true,
    available: true,
  },
  {
    name: "Hyderabadi Dum Biryani",
    description:
      "Traditional Hyderabadi style biryani cooked in dum style with meat",
    price: 18.99,
    category: "Biryani",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop",
    popular: true,
    available: true,
  },
  {
    name: "Veg Biryani",
    description:
      "Aromatic basmati rice cooked with mixed vegetables and special spices",
    price: 14.99,
    category: "Biryani",
    image:
      "https://images.unsplash.com/photo-1631452181339-5b604e938f70?w=800&h=600&fit=crop",
    popular: true,
    available: true,
  },
  // Curries
  {
    name: "Butter Chicken",
    description: "Tender chicken in rich tomato and butter gravy",
    price: 14.99,
    category: "Curries",
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&h=600&fit=crop",
    popular: true,
    available: true,
  },
  {
    name: "Paneer Butter Masala",
    description: "Cottage cheese in rich tomato and butter gravy",
    price: 12.99,
    category: "Curries",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe006bc0?w=800&h=600&fit=crop",
    popular: true,
    available: true,
  },
  {
    name: "Dal Makhani",
    description: "Black lentils cooked overnight with butter and cream",
    price: 10.99,
    category: "Curries",
    image:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&h=600&fit=crop",
    popular: true,
    available: true,
  },
  // Appetizers
  {
    name: "Chicken Tikka",
    description: "Tender chicken pieces marinated in spices and grilled",
    price: 10.99,
    category: "Appetizers",
    image:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop",
    popular: true,
    available: true,
  },
  {
    name: "Paneer Tikka",
    description: "Grilled cottage cheese with spices and vegetables",
    price: 8.99,
    category: "Appetizers",
    image:
      "https://images.unsplash.com/photo-1609501676725-7186f3a1f0f9?w=800&h=600&fit=crop",
    popular: true,
    available: true,
  },
  {
    name: "Samosa",
    description: "Crispy pastry filled with spiced potatoes and peas",
    price: 4.99,
    category: "Appetizers",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop",
    popular: true,
    available: true,
  },
  // Breads
  {
    name: "Butter Naan",
    description: "Soft bread brushed with butter",
    price: 3.99,
    category: "Breads",
    image:
      "https://images.unsplash.com/photo-1608198093002-ad4e505484ba?w=800&h=600&fit=crop",
    popular: true,
    available: true,
  },
  {
    name: "Garlic Naan",
    description: "Naan topped with garlic and butter",
    price: 4.99,
    category: "Breads",
    image:
      "https://images.unsplash.com/photo-1609501676725-7186f3a1f0f9?w=800&h=600&fit=crop",
    popular: true,
    available: true,
  },
  // Desserts
  {
    name: "Gulab Jamun",
    description: "Sweet milk-solid balls in sugar syrup",
    price: 5.99,
    category: "Desserts",
    image:
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&h=600&fit=crop",
    popular: true,
    available: true,
  },
  {
    name: "Kulfi",
    description: "Traditional Indian ice cream",
    price: 4.99,
    category: "Desserts",
    image:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop",
    popular: true,
    available: true,
  },
  // Beverages
  {
    name: "Masala Chai",
    description: "Traditional spiced Indian tea",
    price: 2.99,
    category: "Beverages",
    image:
      "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&h=600&fit=crop",
    popular: true,
    available: true,
  },
  {
    name: "Sweet Lassi",
    description:
      "Traditional Punjabi sweet lassi - creamy, refreshing yogurt-based drink made with homemade yogurt, whole milk, sugar, and aromatic cardamom. Topped with slivered pistachios and dried rose petals. Perfectly chilled and frothy!",
    price: 4.99,
    category: "Beverages",
    image:
      "https://images.unsplash.com/photo-1609501676725-7186f3a1f0f9?w=800&h=600&fit=crop&q=80",
    popular: true,
    available: true,
  },
];

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

// Seed categories
const seedCategories = async () => {
  try {
    console.log("\n📁 Seeding categories...");
    let created = 0;
    let updated = 0;

    for (const categoryData of menuCategories) {
      const existingCategory = await Category.findOne({
        name: categoryData.name,
      });

      if (existingCategory) {
        // Update existing category
        existingCategory.icon = categoryData.icon;
        await existingCategory.save();
        updated++;
        console.log(`  ✓ Updated category: ${categoryData.name}`);
      } else {
        // Create new category
        const category = new Category(categoryData);
        await category.save();
        created++;
        console.log(`  ✓ Created category: ${categoryData.name}`);
      }
    }

    console.log(`\n✅ Categories: ${created} created, ${updated} updated`);
    return true;
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    return false;
  }
};

// Seed menu items
const seedMenuItems = async () => {
  try {
    console.log("\n🍽️  Seeding menu items...");
    let created = 0;
    let updated = 0;

    for (const itemData of menuItems) {
      const existingItem = await MenuItem.findOne({ name: itemData.name });

      if (existingItem) {
        // Update existing item
        existingItem.description = itemData.description;
        existingItem.price = itemData.price;
        existingItem.category = itemData.category;
        existingItem.image = itemData.image;
        existingItem.popular = itemData.popular;
        existingItem.available = itemData.available;
        await existingItem.save();
        updated++;
        console.log(`  ✓ Updated: ${itemData.name}`);
      } else {
        // Create new item
        const menuItem = new MenuItem(itemData);
        await menuItem.save();
        created++;
        console.log(`  ✓ Created: ${itemData.name}`);
      }
    }

    console.log(`\n✅ Menu Items: ${created} created, ${updated} updated`);
    return true;
  } catch (error) {
    console.error("❌ Error seeding menu items:", error);
    return false;
  }
};

// Main function
const seedDatabase = async () => {
  try {
    console.log("🚀 Starting database seeding...\n");

    await connectDB();

    const categoriesSuccess = await seedCategories();
    const menuItemsSuccess = await seedMenuItems();

    if (categoriesSuccess && menuItemsSuccess) {
      console.log("\n✅ Database seeding completed successfully!");
      console.log("\n📊 Summary:");
      console.log(`   - Categories: ${menuCategories.length} processed`);
      console.log(`   - Menu Items: ${menuItems.length} processed`);
    } else {
      console.log("\n⚠️  Database seeding completed with errors");
    }

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error during seeding:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seeding script
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, seedCategories, seedMenuItems };
