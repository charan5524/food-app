import "./Franchise.css";
import React, { useState } from "react";
import axios from "axios";

function Franchise() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    city: "",
    investmentBudget: "",
    experience: "",
    message: "",
  });

  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage("Submitting...");

    try {
      const response = await axios.post(
        "http://localhost:5000/franchise-apply",
        formData
      );
      if (response.data.success) {
        setStatusMessage("Application submitted successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          location: "",
          city: "",
          investmentBudget: "",
          experience: "",
          message: "",
        });
      } else {
        setStatusMessage("Failed to submit application.");
      }
    } catch (error) {
      console.error("Error:", error);
      setStatusMessage("Error submitting application.");
    }
  };

  return (
    <div className="franchise-container">
      <h1>Franchise Application</h1>
      <p>
        INTERESTED IN OWNING A FRANCHISE? FILL OUT THE FORM BELOW.AND OUR TEAM
        WILL REACH OUT TO YOU SOON.
      </p>

      <div className="franchise-form-container">
        <form onSubmit={handleSubmit} className="franchise-form">
          {/* 🌟 First Row */}
          <div className="form-row">
            <input
              type="text"
              name="name"
              placeholder="Full Name*"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email*"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* 🌟 Second Row */}
          <div className="form-row">
            <input
              type="tel"
              name="phone"
              placeholder="Phone*"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="city"
              placeholder="City*"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>

          {/* 🌟 Third Row */}
          <div className="form-row">
            <input
              type="text"
              name="location"
              placeholder="Preferred Franchise Location*"
              value={formData.location}
              onChange={handleChange}
              required
            />
            <select
              name="investmentBudget"
              value={formData.investmentBudget}
              onChange={handleChange}
              required
            >
              <option value="">--Select Investment Budget--</option>
              <option value="Less than $50,000">Less than $50,000</option>
              <option value="$50,000 - $100,000">$50,000 - $100,000</option>
              <option value="$100,000 - $200,000">$100,000 - $200,000</option>
              <option value="More than $200,000">More than $200,000</option>
            </select>
          </div>

          {/* 🌟 Fourth Row */}
          <div className="form-row">
            <input
              type="text"
              name="experience"
              placeholder="Business Experience (if any)"
              value={formData.experience}
              onChange={handleChange}
            />
          </div>

          {/* 🌟 Message Field */}
          <textarea
            name="message"
            placeholder="Tell us why you're interested in a franchise*"
            value={formData.message}
            onChange={handleChange}
            required
          />

          {/* 🌟 Submit Button */}
          <button type="submit" className="submit-button">
            SUBMIT
          </button>
        </form>

        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </div>
    </div>
  );
}

export default Franchise;
