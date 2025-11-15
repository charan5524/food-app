import React, { useState } from "react";
import "./Cart.css";

const Cart = ({ cartItems, onRemoveItem, onUpdateQuantity, onClearCart }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to place an order");
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
        customerDetails: paymentDetails,
        subtotal: calculateTotal(),
        deliveryFee: 40,
        total: calculateTotal() + 40,
        status: "pending",
      };

      console.log("Sending order data:", orderData);

      // First, create the order
      const orderResponse = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderResult.message || "Failed to create order");
      }

      console.log("Order created successfully:", orderResult);

      // Then, send the confirmation email
      const emailResponse = await fetch(
        "http://localhost:5000/api/orders/send-order-confirmation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: paymentDetails.email,
            orderId: orderResult.orderId,
            orderDetails: orderData,
          }),
        }
      );

      if (!emailResponse.ok) {
        const emailError = await emailResponse.json();
        throw new Error(
          emailError.message || "Failed to send confirmation email"
        );
      }

      alert(
        "Order placed successfully! A confirmation email has been sent to your email address."
      );

      // Reset form and cart
      setShowPayment(false);
      setPaymentDetails({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
      });

      if (onClearCart) {
        onClearCart();
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setError(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {error && <div className="error-message">{error}</div>}
      {cartItems.length === 0 ? (
        <p className="empty-cart">Your cart is empty</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p>₹{item.price}</p>
                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  className="remove-button"
                  onClick={() => onRemoveItem(item.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{calculateTotal()}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee:</span>
              <span>₹40</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{calculateTotal() + 40}</span>
            </div>

            {!showPayment ? (
              <button
                className="checkout-button"
                onClick={() => setShowPayment(true)}
              >
                Proceed to Payment
              </button>
            ) : (
              <form className="payment-form" onSubmit={handleSubmit}>
                <h3>Payment Details</h3>

                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={paymentDetails.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={paymentDetails.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={paymentDetails.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Delivery Address</label>
                  <input
                    type="text"
                    name="address"
                    value={paymentDetails.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={paymentDetails.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={paymentDetails.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={paymentDetails.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={paymentDetails.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={paymentDetails.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={paymentDetails.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      required
                    />
                  </div>
                </div>

                <div className="form-buttons">
                  <button
                    type="button"
                    onClick={() => setShowPayment(false)}
                    disabled={isSubmitting}
                  >
                    Back to Cart
                  </button>
                  <button
                    type="submit"
                    className="pay-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Pay Now"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
