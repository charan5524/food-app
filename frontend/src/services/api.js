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
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
  login: async (credentials) => {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  },
};

// Order Service
export const orderService = {
  create: async (orderData) => {
    const response = await api.post("/api/orders", orderData);
    return response.data;
  },
  getAll: async () => {
    const response = await api.get("/api/orders");
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/api/orders/${id}`);
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

// Contact Service
export const contactService = {
  sendEmail: async (formData) => {
    const response = await api.post("/send-email", formData);
    return response.data;
  },
  submitFranchise: async (formData) => {
    const response = await api.post("/api/franchise-apply", formData);
    return response.data;
  },
};

export default api;

