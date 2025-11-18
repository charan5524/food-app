import React, { useState } from "react";
import "./Contact.css";
import { contactService } from "../services/api";

function Contact() {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    inquiryType: "",
    message: "",
  });

  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState(""); // "success", "error", or ""
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    // Clear status message when user makes changes
    if (statusMessage) {
      setStatusMessage("");
      setStatusType("");
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fname.trim()) {
      newErrors.fname = "First name is required";
    }

    if (!formData.lname.trim()) {
      newErrors.lname = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!formData.inquiryType) {
      newErrors.inquiryType = "Please select an inquiry type";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      setStatusMessage("Please fix the errors below");
      setStatusType("error");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("Sending...");
    setStatusType("");
    setErrors({});

    try {
      const response = await contactService.sendEmail(formData);
      if (response.success) {
        setStatusMessage("Email sent successfully!");
        setStatusType("success");
        setShowPopup(true);
        setFormData({
          fname: "",
          lname: "",
          email: "",
          phone: "",
          inquiryType: "",
          message: "",
        });
      } else {
        setStatusMessage(
          response.message || "Failed to send email. Please try again."
        );
        setStatusType("error");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Error sending email. Please try again later.";
      setStatusMessage(errorMessage);
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-container">
      <div className="background-decoration">
        <div className="bg-circle bg-circle-1"></div>
        <div className="bg-circle bg-circle-2"></div>
        <div className="bg-circle bg-circle-3"></div>
        <div className="bg-circle bg-circle-4"></div>
        <div className="bg-pattern"></div>
      </div>
      <div className="contact-header">
        <div className="header-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </div>
        <h1>Get In Touch</h1>
        <p className="contact-subtitle">
          We'd love to hear from you. Send us a message and we'll respond as
          soon as possible.
        </p>
      </div>

      <div className="contact-wrapper">
        {/* Left-Side Contact Information */}
        <div className="contact-info">
          <div className="info-section">
            <h2>Contact Information</h2>
            <p className="info-description">
              Reach out to us through any of these channels. We're here to help!
            </p>
          </div>

          <div className="info-items">
            <div className="info-item">
              <div className="info-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div className="info-content">
                <h3>Address</h3>
                <p>
                  123 Krtiunga Street
                  <br />
                  City, State 12345
                </p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div className="info-content">
                <h3>Phone</h3>
                <p>
                  <a href="tel:+15551234567">+1 (555) 123-4567</a>
                </p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div className="info-content">
                <h3>Email</h3>
                <p>
                  <a href="mailto:xyz@gmail.com">xyz@gmail.com</a>
                </p>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className="info-content">
                <h3>Business Hours</h3>
                <p>
                  Monday - Sunday
                  <br />
                  10:00 AM - 10:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right-Side Contact Form */}
        <div className="contact-form-container">
          <div className="form-header">
            <h2>Send Us a Message</h2>
            <p className="form-description">
              Fill out the form below and we'll get back to you within 24 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="fname">
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="fname"
                  name="fname"
                  placeholder="John"
                  value={formData.fname}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={errors.fname ? "error" : ""}
                  required
                />
                {errors.fname && (
                  <span className="error-message">{errors.fname}</span>
                )}
              </div>
              <div className="form-field">
                <label htmlFor="lname">
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="lname"
                  name="lname"
                  placeholder="Doe"
                  value={formData.lname}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={errors.lname ? "error" : ""}
                  required
                />
                {errors.lname && (
                  <span className="error-message">{errors.lname}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={errors.email ? "error" : ""}
                  required
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>
              <div className="form-field">
                <label htmlFor="phone">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={errors.phone ? "error" : ""}
                  required
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="inquiryType">
                Inquiry Type <span className="required">*</span>
              </label>
              <select
                id="inquiryType"
                name="inquiryType"
                value={formData.inquiryType}
                onChange={handleChange}
                disabled={isSubmitting}
                className={errors.inquiryType ? "error" : ""}
                required
              >
                <option value="">Select an inquiry type</option>
                <option value="General Inquiry">General Inquiry</option>
                <option value="Catering">Catering</option>
                <option value="Order Issue">Order Issue</option>
                <option value="Staff">Staff Issue</option>
              </select>
              {errors.inquiryType && (
                <span className="error-message">{errors.inquiryType}</span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="message">
                Message <span className="required">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                placeholder="Please provide details about your inquiry..."
                value={formData.message}
                onChange={handleChange}
                disabled={isSubmitting}
                className={errors.message ? "error" : ""}
                rows="6"
                required
              />
              {errors.message && (
                <span className="error-message">{errors.message}</span>
              )}
            </div>

            {statusMessage && (
              <div className={`status-message ${statusType}`}>
                <span className="status-icon">
                  {statusType === "success" ? "✓" : "✕"}
                </span>
                {statusMessage}
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Success Pop-up */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-box" onClick={e => e.stopPropagation()}>
            <div className="popup-icon">✓</div>
            <h2>Success!</h2>
            <p>
              Your message has been sent successfully. We'll get back to you
              soon!
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contact;
