import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Decode JWT token to get user info
  const decodeToken = (token) => {
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      // Backend returns { user: { id, name, email, role } }
      const userData = decoded.user || decoded;
      // Also check localStorage for role if not in token
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.role) userData.role = parsed.role;
        } catch (e) {}
      }
      return userData;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedUser = decodeToken(token);
      if (decodedUser) {
        setUser(decodedUser);
      } else {
        // Invalid token, remove it
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // Listen for storage changes (for logout from other tabs)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        if (e.newValue) {
          const decodedUser = decodeToken(e.newValue);
          setUser(decodedUser);
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      // Merge role into decoded token data
      const decodedUser = decodeToken(token);
      if (userData.role) decodedUser.role = userData.role;
      setUser(decodedUser);
    } else {
      const decodedUser = decodeToken(token);
      setUser(decodedUser);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    setUser(null);
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent("authLogout"));
  };

  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      // Check if token is expired (if it has exp field)
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

