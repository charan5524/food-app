# Stripe Payment Integration Setup Guide

This guide will help you set up Stripe payment integration for the food delivery app.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Stripe API keys (available in your Stripe Dashboard)

## Backend Setup

### 1. Install Dependencies

The Stripe package is already installed. If you need to reinstall:

```bash
cd backend
npm install stripe
```

### 2. Environment Variables

Add the following environment variables to your `backend/.env` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...  # Your Stripe Secret Key (test mode)
STRIPE_WEBHOOK_SECRET=whsec_...  # Your Stripe Webhook Secret (for production)
```

**Getting your Stripe keys:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Secret key** (starts with `sk_test_` for test mode)
3. For webhook secret, see the Webhook Setup section below

### 3. Webhook Setup (For Production)

For production, you need to set up webhooks to handle payment events:

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Set the endpoint URL to: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`) and add it to your `.env` file

**For local development/testing:**
- Use Stripe CLI: `stripe listen --forward-to localhost:5000/api/webhooks/stripe`
- The CLI will provide a webhook secret for local testing

## Frontend Setup

### 1. Install Dependencies

The Stripe React packages are already installed. If you need to reinstall:

```bash
cd frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Environment Variables

Add the following environment variable to your `frontend/.env` file:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Your Stripe Publishable Key
```

**Getting your Publishable key:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_` for test mode)

## Testing

### Test Cards

Use these test card numbers in Stripe test mode:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires Authentication:** `4000 0025 0000 3155`

Use any:
- Future expiry date (e.g., 12/34)
- Any 3-digit CVC
- Any ZIP code

### Testing Flow

1. Add items to cart
2. Proceed to checkout
3. Fill in delivery information
4. Click "Place Order"
5. You'll be redirected to the payment page
6. Enter test card details
7. Complete payment

## Payment Flow

1. **Order Creation:** User fills checkout form and creates order
2. **Payment Intent:** Backend creates a Stripe Payment Intent
3. **Payment Form:** User enters card details in Stripe Elements
4. **Payment Confirmation:** Stripe processes payment
5. **Order Update:** Backend confirms payment and updates order status
6. **Success:** User receives confirmation and order is processed

## Order Model Updates

The Order model now includes:
- `paymentStatus`: "pending" | "paid" | "failed" | "refunded"
- `paymentIntentId`: Stripe Payment Intent ID
- `paymentMethod`: Payment method type (e.g., "card")

## Security Notes

1. **Never expose your Secret Key** in frontend code
2. Always use environment variables for sensitive keys
3. Use HTTPS in production
4. Validate webhook signatures in production
5. Use Stripe's test mode for development

## Troubleshooting

### Payment not working?
- Check that all environment variables are set correctly
- Verify Stripe keys are in the correct format
- Check browser console for errors
- Check backend logs for payment intent creation errors

### Webhook not receiving events?
- Verify webhook URL is correct
- Check webhook secret matches your environment variable
- Ensure webhook endpoint is accessible (use Stripe CLI for local testing)

## Production Deployment

1. Switch to Stripe live mode
2. Update environment variables with live keys
3. Set up production webhook endpoint
4. Update frontend with live publishable key
5. Test thoroughly before going live

## Support

For Stripe-specific issues, refer to:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

