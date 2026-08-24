import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/apiService";
import "./RegisterAdmin.css";
import "../User/RegisterUser.css";
import "../pages/Login.css";
import { FaUser, FaEnvelope, FaLock, FaArrowRight, FaShieldAlt } from "react-icons/fa";

export default function RegisterAdmin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN"
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
      await authApi.registerAdmin(form);
      setLoading(false);
      navigate("/login-admin");
    } catch (error) {
      console.error("Admin Register Error:", error);
      let message = "Admin creation failed. Try again.";
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
    <div className="register-admin-container">
      <div className="register-admin-card">
        <h1 className="register-title"><FaShieldAlt /> Create Admin Account</h1>
        <p className="register-subtitle">Setup Recruiter Admin credentials for ResumeIQ</p>

        {showError && <div className="error-banner">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Admin Name</label>
            <div className="input-wrapper">
              <FaUser className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Enter full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Work Email</label>
            <div className="input-wrapper">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="Enter admin work email"
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
                placeholder="Create admin password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading} style={{ marginTop: "24px" }}>
            {loading ? "Creating..." : <>Create Admin <FaArrowRight /></>}
          </button>
        </form>

        <p className="register-footer">
          Already an Admin?{" "}
          <span className="register-link" onClick={() => navigate("/login-admin")}>
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}
