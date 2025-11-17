// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
  },
  ORDERS: {
    BASE: "/api/orders",
    CONFIRMATION: "/api/orders/send-order-confirmation",
  },
  CONTACT: {
    EMAIL: "/send-email",
    FRANCHISE: "/api/franchise-apply",
  },
};

// Order Status
export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  CART: "cart",
  USER: "user",
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: {
    required: true,
    email: true,
  },
  PASSWORD: {
    required: true,
    minLength: 6,
  },
  NAME: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  PHONE: {
    required: true,
    phone: true,
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized. Please login.",
  NOT_FOUND: "Resource not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: "Login successful!",
  REGISTER: "Registration successful!",
  ORDER_CREATED: "Order placed successfully!",
  EMAIL_SENT: "Email sent successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
};

