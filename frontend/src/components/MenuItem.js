import React, { useState } from "react";
import "./MenuItem.css";

const MenuItem = ({ item, onAddToCart }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Helper function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      // Return a data URI for a simple placeholder instead of external URL
      return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
    }
    // If it's already a full URL (starts with http), return as is
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    // If it's a relative path (starts with /uploads), prepend API URL
    if (imagePath.startsWith("/uploads")) {
      const fullUrl = `${API_URL}${imagePath}`;
      return fullUrl;
    }
    // If it doesn't start with /, it might be missing the leading slash
    if (imagePath.includes("uploads")) {
      const correctedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
      return `${API_URL}${correctedPath}`;
    }
    // Otherwise return as is
    return imagePath;
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    onAddToCart(item);

    // Show success feedback
    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    }, 300);
  };

  return (
    <div className="menu-item">
      <div className="menu-item-image">
        <img 
          src={getImageUrl(item.image)} 
          alt={item.name} 
          onError={(e) => {
            // Use SVG data URI as fallback instead of external URL
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
            console.error("Failed to load image:", item.image, "Full URL:", getImageUrl(item.image));
          }}
          onLoad={() => {
            console.log("Image loaded successfully:", getImageUrl(item.image));
          }}
        />
        {item.popular && (
          <span className="popular-badge">
            <span className="badge-icon">⭐</span>
            Popular
          </span>
        )}
        <div className="image-overlay"></div>
      </div>
      <div className="menu-item-content">
        <h3>{item.name}</h3>
        <p className="description">{item.description}</p>
        <div className="menu-item-footer">
          <div className="price-container">
            <span className="price">₹{item.price.toFixed(2)}</span>
          </div>
          <button
            className={`add-to-cart-btn ${isAdding ? "adding" : ""} ${
              isAdded ? "added" : ""
            }`}
            onClick={handleAddToCart}
            disabled={isAdding}
            aria-label={`Add ${item.name} to cart`}
          >
            <span className="btn-content">
              {isAdded ? (
                <>
                  <span className="btn-icon">✓</span>
                  Added!
                </>
              ) : (
                <>
                  <span className="btn-icon">+</span>
                  Add to Cart
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
