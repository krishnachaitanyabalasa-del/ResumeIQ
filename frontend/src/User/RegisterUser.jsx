import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/apiService";
import "./RegisterUser.css";
import "../pages/Login.css";
import { FaUser, FaEnvelope, FaLock, FaArrowRight } from "react-icons/fa";

export default function RegisterUser() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "APPLICANT"
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowError(false);
    setErrorMessage("");
    setLoading(true);

    try {
      await authApi.registerUser(form);
      setLoading(false);
      navigate("/login-user");
    } catch (error) {
      console.error("Register Error:", error);
      let message = "Registration failed. Try again.";
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
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Create Account</h1>
        <p className="register-subtitle">Sign up to find top jobs and match with recruiters</p>

        {showError && <div className="error-banner">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          </div>

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
                type="password"
                className="form-input"
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading} style={{ marginTop: "24px" }}>
            {loading ? "Registering..." : <>Create Account <FaArrowRight /></>}
          </button>
        </form>

        <p className="register-footer">
          Already have an account?{" "}
          <span className="register-link" onClick={() => navigate("/login-user")}>
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}
