import { useState, useEffect } from "react";
import { authService } from "../services/api";
import { STORAGE_KEYS } from "../utils/constants";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setUser(decoded);
      } catch (err) {
        console.error("Error decoding token:", err);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(credentials);
      if (response.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        const decoded = JSON.parse(atob(response.token.split(".")[1]));
        setUser(decoded);
        return { success: true };
      }
      return { success: false, message: "Invalid response from server" };
    } catch (err) {
      const message = err.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      if (response.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        const decoded = JSON.parse(atob(response.token.split(".")[1]));
        setUser(decoded);
        return { success: true };
      }
      return { success: false, message: "Invalid response from server" };
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CART);
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
  };
};

