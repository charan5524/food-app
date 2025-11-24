const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const crypto = require("crypto");
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

// Helper function to send password reset email
const sendPasswordResetEmail = async (name, email, resetToken) => {
  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      secure: true,
      tls: {
        rejectUnauthorized: false,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

    const mailOptions = {
      from: `"Food App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 20px;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
            }
            .container {
              background: #ffffff;
              border-radius: 16px;
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 50px 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 700;
            }
            .content {
              padding: 40px 35px;
              background: #ffffff;
            }
            .greeting {
              font-size: 18px;
              color: #1a1a1a;
              margin-bottom: 20px;
            }
            .message {
              color: #4b5563;
              font-size: 16px;
              margin-bottom: 30px;
              line-height: 1.6;
            }
            .button-container {
              text-align: center;
              margin: 30px 0;
            }
            .reset-button {
              display: inline-block;
              padding: 16px 40px;
              background: #ff6b35;
              color: white;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 4px 16px rgba(255, 107, 53, 0.4);
              transition: all 0.3s ease;
            }
            .reset-button:hover {
              background: #e55a2b;
              box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5);
              transform: translateY(-2px);
            }
            .alternative-link {
              margin-top: 20px;
              padding: 20px;
              background: #f9fafb;
              border-radius: 8px;
              font-size: 14px;
              color: #6b7280;
              word-break: break-all;
            }
            .footer {
              padding: 30px;
              text-align: center;
              background: #f9fafb;
              color: #6b7280;
              font-size: 14px;
            }
            .warning {
              margin-top: 20px;
              padding: 15px;
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              border-radius: 4px;
              color: #92400e;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="header">
                <h1>🔒 Password Reset</h1>
              </div>
              <div class="content">
                <div class="greeting">Hello ${name},</div>
                <div class="message">
                  We received a request to reset your password. Click the button below to create a new password:
                </div>
                <div class="button-container">
                  <a href="${resetUrl}" class="reset-button">Reset Password</a>
                </div>
                <div class="alternative-link">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  ${resetUrl}
                </div>
                <div class="warning">
                  <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
                </div>
              </div>
              <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} Food App. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return { success: false, message: error.message };
  }
};

// Forgot password - request password reset
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide your email address",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Always return success message (security best practice - don't reveal if email exists)
    if (!user) {
      return res.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Set token and expiration (1 hour from now)
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(user.name, user.email, resetToken);

    if (!emailResult.success) {
      // Clear the token if email failed
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again later.",
      });
    }

    res.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Reset password - verify token and update password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both token and new password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash the token to compare with stored hash
    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token and non-expired token
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset token",
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({
      success: true,
      message: "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
