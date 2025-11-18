import React, { useState, useEffect } from "react";
import { FaHeart, FaShoppingCart, FaTrash } from "react-icons/fa";
import "./Favorites.css";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const removeFromFavorites = (itemId) => {
    const updated = favorites.filter((item) => item.id !== itemId);
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const addToCart = (item) => {
    // TODO: Integrate with cart context
    console.log("Add to cart:", item);
    alert(`${item.name} added to cart!`);
  };

  if (favorites.length === 0) {
    return (
      <div className="favorites">
        <div className="section-header">
          <h2>Favorites</h2>
          <p>Save your favorite dishes for quick access</p>
        </div>
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <h3>No favorites yet</h3>
          <p>Start adding dishes to your favorites from the menu!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites">
      <div className="section-header">
        <h2>Favorites</h2>
        <p>Your saved favorite dishes ({favorites.length})</p>
      </div>

      <div className="favorites-grid">
        {favorites.map((item) => (
          <div key={item.id} className="favorite-card">
            <div className="favorite-image">
              {item.image ? (
                <img src={item.image} alt={item.name} />
              ) : (
                <div className="image-placeholder">🍽️</div>
              )}
              <button
                className="remove-favorite"
                onClick={() => removeFromFavorites(item.id)}
              >
                <FaTrash />
              </button>
            </div>
            <div className="favorite-content">
              <h3>{item.name}</h3>
              <p className="favorite-price">${item.price?.toFixed(2)}</p>
              <button
                className="btn-add-cart"
                onClick={() => addToCart(item)}
              >
                <FaShoppingCart />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;

