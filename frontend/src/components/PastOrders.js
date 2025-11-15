import React, { useState, useEffect } from "react";
import "./PastOrders.css";

const PastOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="past-orders">
      <h2>Your Order History</h2>
      {orders.length === 0 ? (
        <p className="no-orders">You haven't placed any orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <h3>Order #{order._id}</h3>
                <span className="order-date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="order-items">
                {order.items.map((item) => (
                  <div key={item._id} className="order-item">
                    <img src={item.image} alt={item.name} />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee:</span>
                  <span>₹{order.deliveryFee}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₹{order.total}</span>
                </div>
              </div>
              <div className="order-status">
                <span className={`status ${order.status.toLowerCase()}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastOrders;
