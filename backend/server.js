const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const compression = require("compression");
require("dotenv").config();
const path = require("path");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const contactController = require("./controllers/contactController");
const paymentController = require("./controllers/paymentController");
const {
  validateContact,
  validateFranchise,
} = require("./middleware/validation");
const { contactLimiter, apiLimiter } = require("./middleware/rateLimiter");

const app = express();

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Stripe webhook (must be before body parser middleware for raw body)
app.post(
  "/api/webhooks/stripe",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// MongoDB connection check middleware (for API routes only)
app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    // Try to reconnect if disconnected
    if (mongoose.connection.readyState === 0) {
      mongoose
        .connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 5000,
        })
        .catch(() => {
          // Connection failed, continue to route handler which will handle the error
        });
    }
  }
  next();
});

// MongoDB Connection with retry logic
const connectDB = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      if (!process.env.MONGODB_URI) {
        console.error("❌ MONGODB_URI is not set in environment variables!");
        console.error(
          "\n💡 Please create a .env file in the backend folder with:"
        );
        console.error("MONGODB_URI=mongodb://localhost:27017/food-app");
        console.error("\nOr for MongoDB Atlas:");
        console.error(
          "MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food-app"
        );
        return false;
      }

      console.log(
        `🔄 Attempting to connect to MongoDB... (Attempt ${i + 1}/${retries})`
      );

      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000, // 10 seconds timeout
        socketTimeoutMS: 45000, // 45 seconds socket timeout
      });

      console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
      console.log(`📊 Database: ${conn.connection.name}`);

      // Set up connection event handlers
      mongoose.connection.on("error", err => {
        console.error("❌ MongoDB connection error:", err.message);
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
      });

      mongoose.connection.on("reconnected", () => {
        console.log("✅ MongoDB reconnected successfully");
      });

      return true;
    } catch (err) {
      console.error(
        `\n❌ MongoDB connection attempt ${i + 1} failed:`,
        err.message
      );

      if (i < retries - 1) {
        console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error("\n💡 Troubleshooting tips:");
        console.error("1. Check if MONGODB_URI in .env file is correct");
        console.error("2. Verify your MongoDB Atlas credentials");
        console.error(
          "3. Make sure your IP is whitelisted in MongoDB Atlas Network Access"
        );
        console.error("4. Check your internet connection");
        console.error(
          "\n⚠️  Server will continue but database operations will fail until MongoDB is connected."
        );
        return false;
      }
    }
  }
  return false;
};

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  const connected = await connectDB();
  if (connected) {
    console.log("✅ MongoDB connection established.");
  } else {
    console.warn(
      "⚠️  MongoDB connection failed. Server starting without database connection."
    );
  }

  // Start server after connection attempt
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
    if (mongoose.connection.readyState === 1) {
      console.log(`✅ Database: Connected`);
    } else {
      console.warn(
        `⚠️  Database: Not connected (ReadyState: ${mongoose.connection.readyState})`
      );
    }
  });
};

// Start the application
startServer();

// Contact form endpoint
app.post(
  "/send-email",
  contactLimiter,
  validateContact,
  contactController.sendContactEmail
);

// Franchise application endpoint
app.post(
  "/api/franchise-apply",
  contactLimiter,
  validateFranchise,
  contactController.sendFranchiseApplication
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

// Public menu routes (no authentication required)
const menuController = require("./controllers/menuController");
const categoryController = require("./controllers/categoryController");
const promoController = require("./controllers/promoController");
app.get("/api/menu", menuController.getPublicMenuItems);
app.get("/api/menu/:id", menuController.getMenuItemById);
app.get("/api/categories", categoryController.getPublicCategories);
app.get(
  "/api/promo-codes/active",
  apiLimiter,
  promoController.getActivePromoCodes
);

// Admin routes
const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

// Customer feedback routes (for customers to view their own tickets)
const feedbackController = require("./controllers/feedbackController");
const auth = require("./middleware/auth");
app.get(
  "/api/feedback/my-tickets",
  apiLimiter,
  auth,
  feedbackController.getMyFeedback
);

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Development: Reset rate limit endpoint
if (process.env.NODE_ENV === "development") {
  const { authLimiterStore } = require("./middleware/rateLimiter");
  app.post("/api/auth/reset-rate-limit", (req, res) => {
    try {
      // Clear all rate limit entries
      if (authLimiterStore && typeof authLimiterStore.resetAll === "function") {
        authLimiterStore.resetAll();
      } else {
        // Fallback: manually clear the store
        authLimiterStore.resetKey = () => {};
      }
      res.json({
        success: true,
        message:
          "Rate limit reset successfully. Please restart your server to fully clear the limit.",
      });
    } catch (error) {
      console.error("Error resetting rate limit:", error);
      res.json({
        success: true,
        message: "Please restart your server to clear the rate limit.",
      });
    }
  });

  // Also allow GET for easy browser access
  app.get("/api/auth/reset-rate-limit", (req, res) => {
    res.json({
      success: true,
      message:
        "To reset rate limit, restart your backend server or wait 1 minute in development mode.",
    });
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: Object.values(err.errors).map(e => e.message),
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry. This record already exists.",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

app.get("/", (req, res) => {
  res.send("Food App Backend is Running!");
});
