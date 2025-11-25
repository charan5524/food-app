import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { orderService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import "./StripePayment.css";

// Initialize Stripe
const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

// Debug: Log the key (remove in production)
if (process.env.NODE_ENV === 'development') {
  console.log('Stripe Key loaded:', stripeKey ? 'Yes' : 'No', stripeKey ? `(${stripeKey.substring(0, 20)}...)` : '');
}

const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const PaymentForm = ({ amount, orderId, onSuccess, onError, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await orderService.createPaymentIntent({
          amount,
          orderId: orderId || null,
        });

        if (response.success) {
          setClientSecret(response.clientSecret);
        } else {
          setError(response.message || "Failed to initialize payment");
          onError(response.message || "Failed to initialize payment");
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to initialize payment";
        setError(errorMessage);
        onError(errorMessage);
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, orderId, onError]);

  const handleSubmit = async event => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (stripeError) {
        setError(stripeError.message);
        showToast(stripeError.message, "error");
        setIsProcessing(false);
        onError(stripeError.message);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        // Confirm payment on backend
        try {
          const confirmResponse = await orderService.confirmPayment({
            paymentIntentId: paymentIntent.id,
            orderId,
          });

          if (confirmResponse.success) {
            showToast("Payment successful!", "success");
            onSuccess(paymentIntent);
          } else {
            setError(confirmResponse.message || "Payment confirmation failed");
            onError(confirmResponse.message || "Payment confirmation failed");
          }
        } catch (err) {
          const errorMessage =
            err.response?.data?.message || "Payment confirmation failed";
          setError(errorMessage);
          onError(errorMessage);
        }
      }

      setIsProcessing(false);
    } catch (err) {
      const errorMessage = err.message || "Payment processing failed";
      setError(errorMessage);
      showToast(errorMessage, "error");
      setIsProcessing(false);
      onError(errorMessage);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  if (!clientSecret) {
    return (
      <div className="payment-loading">
        <p>Initializing payment...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-amount">
        <h3>Payment Amount</h3>
        <p className="amount-value">₹{amount.toFixed(2)}</p>
      </div>

      <div className="card-element-container">
        <label>Card Details</label>
        <div className="card-element-wrapper">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {error && <div className="payment-error">{error}</div>}

      <div className="payment-actions">
        <button
          type="button"
          onClick={onCancel}
          className="cancel-payment-btn"
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="submit-payment-btn"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? "Processing..." : `Pay ₹${amount.toFixed(2)}`}
        </button>
      </div>
    </form>
  );
};

const StripePayment = ({ amount, orderId, onSuccess, onError, onCancel }) => {
  const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  
  if (!stripeKey || !stripePromise) {
    return (
      <div className="payment-error">
        Stripe is not configured. Please set REACT_APP_STRIPE_PUBLISHABLE_KEY in
        your environment variables and restart your development server.
      </div>
    );
  }

  return (
    <div className="stripe-payment-container">
      <Elements stripe={stripePromise}>
        <PaymentForm
          amount={amount}
          orderId={orderId}
          onSuccess={onSuccess}
          onError={onError}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  );
};

export default StripePayment;
