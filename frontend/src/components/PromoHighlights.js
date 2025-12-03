import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCopy,
  FaCheckCircle,
  FaTag,
  FaClock,
  FaFire,
  FaGift,
  FaPercent,
  FaHourglassHalf,
} from "react-icons/fa";
import { promoService } from "../services/api";
import "./PromoHighlights.css";

const PromoHighlights = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchPromos = async () => {
      try {
        const response = await promoService.getActivePromoCodes();
        if (isMounted && response?.success) {
          setPromos(response.promoCodes || []);
        }
      } catch (error) {
        console.error("Error fetching promo codes:", error);
        if (isMounted) {
          setPromos([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPromos();
    return () => {
      isMounted = false;
    };
  }, []);

  const copyCode = code => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleUsePromo = code => {
    localStorage.setItem("pendingPromoCode", code);
    navigate("/cart");
  };

  const formatDiscount = promo => {
    return promo.discountType === "percentage"
      ? `${promo.discountValue}% OFF`
      : `₹${promo.discountValue} OFF`;
  };

  const formatDate = date => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isExpiringSoon = expiryDate => {
    const diff =
      (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 3;
  };

  const isNewPromo = createdAt => {
    const diff =
      (new Date().getTime() - new Date(createdAt).getTime()) /
      (1000 * 60 * 60 * 24);
    return diff <= 7;
  };

  const renderSkeleton = () => (
    <div className="promo-grid">
      {[1, 2, 3].map(index => (
        <div key={index} className="promo-highlight-card skeleton">
          <div className="skeleton-badge" />
          <div className="skeleton-line w-60" />
          <div className="skeleton-line w-80" />
          <div className="skeleton-line w-40" />
          <div className="skeleton-actions">
            <div className="skeleton-pill w-50" />
            <div className="skeleton-pill w-40" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="promo-empty-state">
      <FaTag size={48} />
      <h3>No active promo codes right now</h3>
      <p>New deals drop frequently. Check again a little later.</p>
    </div>
  );

  const visiblePromos = promos.slice(0, 4);
  const highestDiscount = promos.reduce((acc, promo) => {
    if (promo.discountType === "percentage") {
      return Math.max(acc, promo.discountValue);
    }
    // convert fixed to pseudo percentage? better to just note rupee? maybe convert to string
    return acc;
  }, 0);

  const topFixedDiscount = promos.reduce((acc, promo) => {
    if (promo.discountType === "fixed") {
      return Math.max(acc, promo.discountValue);
    }
    return acc;
  }, 0);

  const nextExpiring = promos
    .slice()
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))[0];

  const metrics = [
    {
      icon: <FaGift />,
      label: "Active Deals",
      value: promos.length || "0",
      helper: "Available right now",
    },
    {
      icon: <FaPercent />,
      label: "Top Discount",
      value:
        highestDiscount > 0
          ? `${highestDiscount}%`
          : topFixedDiscount > 0
          ? `₹${topFixedDiscount}`
          : "—",
      helper: highestDiscount > 0 ? "Best percentage off" : "Best flat savings",
    },
    {
      icon: <FaHourglassHalf />,
      label: "Next Expiring",
      value: nextExpiring ? formatDate(nextExpiring.expiryDate) : "Soon",
      helper: nextExpiring ? nextExpiring.code : "Waiting for drop",
    },
  ];

  return (
    <section className="promo-highlights">
      <div className="section-header">
        <div>
          <h2>Latest Promo Codes</h2>
          <p>Fresh drops curated by the <span style={{whiteSpace: 'nowrap'}}>admin team for instant</span> savings.</p>
        </div>
        {promos.length > 4 && (
          <span className="promo-count-pill">{promos.length} active</span>
        )}
      </div>

      {!loading && !!promos.length && (
        <div className="promo-metrics">
          {metrics.map(metric => (
            <div key={metric.label} className="metric-card">
              <div className="metric-icon">{metric.icon}</div>
              <div className="metric-info">
                <span className="metric-label">{metric.label}</span>
                <span className="metric-value">{metric.value}</span>
                <span className="metric-helper">{metric.helper}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && renderSkeleton()}
      {!loading && !promos.length && renderEmptyState()}

      {!loading && !!promos.length && (
        <div className="promo-grid">
          {visiblePromos.map(promo => (
            <div
              key={promo._id || promo.code}
              className={`promo-highlight-card ${
                isExpiringSoon(promo.expiryDate) ? "is-expiring" : ""
              }`}
            >
              <div className="promo-card-top">
                <div className="promo-badges">
                  {isNewPromo(promo.createdAt) && (
                    <span className="badge badge-new">New</span>
                  )}
                  {isExpiringSoon(promo.expiryDate) && (
                    <span className="badge badge-hot">
                      <FaFire /> Ending soon
                    </span>
                  )}
                  {promo.minOrderAmount > 0 ? (
                    <span className="badge badge-member">Member Deal</span>
                  ) : (
                    <span className="badge badge-general">Open to all</span>
                  )}
                </div>
                {promo.usageLimit && (
                  <span className="badge badge-light">
                    {promo.usageLimit - (promo.usedCount || 0)} left
                  </span>
                )}
              </div>

              <div className="promo-icon">
                <FaTag />
              </div>

              <div className="promo-info">
                <div className="promo-code-row">
                  <h3>{promo.code}</h3>
                  <button
                    className={`copy-chip ${
                      copiedCode === promo.code ? "copied" : ""
                    }`}
                    onClick={() => copyCode(promo.code)}
                    aria-label={`Copy ${promo.code}`}
                  >
                    {copiedCode === promo.code ? (
                      <>
                        <FaCheckCircle /> Copied
                      </>
                    ) : (
                      <>
                        <FaCopy /> Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="promo-discount">{formatDiscount(promo)}</p>
                {promo.minOrderAmount > 0 && (
                  <p className="promo-min-order">
                    Min order ₹{promo.minOrderAmount}
                  </p>
                )}
                <div className="promo-meta">
                  <span>
                    <FaClock /> Valid till {formatDate(promo.expiryDate)}
                  </span>
                  {promo.discountType === "percentage" && (
                    <span>{promo.discountValue}% savings</span>
                  )}
                </div>
              </div>

              <div className="promo-actions">
                <button className="apply-btn" onClick={() => handleUsePromo(promo.code)}>
                  Apply &amp; checkout
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PromoHighlights;

