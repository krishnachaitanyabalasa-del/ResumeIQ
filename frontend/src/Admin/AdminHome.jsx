import React from "react";
import { useNavigate } from "react-router-dom";

export default function AdminHome() {
  const navigate = useNavigate();
  const adminName = sessionStorage.getItem("name") || "Admin";

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login-admin");
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Welcome to Recruiter Portal, {adminName}!</h1>
      <p style={{ color: "#64748B", marginTop: "8px" }}>HR & Hiring Drive Management Dashboard</p>
      <button 
        onClick={handleLogout}
        style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "#EF4444", color: "#FFF", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
      >
        Logout
      </button>
    </div>
  );
}
