import React, { useState } from "react";
import { FaTag, FaCopy, FaCheckCircle } from "react-icons/fa";
import "./OffersDiscounts.css";

const OffersDiscounts = () => {
  const [copiedCode, setCopiedCode] = useState(null);

  const offers = [
    {
      id: 1,
      code: "WELCOME20",
      title: "Welcome Offer",
      discount: "20% OFF",
      description: "Get 20% off on your first order",
      expiry: "2024-12-31",
      type: "member",
    },
    {
      id: 2,
      code: "SAVE15",
      title: "Weekend Special",
      discount: "15% OFF",
      description: "Enjoy 15% off on weekends",
      expiry: "2024-12-25",
      type: "general",
    },
    {
      id: 3,
      code: "FREESHIP",
      title: "Free Delivery",
      discount: "FREE",
      description: "Free delivery on orders above $50",
      expiry: "2024-12-20",
      type: "member",
    },
  ];

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="offers-discounts">
      <div className="section-header">
        <h2>Offers & Discounts</h2>
        <p>Available promo codes and exclusive member offers</p>
      </div>

      <div className="offers-grid">
        {offers.map((offer) => (
          <div key={offer.id} className="offer-card">
            <div className="offer-badge">
              {offer.type === "member" && (
                <span className="member-badge">Member Exclusive</span>
              )}
            </div>
            <div className="offer-header">
              <div className="offer-icon">
                <FaTag />
              </div>
              <div className="offer-title-section">
                <h3>{offer.title}</h3>
                <p className="offer-discount">{offer.discount}</p>
              </div>
            </div>
            <p className="offer-description">{offer.description}</p>
            <div className="offer-code-section">
              <div className="code-display">
                <span className="code-label">Promo Code:</span>
                <span className="code-value">{offer.code}</span>
              </div>
              <button
                className="btn-copy"
                onClick={() => copyToClipboard(offer.code)}
              >
                {copiedCode === offer.code ? (
                  <>
                    <FaCheckCircle />
                    Copied!
                  </>
                ) : (
                  <>
                    <FaCopy />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="offer-footer">
              <span className="expiry-date">Expires: {formatDate(offer.expiry)}</span>
              <button className="btn-apply">Apply Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OffersDiscounts;

