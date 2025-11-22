import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api";
import "./AdminLogin.css";

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    adminSecret: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call the admin registration endpoint
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:5000"
        }/api/auth/register-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || `Error: ${response.status} ${response.statusText}`
        );
        return;
      }

      if (data.success) {
        login(data.token, data.user);
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        "An error occurred. Please try again. Make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <div className="admin-login-header">
          <h1>Admin Registration</h1>
          <p>Create a new admin account</p>
        </div>

        {error && <div className="admin-error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminSecret">Admin Secret Key</label>
            <input
              type="password"
              id="adminSecret"
              name="adminSecret"
              value={formData.adminSecret}
              onChange={handleChange}
              required
              placeholder="Enter admin secret key"
            />
            <small
              style={{
                color: "#666",
                fontSize: "12px",
                marginTop: "5px",
                display: "block",
              }}
            >
              Default: admin-secret-2024 (change in .env file)
            </small>
          </div>

          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Admin Account"}
          </button>
        </form>

        <div className="admin-login-footer">
          <p>
            Already have an account? <a href="/admin/login">Login here</a>
          </p>
          <p>
            <a href="/">← Back to Home</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
