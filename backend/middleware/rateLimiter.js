const rateLimit = require("express-rate-limit");

// General API rate limiter
exports.apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Create a memory store for auth limiter (allows reset)
const authLimiterStore = new rateLimit.MemoryStore();

// Strict rate limiter for auth endpoints
// In development, make it very lenient or disable it
const authLimiterConfig = process.env.NODE_ENV === "development" 
  ? {
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 1000, // Very high limit in development
      message: {
        success: false,
        message: "Too many login attempts, please try again after a few minutes.",
      },
      skipSuccessfulRequests: true,
      standardHeaders: true,
      legacyHeaders: false,
      store: authLimiterStore,
    }
  : {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // Strict limit in production
      message: {
        success: false,
        message: "Too many login attempts, please try again after 15 minutes.",
      },
      skipSuccessfulRequests: true,
      standardHeaders: true,
      legacyHeaders: false,
      store: authLimiterStore,
    };

exports.authLimiter = rateLimit(authLimiterConfig);

// Export store for reset functionality
exports.authLimiterStore = authLimiterStore;

// Contact form rate limiter
exports.contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 contact form submissions per hour
  message: {
    success: false,
    message: "Too many contact form submissions, please try again later.",
  },
});

