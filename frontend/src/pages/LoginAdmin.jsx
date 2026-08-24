import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/apiService";
import "./Login.css";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaUserPlus,
  FaArrowRight,
  FaBuilding,
  FaUserCheck,
  FaFileAlt,
  FaArrowLeft
} from "react-icons/fa";

export default function LoginAdmin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowError(false);
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await authApi.loginAdmin({
        email: form.email,
        password: form.password
      });

      const data = response.data;
      if (!data || !data.token) {
        throw new Error("No token received from server");
      }

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("role", "ADMIN");
      sessionStorage.setItem("email", data.email || form.email);
      sessionStorage.setItem("adminId", data.id || "");
      sessionStorage.setItem("name", data.name || "");

      setLoading(false);
      navigate("/admin-home");
    } catch (error) {
      console.error("Admin Login Error:", error);
      let message = "Invalid admin email or password";
      if (error.response && error.response.data) {
        if (typeof error.response.data === "string") {
          message = error.response.data;
        } else if (error.response.data.message) {
          message = error.response.data.message;
        }
      }
      setErrorMessage(message);
      setShowError(true);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* LEFT SIDE PANEL */}
      <div className="login-left">
        <div className="brand-header" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          <div className="brand-icon">
            <FaFileAlt />
          </div>
          <div className="brand-text">
            <h2>ResumeIQ</h2>
            <p>Find Best Opportunities. Apply. Get Matched.</p>
          </div>
        </div>

        <div className="left-content">
          <h1 className="hero-headline">
            Recruiter & HR
            <span className="highlight">Admin Portal</span>
          </h1>

          <p className="hero-subtext">
            Create hiring drives, parse candidate resumes with Gemini AI, and auto-rank top talent instantly.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">
                <FaBuilding />
              </div>
              <div className="feature-details">
                <h4>Hiring Drives Management</h4>
                <p>Create open drives with specific Job Description requirements.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <FaUserCheck />
              </div>
              <div className="feature-details">
                <h4>AI Candidate Ranking</h4>
                <p>Gemini AI evaluates applicants and generates structured candidate scores.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <FaShieldAlt />
              </div>
              <div className="feature-details">
                <h4>Enterprise Control</h4>
                <p>Manage users, drive status, and recruiter access controls securely.</p>
              </div>
            </div>
          </div>

          <div className="mockup-preview">
            <div className="mockup-left">
              <div className="mockup-line medium"></div>
              <div className="mockup-line short"></div>
              <div className="mockup-line"></div>
            </div>

            <div className="match-badge">
              <div className="match-score">HR Admin</div>
              <div className="match-label">Recruiter Control</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE PANEL */}
      <div className="login-right">
        <div className="top-bar">
          <button
            className="create-account-btn"
            style={{ border: "1px solid #CBD5E1", color: "#64748B", marginRight: "auto" }}
            onClick={() => navigate("/")}
          >
            <FaArrowLeft /> Home
          </button>
          <span className="top-bar-text">New admin?</span>
          <button className="create-account-btn" onClick={() => navigate("/register-admin")}>
            <FaUserPlus /> Create Admin
          </button>
        </div>

        <div className="login-card">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#EEF2FF", color: "#4F46E5", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "700", marginBottom: "16px" }}>
            <FaShieldAlt /> Recruiter Admin Portal
          </div>

          <h1 className="card-title">Welcome Back</h1>
          <p className="card-subtitle">Login to access Recruiter Dashboard</p>

          {showError && <div className="error-banner">{errorMessage}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Admin Email Address</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter admin email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter admin password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="options-row">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                />
                Remember me
              </label>

              <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Logging in..." : <>Continue as Admin <FaArrowRight /></>}
            </button>
          </form>

          <div className="privacy-banner">
            <div className="privacy-icon">
              <FaShieldAlt />
            </div>
            <div className="privacy-text">
              <h5>Enterprise Security</h5>
              <p>Your portal is protected with end-to-end encrypted authentication.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
