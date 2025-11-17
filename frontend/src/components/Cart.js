import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { orderService } from "../services/api";
import { useToast } from "../context/ToastContext";
import "./Cart.css";

const Cart = ({ cartItems, onRemoveItem, onUpdateQuantity, onClearCart }) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Get user email from token if available
  const getUserEmail = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const user = JSON.parse(atob(token.split(".")[1]));
        return user.email || "";
      } catch (e) {
        return "";
      }
    }
    return "";
  };

  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    // Load user email from token
    const email = getUserEmail();
    if (email) {
      setCheckoutForm((prev) => ({ ...prev, email }));
    }
  }, []);

  useEffect(() => {
    // Reset form when cart is cleared
    if (cartItems.length === 0 && success) {
      setShowCheckout(false);
      setSuccess(false);
    }
  }, [cartItems.length, success]);

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const DELIVERY_FEE = 40;

  const calculateTotal = () => {
    return calculateSubtotal() + DELIVERY_FEE;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to place an order");
      setIsSubmitting(false);
      navigate("/login");
      return;
    }

    // Validate required fields
    if (!checkoutForm.name.trim() || !checkoutForm.address.trim() || !checkoutForm.phone.trim()) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        customerDetails: {
          name: checkoutForm.name.trim(),
          email: checkoutForm.email.trim() || getUserEmail(),
          phone: checkoutForm.phone.trim(),
          address: checkoutForm.address.trim(),
          city: "", // Optional field
          state: "", // Optional field
          zipCode: "", // Optional field
        },
        subtotal: calculateSubtotal(),
        deliveryFee: DELIVERY_FEE,
        total: calculateTotal(),
        status: "pending",
      };

      // Create the order using the order service
      const orderResult = await orderService.create(orderData);

      if (!orderResult.success) {
        throw new Error(orderResult.message || "Failed to create order");
      }

      // Send confirmation email if email is provided
      if (checkoutForm.email.trim() || getUserEmail()) {
        try {
          await orderService.sendConfirmation(
            checkoutForm.email.trim() || getUserEmail(),
            orderResult.orderId,
            orderData
          );
        } catch (emailError) {
          console.warn("Failed to send confirmation email:", emailError);
          // Don't fail the order if email fails
        }
      }

      // Show success message
      showToast("Order placed successfully! A confirmation email has been sent.", "success");
      setSuccess(true);

      // Reset form and clear cart
      const userEmail = getUserEmail();
      setCheckoutForm({
        name: "",
        address: "",
        phone: "",
        email: userEmail,
      });
      setShowCheckout(false);

      if (onClearCart) {
        onClearCart();
      }

      // Redirect to home or orders page after a short delay
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Error placing order:", error);
      setError(
        error.response?.data?.message ||
        error.message ||
        "Failed to place order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="success-message">
          Order placed successfully! Redirecting...
        </div>
      )}
      {cartItems.length === 0 ? (
        <div className="empty-cart-state">
          <p className="empty-cart">Your cart is empty</p>
          <button
            className="continue-shopping-btn"
            onClick={() => navigate("/menu")}
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-main">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-price">₹{item.price.toFixed(2)}</p>
                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="item-total">
                    <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      className="remove-button"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label="Remove item"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!showCheckout ? (
              <button
                className="checkout-button"
                onClick={() => setShowCheckout(true)}
              >
                Proceed to Checkout
              </button>
            ) : (
              <div className="checkout-section">
                <h3 className="checkout-title">Delivery Information</h3>
                <form className="checkout-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">
                      Full Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={checkoutForm.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      Phone Number <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={checkoutForm.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">
                      Delivery Address <span className="required">*</span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={checkoutForm.address}
                      onChange={handleInputChange}
                      placeholder="Enter your complete delivery address"
                      rows="3"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email (Optional)</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={checkoutForm.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email for order confirmation"
                      disabled={isSubmitting}
                    />
                    <small className="form-hint">
                      We'll send order confirmation to this email
                    </small>
                  </div>

                  <div className="form-buttons">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCheckout(false);
                        setError(null);
                      }}
                      disabled={isSubmitting}
                      className="back-button"
                    >
                      Back to Cart
                    </button>
                    <button
                      type="submit"
                      className="submit-order-button"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Placing Order..." : "Place Order"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-content">
              <div className="summary-row">
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
                <span>₹{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee:</span>
                <span>₹{DELIVERY_FEE.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            {!showCheckout && (
              <button
                className="checkout-button"
                onClick={() => setShowCheckout(true)}
              >
                Proceed to Checkout
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
