import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Cart from "../components/Cart";
import "./CartPage.css";

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

  return (
    <div className="cart-page">
      <div className="cart-page-header">
        <h1>Shopping Cart</h1>
        {cartItems.length > 0 && (
          <Link to="/menu" className="continue-shopping">
            ← Continue Shopping
          </Link>
        )}
      </div>
      <Cart
        cartItems={cartItems}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onClearCart={clearCart}
      />
    </div>
  );
};

export default CartPage;

