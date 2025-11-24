import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(email);

      if (response.success) {
        setSuccess(true);
        showToast(response.message || "Password reset link sent to your email", "success");
      } else {
        throw new Error(response.message || "Failed to send password reset email");
      }
    } catch (error) {
      let errorMessage = "Failed to send password reset email. Please try again.";
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || errorMessage;
        
        // Handle 404 specifically
        if (error.response.status === 404) {
          errorMessage = "Password reset service is not available. Please contact support or try again later.";
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "Unable to connect to server. Please check your connection and try again.";
      } else {
        // Error setting up the request
        errorMessage = error.message || errorMessage;
      }
      
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
            <h1>Forgot Password?</h1>
            <p>No worries! Enter your email and we'll send you a reset link</p>
            <div className="login-features">
              <div className="feature-item">
                <span className="feature-icon">📧</span>
                <span>Check your email</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Secure reset process</span>
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
              <h2>Reset Password</h2>
              <p>Enter your email address to receive a password reset link</p>
            </div>
            {error && <div className="error-message">{error}</div>}
            {success && (
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
                ✅ {success ? "If an account with that email exists, a password reset link has been sent." : ""}
              </div>
            )}
            {!success ? (
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📧</span>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                      disabled={isLoading}
                      autoComplete="email"
                    />
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
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <span className="button-arrow">→</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <p style={{ color: "#6b7280", marginBottom: "24px" }}>
                  Please check your email inbox (and spam folder) for the password reset link.
                </p>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  className="login-button"
                  style={{ marginBottom: "16px" }}
                >
                  Send Another Email
                </button>
              </div>
            )}
            <div className="login-footer">
              <p>
                Remember your password?{" "}
                <Link to="/login" className="register-link">
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

