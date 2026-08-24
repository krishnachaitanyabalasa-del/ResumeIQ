import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaShieldAlt,
  FaUserPlus,
  FaArrowRight,
  FaStar,
  FaRobot,
  FaChartLine,
  FaFileAlt,
  FaArrowLeft
} from "react-icons/fa";

export default function LoginUser() {
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
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email: form.email,
          password: form.password
        },
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      const data = response.data;
      if (!data || !data.token) {
        throw new Error("No token received from server");
      }

      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("role", data.role || "APPLICANT");
      sessionStorage.setItem("email", data.email || form.email);
      sessionStorage.setItem("userId", data.id || "");
      sessionStorage.setItem("name", data.name || "");

      setLoading(false);
      navigate("/user-home");
    } catch (error) {
      console.error("User Login Error:", error);
      let message = "Invalid email or password";
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
            Job Seeker
            <span className="highlight">Candidate Portal</span>
          </h1>

          <p className="hero-subtext">
            Upload your resume, match with top hiring drives, and track your application status in real-time.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">
                <FaRobot />
              </div>
              <div className="feature-details">
                <h4>AI Resume Scoring</h4>
                <p>Get instant AI feedback and score match highlights for jobs.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <FaChartLine />
              </div>
              <div className="feature-details">
                <h4>Application Tracking</h4>
                <p>Monitor your progress across multiple recruiter hiring drives.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <FaShieldAlt />
              </div>
              <div className="feature-details">
                <h4>Verified Privacy</h4>
                <p>Your resume data is safe and shared only with applied companies.</p>
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
              <div className="match-score">92%</div>
              <div className="match-label">Match Score</div>
              <div className="match-stars">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
              </div>
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
          <span className="top-bar-text">New candidate?</span>
          <button className="create-account-btn" onClick={() => navigate("/register-user")}>
            <FaUserPlus /> Create Account
          </button>
        </div>

        <div className="login-card">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#EEF2FF", color: "#4F46E5", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "700", marginBottom: "16px" }}>
            <FaUser /> User Candidate Portal
          </div>

          <h1 className="card-title">Welcome Back</h1>
          <p className="card-subtitle">Login to access your candidate dashboard</p>

          {showError && <div className="error-banner">{errorMessage}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter your email"
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
                  placeholder="Enter your password"
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
              {loading ? "Logging in..." : <>Continue as User <FaArrowRight /></>}
            </button>
          </form>

          <div className="privacy-banner">
            <div className="privacy-icon">
              <FaShieldAlt />
            </div>
            <div className="privacy-text">
              <h5>We value your privacy</h5>
              <p>Your information is secure and will never be shared with third parties.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
