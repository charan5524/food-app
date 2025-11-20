import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MenuItem from "../components/MenuItem";
import { MenuItemSkeleton } from "../components/LoadingSkeleton";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { menuService } from "../services/api";
import "./Menu.css";

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();
  const { addToCart, cartItems, getCartItemCount } = useCart();
  const navigate = useNavigate();

  // Fetch menu items and categories on component mount
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch menu items and categories in parallel for better performance
        const [menuResponse, categoriesResponse] = await Promise.all([
          menuService.getAllMenuItems(),
          menuService.getAllCategories(),
        ]);

        // Map _id to id for compatibility with existing code
        const itemsWithId = menuResponse.menuItems.map((item) => ({
          ...item,
          id: item._id || item.id,
        }));

        setMenuItems(itemsWithId);
        setCategories(categoriesResponse.categories || []);
      } catch (err) {
        console.error("Error fetching menu data:", err);
        setError("Failed to load menu. Please try again later.");
        showToast("Failed to load menu items", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuData();
  }, [showToast]);

  // Filter items based on category and search query (memoized for performance)
  const filteredItems = useMemo(() => {
    let filtered = menuItems;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [menuItems, selectedCategory, searchQuery]);

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
          {categories.map((category) => (
            <button
              key={category._id || category.name}
              className={`category-btn ${
                selectedCategory === category.name ? "active" : ""
              }`}
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.icon && (
                <span className="category-icon">{category.icon}</span>
              )}
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="menu-content">
        {error && (
          <div className="error-message" style={{ 
            padding: "20px", 
            textAlign: "center", 
            color: "#ff6b35",
            backgroundColor: "#fff5f5",
            borderRadius: "8px",
            margin: "20px 0"
          }}>
            {error}
          </div>
        )}
        <div className="menu-items">
          {isLoading ? (
            // Show loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <MenuItemSkeleton key={index} />
            ))
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <MenuItem
                key={item.id || item._id}
                item={item}
                onAddToCart={handleAddToCart}
              />
            ))
          ) : (
            <div className="no-items">
              <p>
                {searchQuery || selectedCategory !== "All"
                  ? "No items found matching your criteria."
                  : "No menu items available at the moment."}
              </p>
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
