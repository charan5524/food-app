import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Backend returns { success: true, token, user }
      if (response.success && response.token) {
        // Save token and user via AuthContext
        login(response.token, response.user);

        // Show success message
        showToast("Registration successful! Welcome!", "success");

        // Redirect to home page
        setTimeout(() => {
          navigate("/");
        }, 500);
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to register. Please try again.";
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
            <h1>Join Us Today!</h1>
            <p>Create your account and start ordering delicious food</p>
            <div className="login-features">
              <div className="feature-item">
                <span className="feature-icon">🎁</span>
                <span>Welcome bonus on first order</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🚀</span>
                <span>Fast and easy checkout</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💳</span>
                <span>Save payment methods</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📱</span>
                <span>Order from anywhere</span>
              </div>
            </div>
          </div>
        </div>
        <div className="login-right">
          <div className="login-box">
            <div className="login-header">
              <h2>Create Account</h2>
              <p>Fill in your details to get started</p>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>
              </div>
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
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create a password (min. 6 characters)"
                    disabled={isLoading}
                    minLength="6"
                    autoComplete="new-password"
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
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    minLength="6"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
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
                showToast("Google registration coming soon!", "info");
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
                Already have an account?{" "}
                <Link to="/login" className="register-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
