import React, { useState } from "react";
import "./Contact.css";
import axios from "axios";

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
  const [showPopup, setShowPopup] = useState(false); // ✅ Pop-up state

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage("Sending...");

    try {
      const response = await axios.post(
        "http://localhost:5000/send-email",
        formData
      );
      if (response.data.success) {
        setStatusMessage("Email sent successfully!");
        setShowPopup(true); // ✅ Show pop-up
        setFormData({
          fname: "",
          lname: "",
          email: "",
          phone: "",
          inquiryType: "",
          message: "",
        });
      } else {
        setStatusMessage("Failed to send email.");
      }
    } catch (error) {
      console.error("Error:", error);
      setStatusMessage("Error sending email.");
    }
  };

  return (
    <div className="contact-container">
      <h1>CONTACT US</h1>

      <div className="contact-wrapper">
        {/* ✅ Left-Side Box */}
        <div className="contact-box">
          <h2>Visit Us</h2>
          <p>
            <strong>Store Address:</strong>
          </p>
          <p>123 Krtiunga</p>
          <p>📍 Open: Mon-Sun, 10 AM - 10 PM</p>
          <p>
            📧 Mail: <a href="mailto:xyz@gmail.com">xyz@gmail.com</a>
          </p>
          <p>📞 Phone: +1 (555) 123-4567</p>

          <p>Need help? Feel free to reach out. We’re happy to assist you.</p>
        </div>

        {/* ✅ Right-Side Contact Form */}
        <div className="contact-form-container">
          <p className="form-note">
            <strong>
              For General Inquiries Or Additional Information, Please Complete
              The Form Below.
            </strong>
          </p>

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <input
                type="text"
                name="fname"
                placeholder="First Name*"
                value={formData.fname}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lname"
                placeholder="Last Name*"
                value={formData.lname}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <input
                type="email"
                name="email"
                placeholder="Email*"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone*"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <select
              name="inquiryType"
              value={formData.inquiryType}
              onChange={handleChange}
              required
            >
              <option value="">--Select One--</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Catering">Catering</option>
              <option value="Order Issue">Order Issue</option>
              <option value="Staff">Staff Issue</option>
            </select>

            <textarea
              name="message"
              placeholder="Message*"
              value={formData.message}
              onChange={handleChange}
              required
            />

            <button type="submit" className="submit-button">
              SUBMIT
            </button>
          </form>

          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
      </div>

      {/* ✅ Success Pop-up */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>Success!</h2>
            <p>Your message has been sent successfully.</p>
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
