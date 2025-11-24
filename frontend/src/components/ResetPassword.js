import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { authService } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Check if token is provided
  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

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
    setSuccess(false);

    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.resetPassword(token, formData.password);

      if (response.success) {
        setSuccess(true);
        showToast(response.message || "Password reset successfully!", "success");
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        throw new Error(response.message || "Failed to reset password");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to reset password. The link may have expired. Please request a new one.";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-container">
        <div className="login-wrapper">
          <div className="login-right" style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}>
            <div className="login-box">
              <div className="login-header">
                <h2>✅ Password Reset Successful!</h2>
                <p>Your password has been reset successfully. Redirecting to login...</p>
              </div>
              <div style={{
                backgroundColor: "#d1fae5",
                color: "#065f46",
                padding: "12px 16px",
                marginBottom: "24px",
                borderRadius: "12px",
                border: "1px solid #a7f3d0",
                textAlign: "center",
                fontSize: "0.875rem",
                fontWeight: "500",
              }}>
                You can now login with your new password.
              </div>
              <div className="login-footer">
                <Link to="/login" className="register-link">
                  Go to Login →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-left">
          <div className="login-content">
            <h1>Reset Password</h1>
            <p>Enter your new password below</p>
            <div className="login-features">
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Secure password reset</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">✅</span>
                <span>One-time use link</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Quick and easy</span>
              </div>
            </div>
          </div>
        </div>
        <div className="login-right">
          <div className="login-box">
            <div className="login-header">
              <h2>Set New Password</h2>
              <p>Please enter your new password below</p>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter new password (min. 6 characters)"
                    disabled={isLoading}
                    autoComplete="new-password"
                    minLength={6}
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
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    autoComplete="new-password"
                    minLength={6}
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
                disabled={isLoading || !token}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Resetting Password...
                  </>
                ) : (
                  <>
                    Reset Password
                    <span className="button-arrow">→</span>
                  </>
                )}
              </button>
            </form>
            <div className="login-footer">
              <p>
                Remember your password?{" "}
                <Link to="/login" className="register-link">
                  Back to Login
                </Link>
              </p>
              <p style={{ marginTop: "12px" }}>
                Need a new reset link?{" "}
                <Link to="/forgot-password" className="register-link">
                  Request Another
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

