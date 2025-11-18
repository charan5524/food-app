import React, { useState } from "react";
import { FaMoon, FaSun, FaLock, FaEnvelope, FaGlobe, FaTrash } from "react-icons/fa";
import "./Settings.css";

const Settings = ({ darkMode, setDarkMode }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    offers: true,
    language: "en",
  });

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleLanguageChange = (e) => {
    setSettings({ ...settings, language: e.target.value });
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      // TODO: Implement account deletion
      console.log("Account deletion requested");
    }
  };

  return (
    <div className="settings">
      <div className="section-header">
        <h2>Settings</h2>
        <p>Manage your account settings and preferences</p>
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <h3>Appearance</h3>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">
              <FaMoon className="setting-icon" />
              <div>
                <h4>Dark Mode</h4>
                <p>Switch between light and dark theme</p>
              </div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Notifications */}
      <div className="settings-section">
        <h3>Notifications</h3>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">
              <FaEnvelope className="setting-icon" />
              <div>
                <h4>Email Notifications</h4>
                <p>Receive notifications via email</p>
              </div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={() => handleToggle("emailNotifications")}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">
              <FaEnvelope className="setting-icon" />
              <div>
                <h4>Order Updates</h4>
                <p>Get notified about order status changes</p>
              </div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.orderUpdates}
              onChange={() => handleToggle("orderUpdates")}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">
              <FaEnvelope className="setting-icon" />
              <div>
                <h4>Offers & Promotions</h4>
                <p>Receive notifications about special offers</p>
              </div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.offers}
              onChange={() => handleToggle("offers")}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Preferences */}
      <div className="settings-section">
        <h3>Preferences</h3>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">
              <FaGlobe className="setting-icon" />
              <div>
                <h4>Language</h4>
                <p>Choose your preferred language</p>
              </div>
            </div>
          </div>
          <select
            className="language-select"
            value={settings.language}
            onChange={handleLanguageChange}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>

      {/* Security */}
      <div className="settings-section">
        <h3>Security</h3>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">
              <FaLock className="setting-icon" />
              <div>
                <h4>Change Password</h4>
                <p>Update your account password</p>
              </div>
            </div>
          </div>
          <button className="btn-change-password">Change Password</button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section danger-zone">
        <h3>Danger Zone</h3>
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">
              <FaTrash className="setting-icon danger" />
              <div>
                <h4>Delete Account</h4>
                <p>Permanently delete your account and all data</p>
              </div>
            </div>
          </div>
          <button className="btn-delete-account" onClick={handleDeleteAccount}>
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

