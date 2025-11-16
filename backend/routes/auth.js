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

module.exports = router;
