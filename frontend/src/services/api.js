import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: async credentials => {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  },
  register: async userData => {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  },
};

// Order Service
export const orderService = {
  create: async orderData => {
    const response = await api.post("/api/orders", orderData);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get("/api/orders");
    return response.data;
  },
  getById: async id => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },
  downloadInvoice: async id => {
    const response = await api.get(`/api/orders/${id}/invoice`, {
      responseType: "blob",
    });
    return response.data;
  },
  sendConfirmation: async (email, orderId, orderDetails) => {
    const response = await api.post("/api/orders/send-order-confirmation", {
      email,
      orderId,
      orderDetails,
    });
    return response.data;
  },
};

// Delivery Tracking Service
export const deliveryService = {
  assignDriver: async orderId => {
    const response = await api.post(`/api/orders/${orderId}/delivery/assign`);
    return response.data;
  },
  getTracking: async orderId => {
    const response = await api.get(`/api/orders/${orderId}/delivery/tracking`);
    return response.data;
  },
  updateStatus: async orderId => {
    const response = await api.get(`/api/orders/${orderId}/delivery/update`);
    return response.data;
  },
};

// Contact Service
export const contactService = {
  sendEmail: async formData => {
    const response = await api.post("/send-email", formData);
    return response.data;
  },
  submitFranchise: async formData => {
    const response = await api.post("/api/franchise-apply", formData);
    return response.data;
  },
};

// Simple cache for menu data (5 minutes TTL)
const menuCache = {
  items: null,
  categories: null,
  timestamp: null,
  ttl: 5 * 60 * 1000, // 5 minutes in milliseconds
};

const isCacheValid = () => {
  if (!menuCache.timestamp) return false;
  return Date.now() - menuCache.timestamp < menuCache.ttl;
};

// Menu Service (Public - no authentication required)
export const menuService = {
  getAllMenuItems: async (useCache = true) => {
    // Return cached data if valid
    if (useCache && isCacheValid() && menuCache.items) {
      return menuCache.items;
    }

    const response = await api.get("/api/menu");

    // Update cache
    if (useCache) {
      menuCache.items = response.data;
      menuCache.timestamp = Date.now();
    }

    return response.data;
  },
  getMenuItemById: async id => {
    const response = await api.get(`/api/menu/${id}`);
    return response.data;
  },
  getAllCategories: async (useCache = true) => {
    // Return cached data if valid
    if (useCache && isCacheValid() && menuCache.categories) {
      return menuCache.categories;
    }

    const response = await api.get("/api/categories");

    // Update cache
    if (useCache) {
      menuCache.categories = response.data;
      menuCache.timestamp = Date.now();
    }

    return response.data;
  },
  // Clear cache (useful after admin updates)
  clearCache: () => {
    menuCache.items = null;
    menuCache.categories = null;
    menuCache.timestamp = null;
  },
};

// Admin Service
export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get("/api/admin/dashboard/stats");
    return response.data;
  },

  // Users
  getAllUsers: async () => {
    const response = await api.get("/api/admin/users");
    return response.data;
  },
  getUserById: async id => {
    const response = await api.get(`/api/admin/users/${id}`);
    return response.data;
  },
  toggleUserStatus: async id => {
    const response = await api.patch(`/api/admin/users/${id}/toggle-status`);
    return response.data;
  },

  // Menu
  getAllMenuItems: async () => {
    const response = await api.get("/api/admin/menu");
    return response.data;
  },
  getMenuItemById: async id => {
    const response = await api.get(`/api/admin/menu/${id}`);
    return response.data;
  },
  createMenuItem: async formData => {
    const response = await api.post("/api/admin/menu", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateMenuItem: async (id, formData) => {
    const response = await api.put(`/api/admin/menu/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  deleteMenuItem: async id => {
    const response = await api.delete(`/api/admin/menu/${id}`);
    return response.data;
  },

  // Orders
  getAllOrders: async status => {
    const url = status
      ? `/api/admin/orders?status=${status}`
      : "/api/admin/orders";
    const response = await api.get(url);
    return response.data;
  },
  getOrderById: async id => {
    const response = await api.get(`/api/admin/orders/${id}`);
    return response.data;
  },
  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/api/admin/orders/${id}/status`, {
      status,
    });
    return response.data;
  },

  // Analytics
  getAnalytics: async () => {
    const response = await api.get("/api/admin/analytics");
    return response.data;
  },

  // Categories
  getAllCategories: async () => {
    const response = await api.get("/api/admin/categories");
    return response.data;
  },
  createCategory: async categoryData => {
    const response = await api.post("/api/admin/categories", categoryData);
    return response.data;
  },
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/api/admin/categories/${id}`, categoryData);
    return response.data;
  },
  deleteCategory: async id => {
    const response = await api.delete(`/api/admin/categories/${id}`);
    return response.data;
  },

  // Promo Codes
  getAllPromoCodes: async () => {
    const response = await api.get("/api/admin/promo-codes");
    return response.data;
  },
  createPromoCode: async promoData => {
    const response = await api.post("/api/admin/promo-codes", promoData);
    return response.data;
  },
  updatePromoCode: async (id, promoData) => {
    const response = await api.put(`/api/admin/promo-codes/${id}`, promoData);
    return response.data;
  },
  deletePromoCode: async id => {
    const response = await api.delete(`/api/admin/promo-codes/${id}`);
    return response.data;
  },

  // Feedback
  getAllFeedback: async status => {
    const url = status
      ? `/api/admin/feedback?status=${status}`
      : "/api/admin/feedback";
    const response = await api.get(url);
    return response.data;
  },
  getFeedbackById: async id => {
    const response = await api.get(`/api/admin/feedback/${id}`);
    return response.data;
  },
  updateFeedbackStatus: async (id, status) => {
    const response = await api.patch(`/api/admin/feedback/${id}/status`, {
      status,
    });
    return response.data;
  },
  replyToFeedback: async (id, message) => {
    const response = await api.post(`/api/admin/feedback/${id}/reply`, {
      message,
    });
    return response.data;
  },
  deleteFeedback: async id => {
    const response = await api.delete(`/api/admin/feedback/${id}`);
    return response.data;
  },

  // Notifications
  getAllNotifications: async unread => {
    const url = unread
      ? `/api/admin/notifications?unread=true`
      : "/api/admin/notifications";
    const response = await api.get(url);
    return response.data;
  },
};

// Customer feedback service
export const feedbackService = {
  getMyTickets: async () => {
    const response = await api.get("/api/feedback/my-tickets");
    return response.data;
  },
};

export default api;
