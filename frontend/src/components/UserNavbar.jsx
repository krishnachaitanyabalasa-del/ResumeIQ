import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaFileAlt, FaSignOutAlt } from "react-icons/fa";
import "./UserNavbar.css";

export default function UserNavbar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <nav className="user-global-navbar">
      {/* BRAND LOGO LEFT */}
      <div className="user-nav-left" onClick={() => navigate("/")}>
        <div className="user-nav-brand-icon">
          <FaFileAlt />
        </div>
        <div className="user-nav-brand-text">
          <h2>ResumeIQ</h2>
          <p>Find Best Opportunities. Apply. Get Matched.</p>
        </div>
      </div>

      {/* NAV LINKS (HOME, DRIVES, MY APPLICATIONS) & USER PROFILE & RED LOGOUT */}
      <div className="user-nav-right">
        <div className="user-nav-links-row">
          <span
            className={`nav-link-item ${location.pathname === "/" ? "active" : ""}`}
            onClick={() => navigate("/")}
          >
            Home
          </span>
          <span
            className={`nav-link-item ${location.pathname === "/user-home" && activeTab !== "APPLIED" ? "active" : ""}`}
            onClick={() => {
              if (setActiveTab) setActiveTab("NOT_APPLIED");
              navigate("/user-home");
            }}
          >
            Drives
          </span>
          <span
            className={`nav-link-item ${location.pathname === "/user-home" && activeTab === "APPLIED" ? "active" : ""}`}
            onClick={() => {
              if (setActiveTab) setActiveTab("APPLIED");
              navigate("/user-home");
            }}
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
