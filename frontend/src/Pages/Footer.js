import React from "react";
import "./Footer.css";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* 🌟 Brand & About Us */}
        <div className="footer-brand">
          <h2>Foodie's Delight</h2>
          <p>Your one-stop destination for delicious and fresh food.</p>
          <p>We serve authentic flavors, handcrafted with love!</p>
        </div>

        {/* 🌟 Quick Links */}
        <div className="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/menu">Menu</a>
            </li>
            <li>
              <a href="/franchise">Franchise</a>
            </li>
            <li>
              <a href="/catering">Catering</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </div>

        {/* 🌟 Contact Information */}
        <div className="footer-contact">
          <h3>Contact Us</h3>
          <p>
            <FaMapMarkerAlt className="footer-icon" /> 123 Food Street, New
            York, NY
          </p>
          <p>
            <FaPhoneAlt className="footer-icon" /> +1 234 567 890
          </p>
          <p>
            <FaEnvelope className="footer-icon" /> support@foodiesdelight.com
          </p>
        </div>

        {/* 🌟 Business Hours */}
        <div className="footer-hours">
          <h3>Business Hours</h3>
          <p>
            <FaClock className="footer-icon" /> Mon - Thur: 10 AM - 10 PM
          </p>
          <p>
            <FaClock className="footer-icon" /> Fri - sun: 10 AM - 10 PM
          </p>
        </div>

        {/* 🌟 Social Media */}
        <div className="footer-social">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="#" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="#" aria-label="YouTube">
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* 🌟 Newsletter Subscription */}
        <div className="footer-newsletter">
          <h3>Subscribe to Our Newsletter</h3>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button>Subscribe</button>
          </div>
        </div>
      </div>

      {/* 🌟 Copyright Section */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Foodie's Delight. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
