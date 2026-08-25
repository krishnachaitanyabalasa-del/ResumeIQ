import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusModal from "../components/StatusModal";
import "./Home.css";
import {
  FaFileAlt,
  FaInfoCircle,
  FaUser,
  FaShieldAlt,
  FaArrowRight,
  FaStar,
  FaBriefcase,
  FaChartPie,
  FaLock,
  FaBolt,
  FaBullseye,
  FaBell,
  FaCheck,
  FaUsers,
  FaChartLine,
  FaSearch,
  FaLeaf
} from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* NAVBAR */}
      <nav className="landing-nav">
        <div className="landing-brand" onClick={() => navigate("/")}>
          <div className="landing-brand-icon">
            <FaFileAlt />
          </div>
          <div className="landing-brand-text">
            <h2>ResumeIQ</h2>
            <p>Find Best Opportunities. Apply. Get Matched.</p>
          </div>
        </div>

        <button
          className="about-btn"
          onClick={() =>
            setStatusModal({
              isOpen: true,
              type: "info",
              title: "About ResumeIQ",
              message: "ResumeIQ is an AI-powered resume screening, skill extraction, and candidate matching platform designed to connect job seekers with top recruiters."
            })
          }
        >
          <FaInfoCircle /> About Us
        </button>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-left">
          <div className="pill-badge">
            ✨ AI-Powered Hiring Platform
          </div>

          <h1 className="hero-title">
            Smarter Screening.
            <span className="highlight">Better Hiring.</span>
          </h1>

          <p className="hero-description">
            ResumeIQ uses AI to screen resumes, match the right talent, and connect great people with great opportunities.
          </p>

          <div className="hero-accent-line">
            <span className="accent-bar"></span>
            <span className="accent-dot"></span>
          </div>
        </div>

        {/* HERO GRAPHIC ILLUSTRATION (MATCHING MOCKUP) */}
        <div className="hero-right">
          <div className="hero-illustration-wrapper">
            <div className="hero-bg-glow"></div>

            {/* FLOATING LEFT BADGES */}
            <div className="floating-badge floating-badge-users">
              <FaUsers />
            </div>
            <div className="floating-badge floating-badge-chart">
              <FaChartLine />
            </div>
            <div className="floating-badge floating-badge-check">
              <FaCheck />
            </div>

            {/* CENTRAL 3D MONITOR */}
            <div className="monitor-container">
              <div className="monitor-header">
                <div className="monitor-dots">
                  <div className="monitor-dot"></div>
                  <div className="monitor-dot"></div>
                  <div className="monitor-dot"></div>
                </div>
                <div className="circle-score-badge">92%</div>
              </div>

              <div className="monitor-body">
                <div className="monitor-avatar">
                  <FaUser />
                </div>
                <div className="monitor-lines">
                  <div className="monitor-line w80"></div>
                  <div className="monitor-line w60"></div>
                </div>
                <div className="monitor-stars">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
              </div>
            </div>

            {/* FLOATING MAGNIFYING GLASS & PLANT */}
            <div className="floating-magnifier">
              <FaSearch />
            </div>

            <div className="floating-plant">
              <FaLeaf />
            </div>
          </div>
        </div>
      </section>

      {/* PORTAL SELECTION CARDS */}
      <section className="selection-section">
        <div className="selection-divider">
          <span>✦</span> Choose how you want to continue <span>✦</span>
        </div>

        <div className="cards-grid">
          {/* USER CARD */}
          <div className="portal-card portal-card-user">
            <div className="card-badge-icon card-badge-user">
              <FaUser />
            </div>
            <h3>User Login</h3>
            <p>Search jobs, apply to opportunities, and track your applications.</p>

            <div className="portal-illustration portal-illustration-user">
              <FaBriefcase />
            </div>

            <button
              className="continue-btn continue-btn-user"
              onClick={() => navigate("/login-user")}
            >
              Continue as User <FaArrowRight />
            </button>
          </div>

          {/* ADMIN CARD */}
          <div className="portal-card portal-card-admin">
            <div className="card-badge-icon card-badge-admin">
              <FaShieldAlt />
            </div>
            <h3>Admin Login</h3>
            <p>Manage drives, screen candidates, and monitor hiring activity.</p>

            <div className="portal-illustration portal-illustration-admin">
              <FaChartPie />
            </div>

            <button
              className="continue-btn continue-btn-admin"
              onClick={() => navigate("/login-admin")}
            >
              Continue as Admin <FaArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* BOTTOM HIGHLIGHTS BAR */}
      <section className="highlights-bar">
        <div className="highlight-item">
          <div className="highlight-icon highlight-icon-1">
            <FaLock />
          </div>
          <h5>Secure & Private</h5>
          <p>Your data is safe with enterprise-grade security.</p>
        </div>

        <div className="highlight-item">
          <div className="highlight-icon highlight-icon-2">
            <FaBolt />
          </div>
          <h5>AI-Powered</h5>
          <p>Intelligent screening for better matches.</p>
        </div>

        <div className="highlight-item">
          <div className="highlight-icon highlight-icon-3">
            <FaBullseye />
          </div>
          <h5>Precision Matching</h5>
          <p>Right talent for the right opportunities.</p>
        </div>

        <div className="highlight-item">
          <div className="highlight-icon highlight-icon-4">
            <FaBell />
          </div>
          <h5>Real-time Updates</h5>
          <p>Get notified about applications instantly.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <FaCheck style={{ color: "#16A34A" }} /> Trusted by recruiters and job seekers worldwide
      </footer>

      <StatusModal
        isOpen={statusModal.isOpen}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal({ ...statusModal, isOpen: false })}
      />
    </div>
  );
}
