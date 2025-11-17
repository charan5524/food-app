import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  NavLink,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { FaShoppingCart, FaUser, FaBars, FaTimes } from "react-icons/fa";
import Home from "./Pages/Home";
import Menu from "./Pages/Menu";
import CateringMenu from "./Pages/CateringMenu";
import Order from "./Pages/Order";
import Franchise from "./Pages/Franchise";
import Catering from "./Pages/Catering";
import Contact from "./Pages/Contact";
import Footer from "./Pages/Footer";
import Login from "./components/Login";
import Register from "./components/Register";
import ErrorBoundary from "./components/ErrorBoundary";

import "./App.css";
import logo from "./assets/logo.png";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Navbar Component
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = token ? JSON.parse(atob(token.split(".")[1])) : null;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Get cart items from localStorage or context
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    setCartItemCount(count);

    // Listen for cart updates
    const handleStorageChange = () => {
      const updatedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const updatedCount = updatedCart.reduce(
        (total, item) => total + (item.quantity || 1),
        0
      );
      setCartItemCount(updatedCount);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest(".user-menu-wrapper")) {
        setIsUserMenuOpen(false);
      }
      if (isMobileMenuOpen && !event.target.closest(".navbar")) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen, isMobileMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    setIsUserMenuOpen(false);
    navigate("/login");
  };

  return (
    <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="navbar-left">
          <NavLink to="/" className="logo">
            <img src={logo} alt="Food App Logo" />
          </NavLink>
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <ul className={`nav-links ${isMobileMenuOpen ? "mobile-open" : ""}`}>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/menu"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Menu
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/order"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Order Now
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/franchise"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Franchise
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/catering"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Catering
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </NavLink>
          </li>
        </ul>

        <div className="navbar-right">
          <NavLink
            to="/menu"
            className="cart-icon-wrapper"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <FaShoppingCart />
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </NavLink>

          <div className="user-menu-wrapper">
            <button
              className="user-menu-toggle"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-label="User menu"
            >
              <FaUser />
            </button>
            {isUserMenuOpen && (
              <div className="user-dropdown">
                {token ? (
                  <>
                    <div className="user-info">
                      <p className="user-name">{user?.name || "User"}</p>
                      <p className="user-email">{user?.email || ""}</p>
                    </div>
                    <NavLink
                      to="/dashboard"
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Dashboard
                    </NavLink>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Register
                    </NavLink>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

function AppContent() {
  return (
    <div className="App">
      <Navbar />

      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/order" element={<Order />} />
          <Route path="/franchise" element={<Franchise />} />
          <Route path="/catering" element={<Catering />} />
          <Route path="/cateringmenu" element={<CateringMenu />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard (Coming Soon)</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
