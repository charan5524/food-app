import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  NavLink,
  Navigate,
  useNavigate,
  useLocation,
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
import CartPage from "./Pages/CartPage";
import Dashboard from "./Pages/Dashboard";
import AdminLogin from "./Pages/AdminLogin";
import AdminRegister from "./Pages/AdminRegister";
import AdminDashboard from "./Pages/AdminDashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ErrorBoundary from "./components/ErrorBoundary";
import { CartProvider, useCart } from "./context/CartContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

import "./App.css";
import logo from "./assets/logo.png";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3', 
            borderTop: '4px solid #ff6b35', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '16px', color: '#666' }}>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
};

// Navbar Component
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItems } = useCart();
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const authenticated = isAuthenticated();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    logout();
    setIsUserMenuOpen(false);
    navigate("/login");
  };

  // Listen for auth logout events
  useEffect(() => {
    const handleAuthLogout = () => {
      setIsUserMenuOpen(false);
    };
    window.addEventListener("authLogout", handleAuthLogout);
    return () => window.removeEventListener("authLogout", handleAuthLogout);
  }, []);

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
          <div
            className="cart-icon-wrapper"
            onClick={() => {
              setIsMobileMenuOpen(false);
              if (authenticated) {
                navigate("/cart");
              } else {
                navigate("/login");
              }
            }}
            style={{ cursor: "pointer" }}
          >
            <FaShoppingCart />
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </div>

          <div className="user-menu-wrapper">
            {authenticated && user && (
              <span className="user-name-display" style={{ 
                marginRight: '8px', 
                fontSize: '0.9rem', 
                color: 'var(--text-dark)',
                fontWeight: '500'
              }}>
                {user.name || "User"}
              </span>
            )}
            <button
              className="user-menu-toggle"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-label="User menu"
            >
              <FaUser />
            </button>
            {isUserMenuOpen && (
              <div className="user-dropdown">
                {authenticated && user ? (
                  <>
                    <div className="user-info">
                      <p className="user-name">{user.name || "User"}</p>
                      <p className="user-email">{user.email || ""}</p>
                    </div>
                    <NavLink
                      to="/dashboard"
                      className="dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Dashboard
                    </NavLink>
                    <button className="dropdown-item logout-btn" onClick={handleLogout}>
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
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const isAdminDashboard = location.pathname.startsWith("/admin");

  return (
    <div className="App">
      {!isDashboard && !isAdminDashboard && <Navbar />}

      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/order"
            element={
              <ProtectedRoute>
                <Order />
              </ProtectedRoute>
            }
          />
          <Route path="/franchise" element={<Franchise />} />
          <Route path="/catering" element={<Catering />} />
          <Route path="/cateringmenu" element={<CateringMenu />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {!isDashboard && !isAdminDashboard && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
