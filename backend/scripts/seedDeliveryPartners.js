const mongoose = require("mongoose");
require("dotenv").config();
const DeliveryPartner = require("../models/DeliveryPartner");

const deliveryPartners = [
  {
    name: "Pranathi",
    phone: "+91 9876543210",
    vehicleType: "Bike",
    vehicleNumber: "",
    status: "free",
  },
  {
    name: "Vignesh",
    phone: "+91 9876543211",
    vehicleType: "Bike",
    vehicleNumber: "",
    status: "free",
  },
  {
    name: "Vokram",
    phone: "+91 9876543212",
    vehicleType: "Bike",
    vehicleNumber: "",
    status: "free",
  },
  {
    name: "Charan",
    phone: "+91 9876543213",
    vehicleType: "Bike",
    vehicleNumber: "",
    status: "free",
  },
  {
    name: "Koushik",
    phone: "+91 9876543214",
    vehicleType: "Bike",
    vehicleNumber: "",
    status: "free",
  },
  {
    name: "Sushma",
    phone: "+91 9876543215",
    vehicleType: "Bike",
    vehicleNumber: "",
    status: "free",
  },
  {
    name: "Harshith",
    phone: "+91 9876543216",
    vehicleType: "Bike",
    vehicleNumber: "",
    status: "free",
  },
  {
    name: "Sandeep",
    phone: "+91 9876543217",
    vehicleType: "Bike",
    vehicleNumber: "",
    status: "free",
  },
  {
    name: "Kavya",
    phone: "+91 9876543218",
    vehicleType: "Bike",
    vehicleNumber: "",
    status: "free",
  },
  {
    name: "Mouni",
    phone: "+91 9876543219",
    vehicleType: "Bike",
    vehicleNumber: "",
    status: "free",
  },
  {
    name: "Yamin",
    phone: "+91 9876543220",
    vehicleType: "Bike",
    vehicleNumber: "",
    status: "free",
  },
  {
    name: "Riaz",
    phone: "+91 9876543221",
    vehicleType: "Bike",
    vehicleNumber: "",
    status: "free",
  },
  {
    name: "Russel",
    phone: "+91 9876543222",
    vehicleType: "Bike",
    vehicleNumber: "",
    status: "free",
  },
  {
    name: "Akshaara",
    phone: "+91 9876543223",
    vehicleType: "Bike",
    vehicleNumber: "",
    status: "free",
  },
];

const seedDeliveryPartners = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ Connected to MongoDB");

    // Clear existing delivery partners (optional - comment out if you want to keep existing)
    // await DeliveryPartner.deleteMany({});
    // console.log("🗑️  Cleared existing delivery partners");

    // Check which partners already exist
    const existingPartners = await DeliveryPartner.find({
      name: { $in: deliveryPartners.map((p) => p.name) },
    });

    const existingNames = existingPartners.map((p) => p.name);
    console.log(`📋 Existing partners: ${existingNames.join(", ") || "None"}`);

    // Add new partners
    let addedCount = 0;
    let skippedCount = 0;

    for (const partnerData of deliveryPartners) {
      const existing = await DeliveryPartner.findOne({ name: partnerData.name });
      
      if (existing) {
        console.log(`⏭️  Skipped: ${partnerData.name} (already exists)`);
        skippedCount++;
      } else {
        const partner = new DeliveryPartner(partnerData);
        await partner.save();
        console.log(`✅ Added: ${partnerData.name} (${partnerData.phone})`);
        addedCount++;
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   ✅ Added: ${addedCount} partners`);
    console.log(`   ⏭️  Skipped: ${skippedCount} partners (already exist)`);
    console.log(`   📦 Total partners in database: ${await DeliveryPartner.countDocuments()}`);

    // List all partners
    const allPartners = await DeliveryPartner.find().sort({ createdAt: 1 });
    console.log("\n📋 All Delivery Partners:");
    allPartners.forEach((partner, index) => {
      console.log(
        `   ${index + 1}. ${partner.name} - ${partner.phone} (${partner.vehicleType}) - ${partner.status}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding delivery partners:", error);
    process.exit(1);
  }
};

// Run the seed function
seedDeliveryPartners();

