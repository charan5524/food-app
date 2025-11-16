import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { 
  FaUtensils, 
  FaClock, 
  FaUsers, 
  FaStar,
  FaBriefcase,
  FaHeart,
  FaBirthdayCake,
  FaMusic
} from "react-icons/fa";
import "./Catering.css";

function Catering() {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Preload the image for better performance
  useEffect(() => {
    const imagePath = `${process.env.PUBLIC_URL}/images/catering-hero.jpg`;
    const img = new Image();
    img.src = imagePath;
    img.onload = () => {
      setImageLoaded(true);
    };
    img.onerror = () => {
      // Fallback if image doesn't load
      console.warn("Catering hero image failed to load");
      setImageLoaded(true); // Still show the section
    };
  }, []);

  const getBackgroundImage = () => {
    // Use local catering hero image
    const imagePath = `${process.env.PUBLIC_URL}/images/catering-hero.jpg`;
    return {
      backgroundImage: `url(${imagePath})`,
    };
  };

  const features = [
    {
      icon: <FaUtensils />,
      title: "Premium Ingredients",
      description: "Sourced fresh daily from trusted local suppliers, ensuring exceptional quality and flavor in every dish",
    },
    {
      icon: <FaClock />,
      title: "Punctual Service",
      description: "Reliable delivery and professional setup, arriving on time to ensure your event runs seamlessly",
    },
    {
      icon: <FaUsers />,
      title: "Expert Culinary Team",
      description: "Award-winning chefs and experienced service staff committed to exceeding your expectations",
    },
    {
      icon: <FaStar />,
      title: "Custom Menu Design",
      description: "Personalized menus crafted to reflect your vision, dietary needs, and event theme",
    },
  ];

  const services = [
    {
      icon: <FaBriefcase />,
      title: "Corporate Events",
      description: "Professional catering solutions for meetings, conferences, and corporate gatherings",
    },
    {
      icon: <FaHeart />,
      title: "Weddings",
      description: "Elegant and sophisticated menus to make your special day truly unforgettable",
    },
    {
      icon: <FaBirthdayCake />,
      title: "Birthday Parties",
      description: "Delightful and flavorful options for celebrations of all ages and preferences",
    },
    {
      icon: <FaMusic />,
      title: "Festivals & Celebrations",
      description: "Authentic traditional flavors and modern twists for cultural events and festivals",
    },
  ];

  return (
    <div className="catering-container">
      {/* Hero Section */}
      <div
        className={`catering-hero-section ${imageLoaded ? "image-loaded" : "image-loading"}`}
        style={{
          ...getBackgroundImage(),
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="catering-hero-overlay">
          <div className="catering-hero-content">
            <div className="hero-badge">Premium Catering Services</div>
            <h1 className="catering-hero-title">
              <span className="title-line-1">Exquisite Cuisine</span>
              <span className="title-line-2">for Every Occasion</span>
            </h1>
            <p className="catering-hero-description">
              Elevate your event with our award-winning catering services. From intimate gatherings 
              to grand celebrations, we deliver exceptional culinary experiences with meticulous 
              attention to detail and uncompromising quality.
            </p>
            <div className="catering-hero-buttons">
              <button
                className="cta-button primary"
                onClick={() => navigate("/cateringmenu")}
              >
                View Packages →
              </button>
              <button
                className="cta-button secondary"
                onClick={() => navigate("/contact")}
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="catering-features">
        <div className="features-container">
          <h2 className="section-title">Why Choose Our Catering?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="catering-services">
        <div className="services-container">
          <h2 className="section-title">Event Types We Cater</h2>
          <div className="services-grid">
            {services.map((service, index) => (
              <div key={index} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="catering-cta">
        <div className="cta-container">
          <h2>Ready to Plan Your Event?</h2>
          <p>Contact us today to discuss your catering needs and get a custom quote</p>
          <button
            className="cta-button primary large"
            onClick={() => navigate("/contact")}
          >
            Get a Quote
          </button>
        </div>
      </section>
    </div>
  );
}

export default Catering;
