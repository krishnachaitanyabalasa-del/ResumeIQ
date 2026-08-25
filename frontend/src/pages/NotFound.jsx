import React from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaHome, FaExclamationTriangle } from "react-icons/fa";
import "./NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");

  const handleGoHome = () => {
    if (token) {
      if (role === "ADMIN" || role === "ROLE_ADMIN") {
        navigate("/admin-home");
      } else {
        navigate("/user-home");
      }
    } else {
      navigate("/");
    }
  };

  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <div className="not-found-badge">
          <FaExclamationTriangle /> 404 ERROR
        </div>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-desc">
          The page or URL route you are looking for does not exist, has been moved, or is temporarily unavailable.
        </p>
        <button className="not-found-btn" onClick={handleGoHome}>
          <FaHome /> Return to Home
        </button>
      </div>
    </div>
  );
}
