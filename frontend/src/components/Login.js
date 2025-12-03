import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.login(formData);

      // Backend returns { success: true, token, user }
      if (response.success && response.token) {
        // Save token and user via AuthContext
        login(response.token, response.user);

        // Show success message
        showToast("Login successful! Welcome back!", "success");

        // Redirect to home page or previous page
        setTimeout(() => {
          navigate("/");
        }, 500);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to login. Please try again.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-left">
          <div className="login-content">
            <h1>Welcome Back!</h1>
            <p>Sign in to continue to your account</p>
            <div className="login-features">
              <div className="feature-item">
                <span className="feature-icon">🍽️</span>
                <span>Order delicious food</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📦</span>
                <span>Track your orders</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⭐</span>
                <span>Exclusive offers</span>
              </div>
            </div>
          </div>
        </div>
        <div className="login-right">
          <div className="login-box">
            <div className="login-header">
              <h2>Sign In</h2>
              <p>Enter your credentials to access your account</p>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                  <Link
                    to="/forgot-password"
                    style={{
                      color: "#4f46e5",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => e.target.style.color = "#4338ca"}
                    onMouseLeave={(e) => e.target.style.color = "#4f46e5"}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="login-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>
            </form>
            <div className="divider">
              <span>or</span>
            </div>
            <button
              type="button"
              className="google-button"
              onClick={() => {
                // TODO: Implement Google OAuth
                showToast("Google login coming soon!", "info");
              }}
              disabled={isLoading}
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
            <div className="login-footer">
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="register-link">
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
