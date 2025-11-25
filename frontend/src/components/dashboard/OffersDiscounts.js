import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTag, FaCopy, FaCheckCircle } from "react-icons/fa";
import { promoService } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import "./OffersDiscounts.css";

const OffersDiscounts = () => {
  const [copiedCode, setCopiedCode] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const response = await promoService.getActivePromoCodes();
      if (response.success) {
        const activePromos = response.promoCodes.map(promo => ({
          id: promo._id,
          code: promo.code,
          title: promo.code,
          discount:
            promo.discountType === "percentage"
              ? `${promo.discountValue}% OFF`
              : `₹${promo.discountValue} OFF`,
          description:
            promo.discountType === "percentage"
              ? `Get ${promo.discountValue}% off on your order`
              : `Get ₹${promo.discountValue} off on your order`,
          expiry: promo.expiryDate,
          type: promo.minOrderAmount > 0 ? "member" : "general",
          minOrderAmount: promo.minOrderAmount,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
        }));
        setOffers(activePromos);
      }
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      // Fallback to empty array if fetch fails
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = code => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleApplyNow = code => {
    // Store promo code in localStorage for Cart component to pick up
    localStorage.setItem("pendingPromoCode", code);
    // Navigate to cart page
    navigate("/cart");
    showToast(`Promo code ${code} will be applied in cart!`, "info");
  };

  if (loading) {
    return (
      <div className="offers-discounts">
        <div className="section-header">
          <h2>Offers & Discounts</h2>
          <p>Available promo codes and exclusive member offers</p>
        </div>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          Loading offers...
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="offers-discounts">
        <div className="section-header">
          <h2>Offers & Discounts</h2>
          <p>Available promo codes and exclusive member offers</p>
        </div>
        <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
          No active offers available at the moment. Check back soon!
        </div>
      </div>
    );
  }

  return (
    <div className="offers-discounts">
      <div className="section-header">
        <h2>Offers & Discounts</h2>
        <p>Available promo codes and exclusive member offers</p>
      </div>

      <div className="offers-grid">
        {offers.map(offer => (
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
              <span className="expiry-date">
                Expires: {formatDate(offer.expiry)}
              </span>
              <button
                className="btn-apply"
                onClick={() => handleApplyNow(offer.code)}
              >
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OffersDiscounts;
