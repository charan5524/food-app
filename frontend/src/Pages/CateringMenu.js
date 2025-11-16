import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaCheckCircle } from "react-icons/fa";
import { useToast } from "../context/ToastContext";
import "./CateringMenu.css";

const cateringPackages = [
  {
    people: 15,
    options: [
      {
        title: "Chicken Biryani",
        price: 150,
        details: [
          "1 shallow tray of chicken biryani rice",
          "Chicken fry pieces",
          "½ shallow tray of mixed salad",
        ],
      },
      {
        title: "Mutton Biryani",
        price: 150,
        details: [
          "1 shallow tray of Mutton Biryani rice",
          "Side of Goat Curry",
          "½ shallow tray of mixed salad",
        ],
      },
      {
        title: "Paneer Biryani",
        price: 160,
        details: [
          "1 shallow tray of Paneer Biryani",
          "½ shallow tray of Paneer Butter Masala",
          "½ shallow tray of mixed salad",
        ],
      },
    ],
  },
  {
    people: 25,
    options: [
      {
        title: "Chicken Biryani",
        price: 280,
        details: [
          "1 shallow tray of chicken biryani rice",
          "Chicken fry pieces",
          "½ shallow tray of mixed salad",
        ],
      },
      {
        title: "Mutton Biryani",
        price: 280,
        details: [
          "1 shallow tray of Mutton Biryani rice",
          "Side of Goat Curry",
          "½ shallow tray of mixed salad",
        ],
      },
      {
        title: "Paneer Biryani",
        price: 280,
        details: [
          "1 shallow tray of Paneer Biryani",
          "½ shallow tray of Paneer Butter Masala",
          "½ shallow tray of mixed salad",
        ],
      },
    ],
  },
  {
    people: 50,
    options: [
      {
        title: "Chicken Biryani",
        price: 400,
        details: [
          "1 shallow tray of chicken biryani rice",
          "Chicken fry pieces",
          "½ shallow tray of mixed salad",
        ],
      },
      {
        title: "Mutton Biryani",
        price: 400,
        details: [
          "1 shallow tray of Mutton Biryani rice",
          "Side of Goat Curry",
          "½ shallow tray of mixed salad",
        ],
      },
      {
        title: "Paneer Biryani",
        price: 400,
        details: [
          "1 shallow tray of Paneer Biryani",
          "½ shallow tray of Paneer Butter Masala",
          "½ shallow tray of mixed salad",
        ],
      },
    ],
  },
];

function CateringMenu() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleInquiry = (packageItem, option) => {
    showToast(
      `Inquiry sent for ${option.title} (${packageItem.people} people)!`,
      "success"
    );
    // Navigate to contact page with pre-filled info
    setTimeout(() => {
      navigate("/contact");
    }, 1500);
  };

  return (
    <div className="catering-menu-container">
      <div className="catering-menu-header">
        <h1>Catering Packages</h1>
        <p className="catering-menu-subtitle">
          Choose from our carefully curated packages designed for events of all sizes
        </p>
      </div>

      <div className="packages-wrapper">
        {cateringPackages.map((packageItem, index) => (
          <div key={index} className="package-section">
            <div className="package-header">
              <div className="package-people">
                <FaUsers className="people-icon" />
                <h2>{packageItem.people} People</h2>
              </div>
            </div>
            <div className="menu-options-grid">
              {packageItem.options.map((option, idx) => (
                <div key={idx} className="menu-option-card">
                  <div className="menu-option-header">
                    <h3>{option.title}</h3>
                    <div className="price-badge">${option.price}</div>
                  </div>
                  <ul className="menu-details">
                    {option.details.map((detail, i) => (
                      <li key={i}>
                        <FaCheckCircle className="check-icon" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="inquiry-button"
                    onClick={() => handleInquiry(packageItem, option)}
                  >
                    Request Quote
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="catering-menu-cta">
        <p>Need a custom package? We're here to help!</p>
        <button
          className="cta-button primary"
          onClick={() => navigate("/contact")}
        >
          Contact Us for Custom Quote
        </button>
      </div>
    </div>
  );
}

export default CateringMenu;
