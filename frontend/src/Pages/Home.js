import React from "react";
import { Link } from "react-router-dom";
import PromoHighlights from "../components/PromoHighlights";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Authentic Telangana & Andhra Cuisine</h1>
          <p>
            Discover the authentic taste of South India, crafted with
            traditional recipes and premium ingredients. From aromatic biryanis
            to flavorful curries, experience culinary excellence delivered to
            your doorstep.
          </p>
          <Link to="/menu" className="cta-button">
            Explore Our Menu
          </Link>
        </div>
        {/* Spice Particles Animation */}
        <div className="spice-particles">
          <span className="spice-particle spice-chili">🌶️</span>
          <span className="spice-particle spice-leaf">🍃</span>
          <span className="spice-particle spice-peppercorn">⚫</span>
          <span className="spice-particle spice-chili">🌶️</span>
          <span className="spice-particle spice-leaf">🍃</span>
          <span className="spice-particle spice-peppercorn">⚫</span>
          <span className="spice-particle spice-chili">🌶️</span>
          <span className="spice-particle spice-leaf">🍃</span>
          <span className="spice-particle spice-peppercorn">⚫</span>
          <span className="spice-particle spice-chili">🌶️</span>
          <span className="spice-particle spice-leaf">🍃</span>
          <span className="spice-particle spice-peppercorn">⚫</span>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="featured-categories">
        <h2>Popular Categories</h2>
        <div className="category-grid">
          <Link to="/menu?category=Biryani" className="category-card">
            <img src="/images/biryani.jpg" alt="Biryani" />
            <h3>Biryani</h3>
            <p>Fragrant rice dishes with aromatic spices</p>
          </Link>
          <Link to="/menu?category=Curries" className="category-card">
            <img src="/images/curry.jpg" alt="Curries" />
            <h3>Curries</h3>
            <p>Rich and flavorful traditional curries</p>
          </Link>
          <Link to="/menu?category=Breads" className="category-card">
            <img src="/images/bread.jpg" alt="Breads" />
            <h3>Breads</h3>
            <p>Freshly baked traditional breads</p>
          </Link>
        </div>
      </section>

      <PromoHighlights />

      {/* Why Choose Us */}
      <section className="why-choose-us">
        <h2>Why Choose Us</h2>
        <div className="features-grid">
          <div className="feature">
            <i className="feature-icon">🍳</i>
            <h3>Authentic Taste</h3>
            <p>Traditional recipes passed down through generations</p>
          </div>
          <div className="feature">
            <i className="feature-icon">🚚</i>
            <h3>Fast Delivery</h3>
            <p>Quick and reliable delivery service</p>
          </div>
          <div className="feature">
            <i className="feature-icon">⭐</i>
            <h3>Quality Ingredients</h3>
            <p>Fresh and premium quality ingredients</p>
          </div>
          <div className="feature">
            <i className="feature-icon">💯</i>
            <h3>Best Value</h3>
            <p>Great taste at reasonable prices</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>What Our Customers Say</h2>
        <div className="testimonial-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>
                "The Hyderabadi Biryani is absolutely amazing! Best I've had
                outside of Hyderabad. The flavors are authentic and the service
                is excellent."
              </p>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                  alt="Customer"
                />
                <div>
                  <h4>Rahul Sharma</h4>
                  <p>Regular Customer</p>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>
                "Authentic Andhra flavors that remind me of home. The Gongura
                Mamsam is a must-try! Every dish is prepared with love and
                care."
              </p>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                  alt="Customer"
                />
                <div>
                  <h4>Priya Patel</h4>
                  <p>Food Blogger</p>
                </div>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>
                "Fast delivery and amazing food quality! The curries are rich
                and flavorful. This has become our go-to place for authentic
                South Indian cuisine."
              </p>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                  alt="Customer"
                />
                <div>
                  <h4>Arjun Reddy</h4>
                  <p>Food Enthusiast</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Experience Authentic Flavors?</h2>
          <p>Order now and get 10% off on your first order!</p>
          <Link to="/menu" className="cta-button">
            Order Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
