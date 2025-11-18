const User = require("../models/User");
const Order = require("../models/Order");
const Feedback = require("../models/Feedback");

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: "user" });
    const totalOrders = await Order.countDocuments();
    
    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: today },
    });

    // Total revenue
    const revenueResult = await Order.aggregate([
      {
        $match: { status: { $in: ["processing", "completed"] } },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Pending orders
    const pendingOrders = await Order.countDocuments({ status: "pending" });

    // Delivered orders
    const deliveredOrders = await Order.countDocuments({ status: "completed" });

    // New feedback/tickets (unread)
    const newFeedback = await Feedback.countDocuments({ status: "new" });
    const totalFeedback = await Feedback.countDocuments();

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalOrders,
        todayOrders,
        totalRevenue: totalRevenue.toFixed(2),
        pendingOrders,
        deliveredOrders,
        newFeedback,
        totalFeedback,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
    });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's orders
    const orders = await Order.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      user,
      orders,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
    });
  }
};

// Block/Unblock user
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Add blocked field if it doesn't exist
    if (user.blocked === undefined) {
      user.blocked = false;
    }

    user.blocked = !user.blocked;
    await user.save();

    res.json({
      success: true,
      message: user.blocked ? "User blocked successfully" : "User unblocked successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        blocked: user.blocked,
      },
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user status",
    });
  }
};

