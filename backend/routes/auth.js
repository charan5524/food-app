const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { validateRegister, validateLogin } = require("../middleware/validation");
const { authLimiter } = require("../middleware/rateLimiter");

// Register a new user
router.post(
  "/register",
  authLimiter,
  validateRegister,
  authController.register
);

// Login user
router.post("/login", authLimiter, validateLogin, authController.login);

// Register admin (special endpoint - requires admin secret)
router.post("/register-admin", authLimiter, authController.registerAdmin);

// Forgot password - request password reset
router.post("/forgot-password", authLimiter, authController.forgotPassword);

// Reset password - verify token and update password
router.post("/reset-password", authLimiter, authController.resetPassword);

module.exports = router;
