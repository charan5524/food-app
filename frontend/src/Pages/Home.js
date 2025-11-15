import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Authentic Telangana & Andhra Cuisine</h1>
          <p>Experience the rich flavors of South Indian delicacies</p>
          <Link to="/menu" className="cta-button">
            Explore Menu
          </Link>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="featured-categories">
        <h2>Popular Categories</h2>
        <div className="category-grid">
          <div className="category-card">
            <img
              src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800"
              alt="Biryani"
            />
            <h3>Biryani</h3>
            <p>Fragrant rice dishes with aromatic spices</p>
          </div>
          <div className="category-card">
            <img
              src="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800"
              alt="Curries"
            />
            <h3>Curries</h3>
            <p>Rich and flavorful traditional curries</p>
          </div>
          <div className="category-card">
            <img
              src="https://images.unsplash.com/photo-1608198093002-ad4e505484ba?w=800"
              alt="Breads"
            />
            <h3>Breads</h3>
            <p>Freshly baked traditional breads</p>
          </div>
        </div>
      </section>

      {/* Special Offers */}
      <section className="special-offers">
        <div className="offer-card">
          <div className="offer-content">
            <h2>Weekend Special</h2>
            <p>Get 20% off on all biryanis</p>
            <Link to="/menu" className="offer-button">
              Order Now
            </Link>
          </div>
          <img
            src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800"
            alt="Special Offer"
          />
        </div>
      </section>

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
                outside of Hyderabad."
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
                Mamsam is a must-try!"
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
