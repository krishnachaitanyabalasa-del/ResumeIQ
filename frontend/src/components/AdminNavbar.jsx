import React from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaBell, FaSignOutAlt } from "react-icons/fa";
import "./AdminNavbar.css";

export default function AdminNavbar() {
  const navigate = useNavigate();

  const adminName = sessionStorage.getItem("name") || "Admin";

  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  const adminInitials = getInitials(adminName);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login-admin");
  };

  return (
    <nav className="admin-global-navbar">
      {/* BRAND LOGO LEFT */}
      <div className="admin-nav-left" onClick={() => navigate("/admin-home")}>
        <div className="admin-nav-brand-icon">
          <FaFileAlt />
        </div>
        <div className="admin-nav-brand-text">
          <h2>ResumeIQ Admin</h2>
          <p>Recruiter & HR Admin Portal</p>
        </div>
      </div>

      {/* ADMIN PROFILE & RED LOGOUT BUTTON */}
      <div className="admin-nav-right">
        <div className="notification-btn" title="Notifications">
          <FaBell />
          <span className="notification-badge">3</span>
        </div>

        <div className="admin-profile-badge">
          <div className="admin-avatar-circle">{adminInitials}</div>
          <span className="admin-name-text">{adminName}</span>
        </div>

        {/* RED LOGOUT ICON BUTTON */}
        <button className="admin-logout-btn" onClick={handleLogout} title="Logout">
          <FaSignOutAlt className="logout-red-icon" />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
