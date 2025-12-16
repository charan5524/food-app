import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Order.css"; // Import CSS
import { FaMotorcycle, FaShoppingBag } from "react-icons/fa"; // Import Icons

function Order() {
  const [orderType, setOrderType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const redirectExecuted = useRef(false);

  // Set background image dynamically (Fixed path issue)
  const getBackgroundImage = () => {
    if (orderType === "pickup") {
      return `url(${process.env.PUBLIC_URL + "/images/pickup-bg.jpg"})`;
    } else if (orderType === "delivery") {
      return `url(${process.env.PUBLIC_URL + "/images/delivery-bg.jpg"})`;
    }
    return `url(${
      process.env.PUBLIC_URL + "/images/shreyak-singh-0j4bisyPo3M-unsplash.jpg"
    })`;
  };

  const handleSelection = type => {
    // Prevent multiple executions
    if (redirectExecuted.current || orderType) {
      return;
    }

    setOrderType(type);
    setIsLoading(true);
    redirectExecuted.current = true;

    setTimeout(() => {
      setIsLoading(false);
      // Redirect to menu for both pickup and delivery
      navigate("/menu");
    }, 1500);
  };

  return (
    <div
      className="order-container fade-in"
      style={{
        backgroundImage: getBackgroundImage(),
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background 0.5s ease-in-out",
      }}
    >
      <div className="overlay glassmorphism">
        <h1 className="fade-in">How Would You Like to Order?</h1>
        {!orderType ? (
          <div className="order-selection">
            <button
              onClick={() => handleSelection("pickup")}
              className="btn"
              disabled={isLoading}
            >
              <FaShoppingBag className="icon" /> Order for Pickup
            </button>
            <button
              onClick={() => handleSelection("delivery")}
              className="btn"
              disabled={isLoading}
            >
              <FaMotorcycle className="icon" /> Order for Delivery
            </button>
          </div>
        ) : (
          <div className="order-confirmation fade-in">
            <h2>
              You selected: {orderType === "pickup" ? "Pickup" : "Delivery"}
            </h2>
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <p>Redirecting to menu...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Order;
