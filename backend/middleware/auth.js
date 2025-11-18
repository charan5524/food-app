const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Handle both token formats: { user: { email } } or { email }
      req.user = decoded.user || decoded;
      console.log("User authenticated:", req.user.email || req.user);
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Server error in authentication" });
  }
};

module.exports = auth;
