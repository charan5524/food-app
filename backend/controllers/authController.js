const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { sendWelcomeEmail } = require("./contactController");

// Register a new user
exports.register = async (req, res) => {
  console.log("=== Registration Request Received ===");
  console.log("Request body:", { name: req.body?.name, email: req.body?.email, password: req.body?.password ? "***" : undefined });
  
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, email, password)",
      });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server configuration error: JWT_SECRET is not set. Please check your .env file.",
      });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      const readyStateMessages = {
        0: "disconnected",
        2: "connecting",
        3: "disconnecting",
      };
      const state = readyStateMessages[mongoose.connection.readyState] || `unknown (${mongoose.connection.readyState})`;
      
      console.error("MongoDB is not connected. ReadyState:", mongoose.connection.readyState, `(${state})`);
      
      if (!process.env.MONGODB_URI) {
        return res.status(503).json({
          success: false,
          message: "Database configuration error: MONGODB_URI is not set. Please check your .env file.",
        });
      }
      
      // Try to reconnect if disconnected
      if (mongoose.connection.readyState === 0) {
        console.log("Attempting to reconnect to MongoDB...");
        try {
          await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
          });
          console.log("✅ Reconnected to MongoDB");
        } catch (reconnectError) {
          console.error("❌ Reconnection failed:", reconnectError.message);
          return res.status(503).json({
            success: false,
            message: "Database connection error. The server is attempting to reconnect. Please try again in a few moments.",
            details: process.env.NODE_ENV === "development" ? reconnectError.message : undefined,
          });
        }
      } else {
        return res.status(503).json({
          success: false,
          message: "Database connection error. The database is currently connecting. Please try again in a few moments.",
        });
      }
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
    });

    // Hash password (handled by pre-save hook in User model)
    try {
      await user.save();
      
      // Create notification for admin (only for regular users, not admins)
      if (user.role === "user") {
        try {
          const Notification = require("../models/Notification");
          const notification = new Notification({
            type: "new_user",
            title: "New User Registered",
            message: `${user.name} (${user.email}) just registered`,
            link: `/admin/dashboard?section=users&id=${user._id}`,
          });
          await notification.save();
        } catch (notifError) {
          console.error("Error creating user notification:", notifError);
          // Don't fail registration if notification fails
        }
      }
    } catch (saveError) {
      console.error("Error saving user:", saveError);
      // If it's a validation error from the model, handle it
      if (saveError.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          error: saveError.message,
          details: saveError.errors ? Object.keys(saveError.errors).map(key => ({
            field: key,
            message: saveError.errors[key].message
          })) : undefined,
        });
      }
      // Re-throw to be caught by outer catch
      throw saveError;
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };

    // Use promise-based JWT signing
    console.log("Creating JWT token...");
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
    console.log("JWT token created successfully");

    // Send welcome email (non-blocking - don't fail registration if email fails)
    console.log(`📧 Attempting to send welcome email to ${user.email}...`);
    sendWelcomeEmail(user.name, user.email)
      .then((result) => {
        if (result.success) {
          console.log(`✅ Welcome email sent successfully to ${user.email}`);
        } else {
          console.warn(`⚠️  Failed to send welcome email to ${user.email}:`, result.message);
          console.warn(`   This is non-critical - registration was successful`);
        }
      })
      .catch((emailError) => {
        console.error(`❌ Error sending welcome email to ${user.email}:`, emailError.message);
        console.error(`   Error details:`, emailError);
        // Don't throw - registration should succeed even if email fails
      });

    console.log("Sending success response...");
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("=== Registration Error ===");
    console.error("Error:", error);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    // Check if response has already been sent
    if (res.headersSent) {
      console.error("Response already sent, cannot send error response");
      return;
    }
    
    // Handle specific error types
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
        details: error.errors ? Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        })) : undefined,
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }
    
    // Mongoose connection errors
    if (error.name === "MongoServerError" || error.name === "MongooseError") {
      return res.status(503).json({
        success: false,
        message: "Database connection error. Please try again later.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
    
    // JWT errors
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(500).json({
        success: false,
        message: "Error generating authentication token",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      errorType: error.name || "Unknown",
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };

    // Use promise-based JWT signing
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// Register admin (special endpoint - use with caution)
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    // Check for admin secret (set this in your .env file)
    const requiredSecret = process.env.ADMIN_REGISTRATION_SECRET || "admin-secret-2024";
    
    if (adminSecret !== requiredSecret) {
      return res.status(403).json({
        success: false,
        message: "Invalid admin registration secret",
      });
    }

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, email, password)",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create new admin user
    user = new User({
      name,
      email,
      password,
      role: "admin",
    });

    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during admin registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
