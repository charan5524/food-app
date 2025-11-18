const Order = require("../models/Order");
const User = require("../models/User");
const MenuItem = require("../models/Menu");

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    // Daily revenue for last 7 days
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          status: { $in: ["completed", "processing"] },
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Weekly orders for last 4 weeks
    const weeklyOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-W%V", date: "$createdAt" },
          },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 4 },
    ]);

    // Most ordered dishes
    const popularDishes = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    // Active users (users who placed orders in last 30 days)
    const activeUsers = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: "$userId",
        },
      },
      {
        $count: "activeUsers",
      },
    ]);

    const activeUsersCount = activeUsers[0]?.activeUsers || 0;

    res.json({
      success: true,
      analytics: {
        dailyRevenue,
        weeklyOrders,
        popularDishes,
        activeUsers: activeUsersCount,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics",
    });
  }
};

