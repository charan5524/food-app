import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { menuCategories, menuItems } from "../data/menuData";
import MenuItem from "../components/MenuItem";
import { MenuItemSkeleton } from "../components/LoadingSkeleton";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import "./Menu.css";

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState(menuItems);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { addToCart, cartItems, getCartItemCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    // Simulate loading for better UX
    const timer = setTimeout(() => {
      let filtered = menuItems;

      // Filter by category
      if (selectedCategory !== "All") {
        filtered = filtered.filter((item) => item.category === selectedCategory);
      }

      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setFilteredItems(filtered);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const handleAddToCart = (item) => {
    const existingItem = cartItems.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      showToast(`${item.name} quantity updated!`, "success");
    } else {
      showToast(`${item.name} added to cart!`, "success");
    }
    addToCart(item);
  };

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1>Our Menu</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="menu-categories">
          <button
            className={`category-btn ${
              selectedCategory === "All" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("All")}
          >
            All
          </button>
          {menuCategories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${
                selectedCategory === category.name ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category.name)}
            >
              <span className="category-icon">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="menu-content">
        <div className="menu-items">
          {isLoading ? (
            // Show loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <MenuItemSkeleton key={index} />
            ))
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <div className="no-items">
              <p>No items found in this category.</p>
            </div>
          )}
        </div>

      </div>

      {cartItems.length > 0 && (
        <button className="cart-toggle" onClick={() => navigate("/cart")}>
          View Cart ({getCartItemCount()} items)
        </button>
      )}
    </div>
  );
};

export default Menu;
