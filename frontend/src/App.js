import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  NavLink,
  Navigate,
} from "react-router-dom";
import Home from "./Pages/Home";
import Menu from "./Pages/Menu";
import CateringMenu from "./Pages/CateringMenu";
import Order from "./Pages/Order";
import Franchise from "./Pages/Franchise";
import Catering from "./Pages/Catering";
import Contact from "./Pages/Contact";
import Footer from "./Pages/Footer"; // ✅ Footer included
import Login from "./components/Login";
import Register from "./components/Register";

import "./App.css";
import logo from "./assets/logo.png"; // ✅ Ensure logo exists inside src/assets/

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="App">
        {/* ✅ Navigation Menu */}
        <nav className="navbar">
          <div className="logo">
            <img src={logo} alt="Logo" />
          </div>
          <ul className="nav-links">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/menu"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Menu
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/order"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Order Now
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/franchise"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Franchise
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/catering"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Catering
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                Contact
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* ✅ Page Routing */}
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/order" element={<Order />} />
            <Route path="/franchise" element={<Franchise />} />
            <Route path="/catering" element={<Catering />} />
            <Route path="/cateringmenu" element={<CateringMenu />} />{" "}
            {/* ✅ Added Catering Menu Route */}
            <Route path="/order" element={<Order />} />
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
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>

        {/* ✅ Footer Component */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
