const jwt = require("jsonwebtoken");
const User = require("../models/User");

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Extract user ID from token (handle both formats)
      const userId = decoded.user?.id || decoded.id || decoded.userId;

      // Check if user exists and is admin
      const user = await User.findById(userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      if (user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required",
        });
      }

      req.user = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      };
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};

module.exports = adminAuth;
