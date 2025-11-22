import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { orderService } from "../services/api";
import { useToast } from "../context/ToastContext";
import { searchAddress, parseAddressComponents } from "../utils/addressAutocomplete";
import "./Cart.css";

const Cart = ({ cartItems, onRemoveItem, onUpdateQuantity, onClearCart }) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
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
    city: "",
    state: "",
    zipCode: "",
  });

  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [addressAutocomplete, setAddressAutocomplete] = useState(null);
  const addressInputRef = useRef(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const addressSearchTimeoutRef = useRef(null);

  // Set minimum date to today
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Set maximum date to 30 days from now
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split("T")[0];
  };

  // Free address autocomplete using OpenStreetMap (no API key needed)
  const handleAddressInput = async (e) => {
    const value = e.target.value;
    handleInputChange(e);

    // Clear previous timeout
    if (addressSearchTimeoutRef.current) {
      clearTimeout(addressSearchTimeoutRef.current);
    }

    // If input is too short, clear suggestions
    if (value.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce search (wait 500ms after user stops typing)
    addressSearchTimeoutRef.current = setTimeout(async () => {
      setIsLoadingAddress(true);
      const suggestions = await searchAddress(value);
      setAddressSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
      setIsLoadingAddress(false);
    }, 500);
  };

  const handleSelectAddress = (suggestion) => {
    const components = parseAddressComponents(suggestion.address);
    const fullAddress = suggestion.display;

    setCheckoutForm((prev) => ({
      ...prev,
      address: fullAddress,
      city: components.city,
      state: components.state,
      zipCode: components.zipCode,
    }));

    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  // Try Google Places API if API key is available (optional, better UX)
  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY;
    
    if (!apiKey || !showCheckout || !addressInputRef.current) {
      return;
    }

    // Check if script is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      initializeGooglePlaces();
      return;
    }

    // Load Google Places API script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeGooglePlaces;
    document.head.appendChild(script);

    function initializeGooglePlaces() {
      if (!window.google?.maps?.places || !addressInputRef.current) return;

      const autocomplete = new window.google.maps.places.Autocomplete(
        addressInputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: ["in", "us"] },
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry) return;

        let streetNumber = "";
        let route = "";
        let city = "";
        let state = "";
        let zipCode = "";
        let fullAddress = place.formatted_address || "";

        place.address_components.forEach((component) => {
          const types = component.types;
          if (types.includes("street_number")) streetNumber = component.long_name;
          if (types.includes("route")) route = component.long_name;
          if (types.includes("locality") || types.includes("administrative_area_level_2")) {
            city = component.long_name;
          }
          if (types.includes("administrative_area_level_1")) state = component.short_name;
          if (types.includes("postal_code")) zipCode = component.long_name;
        });

        const addressParts = [streetNumber, route].filter(Boolean);
        const formattedAddress = addressParts.length > 0 
          ? `${addressParts.join(" ")}, ${fullAddress}` 
          : fullAddress;

        setCheckoutForm((prev) => ({
          ...prev,
          address: formattedAddress,
          city: city,
          state: state,
          zipCode: zipCode,
        }));
      });

      setAddressAutocomplete(autocomplete);
    }
  }, [showCheckout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (addressSearchTimeoutRef.current) {
        clearTimeout(addressSearchTimeoutRef.current);
      }
    };
  }, []);

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
    if (validationErrors.length > 0) setValidationErrors([]);
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

    // Clear previous errors
    setError(null);
    setValidationErrors([]);

    // Validate required fields
    if (!checkoutForm.name.trim() || !checkoutForm.address.trim() || !checkoutForm.phone.trim()) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    // Validate scheduled order if enabled
    if (isScheduled) {
      if (!scheduledDate || !scheduledTime) {
        setError("Please select both date and time for scheduled order");
        setIsSubmitting(false);
        return;
      }

      // Validate date is not in the past
      const selectedDate = new Date(scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        setError("Scheduled date cannot be in the past");
        setIsSubmitting(false);
        return;
      }

      // If scheduled for today, validate time
      if (selectedDate.getTime() === today.getTime()) {
        const [hours, minutes] = scheduledTime.split(":").map(Number);
        const scheduledDateTime = new Date(scheduledDate);
        scheduledDateTime.setHours(hours, minutes, 0, 0);

        if (scheduledDateTime < new Date()) {
          setError("Scheduled time cannot be in the past");
          setIsSubmitting(false);
          return;
        }
      }
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
          email: checkoutForm.email.trim() || getUserEmail() || undefined,
          phone: checkoutForm.phone.trim(),
          address: checkoutForm.address.trim(),
          city: checkoutForm.city.trim(),
          state: checkoutForm.state.trim(),
          zipCode: checkoutForm.zipCode.trim(),
        },
        subtotal: calculateSubtotal(),
        deliveryFee: DELIVERY_FEE,
        total: calculateTotal(),
        status: "pending",
        isScheduled: isScheduled,
        scheduledDate: isScheduled ? scheduledDate : null,
        scheduledTime: isScheduled ? scheduledTime : null,
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
      const successMessage = isScheduled
        ? `Scheduled order placed successfully! Your order is scheduled for ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime}. A confirmation email has been sent.`
        : "Order placed successfully! A confirmation email has been sent.";
      showToast(successMessage, "success");
      setSuccess(true);

      // Reset form and clear cart
      const userEmail = getUserEmail();
      setCheckoutForm({
        name: "",
        address: "",
        phone: "",
        email: userEmail,
        city: "",
        state: "",
        zipCode: "",
      });
      setIsScheduled(false);
      setScheduledDate("");
      setScheduledTime("");
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
      
      // Handle validation errors from backend
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errors = error.response.data.errors;
        setValidationErrors(errors);
        // Set a general error message
        setError("Please fix the errors below and try again.");
      } else {
        // Handle other errors
        setError(
          error.response?.data?.message ||
          error.message ||
          "Failed to place order. Please try again."
        );
        setValidationErrors([]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {error && (
        <div className="error-message">
          {error}
          {validationErrors.length > 0 && (
            <ul className="validation-errors-list">
              {validationErrors.map((err, index) => (
                <li key={index}>
                  {err.msg || err.message || "Invalid field"}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
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
                onClick={() => {
                  setShowCheckout(true);
                  setError(null);
                  setValidationErrors([]);
                }}
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

                  <div className="form-group address-autocomplete-wrapper">
                    <label htmlFor="address">
                      Delivery Address <span className="required">*</span>
                    </label>
                    <div className="address-input-container">
                      <input
                        ref={addressInputRef}
                        type="text"
                        id="address"
                        name="address"
                        value={checkoutForm.address}
                        onChange={handleAddressInput}
                        onFocus={() => {
                          if (addressSuggestions.length > 0) {
                            setShowSuggestions(true);
                          }
                        }}
                        onBlur={() => {
                          // Delay hiding suggestions to allow click
                          setTimeout(() => setShowSuggestions(false), 200);
                        }}
                        placeholder="Start typing your address..."
                        required
                        disabled={isSubmitting}
                        autoComplete="off"
                      />
                      {isLoadingAddress && (
                        <span className="address-loading">Searching...</span>
                      )}
                    </div>
                    {showSuggestions && addressSuggestions.length > 0 && (
                      <ul className="address-suggestions">
                        {addressSuggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            onClick={() => handleSelectAddress(suggestion)}
                            className="address-suggestion-item"
                          >
                            {suggestion.display}
                          </li>
                        ))}
                      </ul>
                    )}
                    <small className="form-hint">
                      Start typing and select from suggestions to auto-fill address details
                    </small>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={checkoutForm.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        disabled={isSubmitting}
                        readOnly
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="state">State</label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={checkoutForm.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        disabled={isSubmitting}
                        readOnly
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="zipCode">Zip Code</label>
                      <input
                        type="text"
                        id="zipCode"
                        name="zipCode"
                        value={checkoutForm.zipCode}
                        onChange={handleInputChange}
                        placeholder="Zip Code"
                        disabled={isSubmitting}
                        readOnly
                      />
                    </div>
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

                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={isScheduled}
                        onChange={(e) => {
                          setIsScheduled(e.target.checked);
                          if (!e.target.checked) {
                            setScheduledDate("");
                            setScheduledTime("");
                          }
                        }}
                        disabled={isSubmitting}
                      />
                      <span>Schedule this order for later</span>
                    </label>
                  </div>

                  {isScheduled && (
                    <>
                      <div className="form-group">
                        <label htmlFor="scheduledDate">
                          Scheduled Date <span className="required">*</span>
                        </label>
                        <input
                          type="date"
                          id="scheduledDate"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          min={getMinDate()}
                          max={getMaxDate()}
                          disabled={isSubmitting}
                          required={isScheduled}
                        />
                        <small className="form-hint">
                          Select a date within the next 30 days
                        </small>
                      </div>

                      <div className="form-group">
                        <label htmlFor="scheduledTime">
                          Scheduled Time <span className="required">*</span>
                        </label>
                        <input
                          type="time"
                          id="scheduledTime"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          disabled={isSubmitting}
                          required={isScheduled}
                        />
                        <small className="form-hint">
                          Select your preferred delivery time
                        </small>
                      </div>
                    </>
                  )}

                  <div className="form-buttons">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCheckout(false);
                        setError(null);
                        setValidationErrors([]);
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
                onClick={() => {
                  setShowCheckout(true);
                  setError(null);
                  setValidationErrors([]);
                }}
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
