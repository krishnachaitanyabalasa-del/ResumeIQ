import React from "react";
import { useNavigate } from "react-router-dom";

export default function UserHomePage() {
  const navigate = useNavigate();
  const userName = sessionStorage.getItem("name") || "Applicant";

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login-user");
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Welcome to ResumeIQ, {userName}!</h1>
      <p style={{ color: "#64748B", marginTop: "8px" }}>Candidate Dashboard</p>
      <button 
        onClick={handleLogout}
        style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "#EF4444", color: "#FFF", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
      >
        Logout
      </button>
    </div>
  );
}
