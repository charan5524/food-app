import React, { useState, useEffect } from "react";
import { FaEdit, FaCheckCircle, FaTimesCircle, FaEnvelope, FaPhone, FaCalendarAlt, FaCamera, FaTimes } from "react-icons/fa";
import "./ProfileOverview.css";

const ProfileOverview = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    joinDate: user?.createdAt || new Date().toISOString(),
  });

  // Load profile picture from localStorage
  useEffect(() => {
    const savedPicture = localStorage.getItem("profilePicture");
    if (savedPicture) {
      setProfilePicture(savedPicture);
    }
  }, []);

  // Save profile picture to localStorage and notify parent
  useEffect(() => {
    if (profilePicture) {
      localStorage.setItem("profilePicture", profilePicture);
    } else {
      localStorage.removeItem("profilePicture");
    }
    // Dispatch event to update sidebar avatar
    window.dispatchEvent(new CustomEvent("profilePictureUpdated", { detail: profilePicture }));
  }, [profilePicture]);

  const handleSave = () => {
    // TODO: Implement API call to update profile
    setIsEditing(false);
    console.log("Profile updated:", profileData);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePicture = () => {
    setProfilePicture(null);
    localStorage.removeItem("profilePicture");
    window.dispatchEvent(new CustomEvent("profilePictureUpdated", { detail: null }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isEmailVerified = true; // TODO: Get from user data

  return (
    <div className="profile-overview">
      <div className="section-header">
        <h2>Profile Overview</h2>
        <p>Manage your personal information and account settings</p>
      </div>

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-container">
            <div className="profile-avatar-large">
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="avatar-image" />
              ) : (
                <span className="avatar-initials">
                  {profileData.name ? profileData.name.charAt(0).toUpperCase() : "U"}
                </span>
              )}
            </div>
            <div className="avatar-overlay">
              <label htmlFor="profile-picture-input" className="avatar-upload-btn">
                <FaCamera />
                <span>Change Photo</span>
              </label>
              <input
                id="profile-picture-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              {profilePicture && (
                <button
                  className="avatar-remove-btn"
                  onClick={handleRemovePicture}
                  title="Remove photo"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
          <div className="profile-info-header">
            <h3>{profileData.name || "User"}</h3>
            <div className="verification-badge">
              {isEmailVerified ? (
                <>
                  <FaCheckCircle className="verified-icon" />
                  <span>Verified Account</span>
                </>
              ) : (
                <>
                  <FaTimesCircle className="unverified-icon" />
                  <span>Unverified Account</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <div className="detail-label">
              <FaEnvelope />
              <span>Email Address</span>
            </div>
            <div className="detail-value">
              {isEditing ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  className="edit-input"
                />
              ) : (
                <span>{profileData.email || "Not provided"}</span>
              )}
              {isEmailVerified && !isEditing && (
                <span className="verified-tag">Verified</span>
              )}
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-label">
              <FaPhone />
              <span>Phone Number</span>
            </div>
            <div className="detail-value">
              {isEditing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  className="edit-input"
                  placeholder="+1 (555) 123-4567"
                />
              ) : (
                <span>{profileData.phone || "Not provided"}</span>
              )}
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-label">
              <FaCalendarAlt />
              <span>Member Since</span>
            </div>
            <div className="detail-value">
              <span>{formatDate(profileData.joinDate)}</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSave}>
                Save Changes
              </button>
            </>
          ) : (
            <button className="btn-primary" onClick={() => setIsEditing(true)}>
              <FaEdit />
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;

