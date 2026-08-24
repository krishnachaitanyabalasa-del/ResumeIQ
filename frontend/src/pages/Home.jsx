import React from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaUser, FaShieldAlt, FaArrowRight } from "react-icons/fa";
import "./Login.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #F5F3FF 0%, #EFF6FF 100%)", padding: "20px" }}>
      <div style={{ textAlign: "center", maxWidth: "600px" }}>
        <div style={{ width: "60px", height: "60px", background: "linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontSize: "28px", margin: "0 auto 16px" }}>
          <FaFileAlt />
        </div>
        <h1 style={{ fontSize: "36px", fontWeight: "800", color: "#0F172A", letterSpacing: "-1px" }}>ResumeIQ</h1>
        <p style={{ fontSize: "16px", color: "#64748B", marginTop: "8px", lineHeight: "1.5" }}>
          AI-Powered Resume Screening & Candidate Matching Platform. Connect talent with opportunities effortlessly.
        </p>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "32px" }}>
          <button className="submit-btn" style={{ width: "auto", padding: "14px 28px" }} onClick={() => navigate("/login-user")}>
            <FaUser /> User Portal <FaArrowRight />
          </button>
          <button className="submit-btn" style={{ width: "auto", padding: "14px 28px", backgroundColor: "#1E1B4B" }} onClick={() => navigate("/login-admin")}>
            <FaShieldAlt /> Admin Portal <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
