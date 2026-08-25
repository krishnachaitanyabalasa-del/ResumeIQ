import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaFileAlt, FaSignOutAlt, FaBars, FaTimes } from "react-icons/fa";
import "./UserNavbar.css";

export default function UserNavbar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userName = sessionStorage.getItem("name") || "User";

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const userInitials = getInitials(userName);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login-user");
  };

  const handleHomeClick = () => {
    setMobileMenuOpen(false);
    if (setActiveTab) setActiveTab("NOT_APPLIED");
    navigate("/user-home");
  };

  const handleDrivesClick = () => {
    setMobileMenuOpen(false);
    if (setActiveTab) setActiveTab("NOT_APPLIED");
    navigate("/user-home");
  };

  const handleApplicationsClick = () => {
    setMobileMenuOpen(false);
    if (setActiveTab) setActiveTab("APPLIED");
    navigate("/user-home");
  };

  return (
    <nav className="user-global-navbar">
      {/* BRAND LOGO LEFT */}
      <div className="user-nav-left" onClick={handleHomeClick}>
        <div className="user-nav-brand-icon">
          <FaFileAlt />
        </div>
        <div className="user-nav-brand-text">
          <h2>ResumeIQ</h2>
          <p>Find Best Opportunities. Apply. Get Matched.</p>
        </div>
      </div>

      {/* HAMBURGER TOGGLE BUTTON FOR MOBILE */}
      <button
        className="hamburger-toggle-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* NAV LINKS & USER PROFILE & RED LOGOUT */}
      <div className={`user-nav-right ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <div className="user-nav-links-row">
          <span
            className={`nav-link-item ${location.pathname === "/user-home" && activeTab !== "APPLIED" ? "active" : ""}`}
            onClick={handleHomeClick}
          >
            Home
          </span>
          <span
            className={`nav-link-item ${location.pathname === "/user-home" && activeTab !== "APPLIED" ? "active" : ""}`}
            onClick={handleDrivesClick}
          >
            Drives
          </span>
          <span
            className={`nav-link-item ${location.pathname === "/user-home" && activeTab === "APPLIED" ? "active" : ""}`}
            onClick={handleApplicationsClick}
          >
            My Applications
          </span>
        </div>

        <div className="user-profile-badge">
          <div className="user-avatar-circle">{userInitials}</div>
          <span className="user-name-text">{userName}</span>
        </div>

        {/* RED LOGOUT ICON BUTTON */}
        <button className="user-logout-btn" onClick={handleLogout} title="Logout">
          <FaSignOutAlt className="logout-red-icon" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
