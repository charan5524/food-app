import React from "react";
import "./LoadingSkeleton.css";

export const MenuItemSkeleton = () => {
  return (
    <div className="skeleton-menu-item">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-description">
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
        </div>
        <div className="skeleton-footer">
          <div className="skeleton-price"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
    </div>
  );
};

export const CategorySkeleton = () => {
  return (
    <div className="skeleton-category">
      <div className="skeleton-category-image"></div>
      <div className="skeleton-category-content">
        <div className="skeleton-category-title"></div>
        <div className="skeleton-category-text"></div>
      </div>
    </div>
  );
};

export default MenuItemSkeleton;

