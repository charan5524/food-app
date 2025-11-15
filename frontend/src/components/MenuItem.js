import React, { useState } from "react";
import "./MenuItem.css";

const MenuItem = ({ item, onAddToCart }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

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
        <img src={item.image} alt={item.name} />
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
            <span className="price">${item.price.toFixed(2)}</span>
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
