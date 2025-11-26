import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaUtensils, FaTimes, FaFilter, FaSortAmountDown } from "react-icons/fa";
import MenuItem from "../components/MenuItem";
import { MenuItemSkeleton } from "../components/LoadingSkeleton";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { menuService } from "../services/api";
import "./Menu.css";

const Menu = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default"); // default, price-low, price-high, name
  const [showFilters, setShowFilters] = useState(false);
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

  // Filter and sort items (memoized for performance)
  const filteredItems = useMemo(() => {
    let filtered = [...menuItems];

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
          item.description.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query)
      );
    }

    // Sort items
    if (sortBy === "price-low") {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [menuItems, selectedCategory, searchQuery, sortBy]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedCategory !== "All" || sortBy !== "default";

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("default");
  };

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
      <div className="menu-hero">
        <div className="hero-content">
          <div className="hero-icon">
            <FaUtensils />
          </div>
          <h1 className="menu-title">Our Delicious Menu</h1>
          <p className="menu-subtitle">Explore our authentic flavors and fresh ingredients</p>
        </div>
      </div>

      <div className="menu-header">
        <div className="search-filter-row">
          <div className="search-container">
            <div className="search-bar">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search for dishes, ingredients, or flavors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="clear-search-btn"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>

          <div className="filter-controls">
            <div className="sort-container">
              <FaSortAmountDown className="sort-icon" />
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="active-filters">
            <div className="filter-chips">
              {searchQuery && (
                <span className="filter-chip">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}>
                    <FaTimes />
                  </button>
                </span>
              )}
              {selectedCategory !== "All" && (
                <span className="filter-chip">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory("All")}>
                    <FaTimes />
                  </button>
                </span>
              )}
              {sortBy !== "default" && (
                <span className="filter-chip">
                  Sort: {sortBy === "name" ? "Name" : sortBy === "price-low" ? "Price: Low to High" : "Price: High to Low"}
                  <button onClick={() => setSortBy("default")}>
                    <FaTimes />
                  </button>
                </span>
              )}
            </div>
            <button className="clear-all-filters-btn" onClick={clearAllFilters}>
              <FaTimes /> Clear All
            </button>
          </div>
        )}
        
        <div className="menu-categories">
          <button
            className={`category-btn ${
              selectedCategory === "All" ? "active" : ""
            }`}
            onClick={() => setSelectedCategory("All")}
          >
            <span className="category-icon">🍽️</span>
            <span>All</span>
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
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {filteredItems.length > 0 && (
          <div className="results-count">
            <span>{filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found</span>
          </div>
        )}
      </div>

      <div className="menu-content">
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}
        <div className="menu-items">
          {isLoading ? (
            // Show loading skeletons
            Array.from({ length: 8 }).map((_, index) => (
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
              <div className="no-items-icon">🔍</div>
              <h3>No items found</h3>
              <p>
                {hasActiveFilters
                  ? "Try adjusting your search or filter to find what you're looking for."
                  : "No menu items available at the moment. Please check back later."}
              </p>
              {hasActiveFilters && (
                <button 
                  className="clear-filters-btn"
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {cartItems.length > 0 && (
        <button className="cart-toggle" onClick={() => navigate("/cart")}>
          <FaShoppingCart className="cart-icon" />
          <span className="cart-text">View Cart</span>
          <span className="cart-badge">{getCartItemCount()}</span>
        </button>
      )}
    </div>
  );
};

export default Menu;
