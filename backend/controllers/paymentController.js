const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");

const MIN_STRIPE_USD_CENTS = 50;
const MIN_INR_CHARGE = 50; // Ensure INR payments stay above Stripe's 50¢ USD minimum after conversion

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { amount, orderId, currency = "inr" } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const currencyCode = currency.toLowerCase();

    if (currencyCode === "inr" && amount < MIN_INR_CHARGE) {
      return res.status(400).json({
        success: false,
        message: `Stripe requires at least 50¢ USD, so the minimum payable amount is ₹${MIN_INR_CHARGE}. Please add more items to your cart.`,
      });
    }

    // Convert amount to smallest currency unit (paise for INR)
    const amountInSmallestUnit = Math.round(amount * 100);

    if (amountInSmallestUnit < MIN_STRIPE_USD_CENTS) {
      return res.status(400).json({
        success: false,
        message:
          "Amount must be at least $0.50 USD after conversion. Please increase the order total.",
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: currencyCode,
      metadata: {
        userId: req.user.id,
        orderId: orderId || "pending",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment intent",
    });
  }
};

// Confirm payment and update order
exports.confirmPayment = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { paymentIntentId, orderId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: "Payment intent ID is required",
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${paymentIntent.status}`,
      });
    }

    // Update order with payment information
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.userId.toString() === req.user.id) {
        order.paymentStatus = "paid";
        order.paymentIntentId = paymentIntentId;
        order.paymentMethod = paymentIntent.payment_method_types[0] || "card";
        await order.save();
      }
    }

    res.json({
      success: true,
      message: "Payment confirmed successfully",
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
      },
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to confirm payment",
    });
  }
};

// Webhook handler for Stripe events
exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("PaymentIntent succeeded:", paymentIntent.id);

      // Update order payment status
      if (
        paymentIntent.metadata.orderId &&
        paymentIntent.metadata.orderId !== "pending"
      ) {
        try {
          const order = await Order.findById(paymentIntent.metadata.orderId);
          if (order) {
            order.paymentStatus = "paid";
            order.paymentIntentId = paymentIntent.id;
            order.paymentMethod =
              paymentIntent.payment_method_types[0] || "card";
            await order.save();
            console.log(`Order ${order._id} payment status updated to paid`);
          }
        } catch (error) {
          console.error("Error updating order payment status:", error);
        }
      }
      break;

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object;
      console.log("PaymentIntent failed:", failedPayment.id);

      // Update order payment status
      if (
        failedPayment.metadata.orderId &&
        failedPayment.metadata.orderId !== "pending"
      ) {
        try {
          const order = await Order.findById(failedPayment.metadata.orderId);
          if (order) {
            order.paymentStatus = "failed";
            order.paymentIntentId = failedPayment.id;
            await order.save();
            console.log(`Order ${order._id} payment status updated to failed`);
          }
        } catch (error) {
          console.error("Error updating order payment status:", error);
        }
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
