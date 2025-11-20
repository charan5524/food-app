import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useMemo } from "react";
import { 
  FaUtensils, 
  FaClock, 
  FaUsers, 
  FaStar,
  FaBriefcase,
  FaHeart,
  FaBirthdayCake,
  FaMusic,
  FaLeaf,
  FaWineGlassAlt,
  FaCheckCircle,
  FaSmile
} from "react-icons/fa";
import "./Catering.css";

function Catering() {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedPackageType, setSelectedPackageType] = useState("corporate");

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

  const packageTabs = [
    { id: "corporate", label: "Corporate" },
    { id: "weddings", label: "Weddings" },
    { id: "social", label: "Social Events" },
  ];

  const cateringPackages = {
    corporate: [
      {
        name: "Executive Lunch",
        price: "$22 / guest",
        includes: ["2 appetizers", "3 entrées", "Signature dessert shots", "Infused water station"],
        badge: "Most Popular",
      },
      {
        name: "Boardroom Premium",
        price: "$35 / guest",
        includes: ["Live carving station", "Chef-attended action counter", "Artisanal breads", "Mini dessert bar"],
        badge: "Chef Curated",
      },
    ],
    weddings: [
      {
        name: "Regal Feast",
        price: "$48 / guest",
        includes: ["Welcome mocktails", "Live biryani counter", "Decadent dessert lounge", "Midnight snack bar"],
        badge: "Signature Experience",
      },
      {
        name: "Sangeet Soirée",
        price: "$42 / guest",
        includes: ["Tapas-style starters", "Grill station", "Fusion desserts", "Mocktail mixology"],
      },
    ],
    social: [
      {
        name: "Garden Party",
        price: "$25 / guest",
        includes: ["Grazing boards", "Canapés trio", "Lemonade cart", "Mini dessert jars"],
      },
      {
        name: "Festival Spread",
        price: "$32 / guest",
        includes: ["Regional favorites", "Live dosa/pani puri stations", "Heritage desserts", "Spiced beverages"],
        badge: "Seasonal Favorite",
      },
    ],
  };

  const testimonials = [
    {
      quote:
        "Our 400-guest wedding brunch was seamless. Guests still rave about the live counters and dessert studio!",
      name: "Kavya & Arun",
      event: "Hyderabad Wedding",
    },
    {
      quote:
        "From menu design to last plate served, their team anticipated every need. Perfect for executive summits.",
      name: "Lisa Nguyen",
      event: "Global Tech Summit",
    },
    {
      quote:
        "They transformed our backyard into a fine-dining experience. Thoughtful, beautiful, and absolutely delicious.",
      name: "Rohan Desai",
      event: "50th Anniversary",
    },
  ];

  const processSteps = [
    { title: "Discovery Call", detail: "Share your vision, guest count, and inspiration with our planners." },
    { title: "Menu & Experience Design", detail: "Curate courses, stations, and service flow tailored to your event." },
    { title: "Tasting & Finalization", detail: "Sample dishes, finalize presentation, and lock in timeline." },
    { title: "Flawless Execution", detail: "Chef-led team manages setup, service, and teardown." },
  ];

  const galleryHighlights = [
    { label: "Live Fire Grills", detail: "Show-stopping kebab & grill counters" },
    { label: "Plant-forward Menus", detail: "Seasonal vegetarian-led experiences" },
    { label: "Bespoke Beverages", detail: "Zero-proof mixology & craft coolers" },
  ];

  const visiblePackages = useMemo(() => cateringPackages[selectedPackageType], [selectedPackageType]);

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
              <button className="cta-button primary" onClick={() => navigate("/cateringmenu")}>
                View Packages →
              </button>
              <button className="cta-button secondary" onClick={() => navigate("/contact")}>
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

      {/* Signature Packages */}
      <section className="catering-packages">
        <div className="packages-container">
          <div className="packages-header">
            <h2 className="section-title">Signature Catering Programs</h2>
            <p>Flexible packages designed for intimate gatherings to large-format celebrations.</p>
          </div>
          <div className="package-tabs">
            {packageTabs.map((tab) => (
              <button
                key={tab.id}
                className={`package-tab ${selectedPackageType === tab.id ? "active" : ""}`}
                onClick={() => setSelectedPackageType(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="package-grid">
            {visiblePackages.map((pkg) => (
              <div key={pkg.name} className="package-card">
                {pkg.badge && <span className="package-badge">{pkg.badge}</span>}
                <h3>{pkg.name}</h3>
                <p className="package-price">{pkg.price}</p>
                <ul>
                  {pkg.includes.map((item) => (
                    <li key={item}>
                      <FaCheckCircle /> {item}
                    </li>
                  ))}
                </ul>
                <button className="cta-button secondary" onClick={() => navigate("/cateringmenu")}>
                  View Sample Menu
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="catering-process">
        <div className="process-container">
          <div className="process-intro">
            <p className="process-eyebrow">How it works</p>
            <h2>From first call to final toast</h2>
            <p>Our team manages every detail so you can host with confidence.</p>
          </div>
          <div className="process-grid">
            {processSteps.map((step, index) => (
              <div key={step.title} className="process-card">
                <span className="step-index">{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Highlights */}
      <section className="catering-highlights">
        <div className="highlights-container">
          <div className="highlight-grid">
            {galleryHighlights.map((highlight) => (
              <div key={highlight.label} className="highlight-card">
                <FaLeaf />
                <div>
                  <h3>{highlight.label}</h3>
                  <p>{highlight.detail}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="highlight-cta">
            <FaWineGlassAlt />
            <div>
              <h3>Chef-led tasting experiences</h3>
              <p>Schedule an in-studio tasting or private demo for your planning committee.</p>
            </div>
            <button className="cta-button primary" onClick={() => navigate("/contact")}>
              Book a tasting
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="catering-testimonials">
        <div className="testimonials-container">
          <h2 className="section-title">Loved by hosts & planners</h2>
          <div className="testimonial-grid">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="testimonial-card">
                <FaSmile />
                <p className="quote">“{testimonial.quote}”</p>
                <p className="author">
                  {testimonial.name} · {testimonial.event}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="catering-cta">
        <div className="cta-container">
          <span className="cta-eyebrow">Full-service catering partners</span>
          <h2>Ready to Plan Your Event?</h2>
          <p>Share your vision with our planners for a tailored menu, styling, and service timeline.</p>
          <div className="cta-actions">
            <button className="cta-button primary large" onClick={() => navigate("/contact")}>
              Get a Quote
            </button>
            <button
              className="cta-button ghost large"
              onClick={() => navigate("/cateringmenu")}
            >
              Explore Sample Menus
            </button>
          </div>
          <p className="cta-contact-note">
            Prefer to speak with someone? <a href="tel:+11234567890">Call (123) 456-7890</a>
          </p>
        </div>
      </section>
    </div>
  );
}

export default Catering;
