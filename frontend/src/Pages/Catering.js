import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import React from "react";

import "./Catering.css";

function Catering() {
  const navigate = useNavigate();
  // ✅ Function to dynamically get background image path
  const getBackgroundImage = () => {
    return {
      backgroundImage: `url(${process.env.PUBLIC_URL}/images/catering-hero.jpg)`,
    };
  };

  return (
    <div className="catering-container">
      {/* ✅ Hero Section */}
      <div
        className="hero-section"
        style={{
          ...getBackgroundImage(),
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "darken",
        }}
      >
        <div className="hero-overlay">
          <h1>DELICIOUS FOOD FOR ANY EVENT</h1>
          <p>
            <h3>
              We offer excellent catering services for all events. Our team
              ensures fresh ingredients, timely service, and an unforgettable
              dining experience tailored to your needs{" "}
            </h3>
          </p>
          <div className="hero-buttons">
            <button
              className="cta-button green"
              onClick={() => navigate("/cateringmenu")}
            >
              Get Started →
            </button>
            <button
              className="cta-button outline"
              onClick={() => navigate("/catering")}
            >
              Learn More →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Catering;
