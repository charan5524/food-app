const { body, validationResult } = require("express-validator");

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Registration validation
exports.validateRegister = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  handleValidationErrors,
];

// Login validation
exports.validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  handleValidationErrors,
];

// Order validation
exports.validateOrder = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must contain at least one item"),
  body("items.*.id")
    .notEmpty()
    .withMessage("Item ID is required"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("customerDetails.name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name is required"),
  body("customerDetails.email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("customerDetails.phone")
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage("Valid phone number is required"),
  body("customerDetails.address")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Address is required"),
  body("subtotal")
    .isFloat({ min: 0 })
    .withMessage("Subtotal must be a valid number"),
  body("total")
    .isFloat({ min: 0 })
    .withMessage("Total must be a valid number"),
  handleValidationErrors,
];

// Contact form validation
exports.validateContact = [
  body("fname")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name is required"),
  body("lname")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name is required"),
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("phone")
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage("Valid phone number is required"),
  body("message")
    .trim()
    .isLength({ min: 10 })
    .withMessage("Message must be at least 10 characters"),
  handleValidationErrors,
];

// Franchise form validation
exports.validateFranchise = [
  body("name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name is required"),
  body("email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("phone")
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage("Valid phone number is required"),
  body("location")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Location is required"),
  handleValidationErrors,
];

