import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authApi } from "../api/apiService";
import UserNavbar from "../components/UserNavbar";
import "./UserDriveDetails.css";
import {
  FaFileAlt,
  FaArrowLeft,
  FaBriefcase,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCheck,
  FaGraduationCap,
  FaUserCheck,
  FaClock,
  FaInfoCircle,
  FaPaperPlane
} from "react-icons/fa";

export default function UserDriveDetails() {
  const { driveId } = useParams();
  const navigate = useNavigate();

  // Read logged in candidate details
  const userId = sessionStorage.getItem("userId");
  const userName = sessionStorage.getItem("name") || "Candidate";
  const token = sessionStorage.getItem("token");

  // States
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isApplied, setIsApplied] = useState(false);

  // Helper to split string into array items
  const parseListItems = (text) => {
    if (!text || typeof text !== "string") return [];
    return text
      .split(/[\n;]+/)
      .map((item) => item.replace(/^[•\-\*]\s*/, "").trim())
      .filter((item) => item.length > 0);
  };

  // Fetch Drive Details & User Applications
  const fetchDriveDetails = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      if (!token) {
        navigate("/login-user");
        return;
      }

      const [driveRes, userAppsRes] = await Promise.allSettled([
        authApi.getDriveById(driveId),
        userId ? authApi.getApplicationsByUser(userId) : Promise.resolve({ data: [] })
      ]);

      if (driveRes.status === "fulfilled" && driveRes.value.data) {
        setDrive(driveRes.value.data);
      } else {
        setErrorMsg("Failed to load hiring drive details.");
      }

      if (userAppsRes.status === "fulfilled" && Array.isArray(userAppsRes.value.data)) {
        const applied = userAppsRes.value.data.some(
          (app) => String(app.drive?.id || app.driveId) === String(driveId)
        );
        setIsApplied(applied);
      }
    } catch (err) {
      console.error("Error fetching drive details:", err);
      setErrorMsg("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriveDetails();
  }, [driveId]);

  if (loading) {
    return (
      <div className="user-drive-details-page">
        <UserNavbar />
        <div style={{ textAlign: "center", padding: "80px", color: "#64748B" }}>
          Loading hiring drive details from backend...
        </div>
      </div>
    );
  }

  if (errorMsg || !drive) {
    return (
      <div className="user-drive-details-page">
        <UserNavbar />
        <div className="user-details-container">
          <button className="back-to-drives-btn" onClick={() => navigate("/user-home")}>
            <FaArrowLeft /> Back to Drives
          </button>
          <div style={{ background: "#FEE2E2", color: "#B91C1C", padding: "20px", borderRadius: "14px", marginTop: "20px" }}>
            {errorMsg || "Drive not found."}
          </div>
        </div>
      </div>
    );
  }

  const companyName = drive.companyName || "Organization";
  const firstLetter = companyName.charAt(0).toUpperCase();

  const createdDateStr = drive.createdAt
    ? new Date(drive.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "Recently Posted";

  const lastDateStr = drive.lastDate
    ? new Date(drive.lastDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "Open Until Filled";

  const responsibilitiesList = parseListItems(
    drive.requiredResponsibilities || drive.jdText || drive.description
  );

  return (
    <div className="user-drive-details-page">
      {/* REUSABLE USER NAVBAR */}
      <UserNavbar />

      <main className="user-details-container">
        {/* BREADCRUMBS ROW */}
        <div className="breadcrumb-row">
          <button className="back-to-drives-btn" onClick={() => navigate("/user-home")}>
            <FaArrowLeft /> Back to Drives
          </button>

          <div className="breadcrumb-trail">
            Drives &gt; <span>Drive Details</span>
          </div>
        </div>

        {/* DRIVE MAIN HEADER BANNER CARD */}
        <div className="drive-banner-card">
          <div className="banner-left-content">
            {drive.companyLogo ? (
              <div className="banner-company-logo" style={{ background: "#F1F5F9" }}>
                <img src={drive.companyLogo} alt={companyName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
            ) : (
              <div className="banner-company-logo" style={{ background: "#2563EB" }}>
                {firstLetter}
              </div>
            )}

            <div className="banner-title-group">
              <div className="company-header-row">
                <h3>{companyName}</h3>
                <span className="status-badge status-active">
                  {(drive.status || "OPEN").toUpperCase()}
                </span>
              </div>

              <h1>{drive.driveName}</h1>

              <div className="drive-meta-subtitle">
                Drive ID: <strong>JD-{drive.id}</strong> • Posted on {createdDateStr} by {drive.createdByEmail || "Recruiter Admin"}
              </div>
            </div>
          </div>

          <div className="banner-right-action">
            {isApplied ? (
              <span className="applied-primary-badge">
                <FaCheck /> Applied
              </span>
            ) : (
              <button className="apply-primary-btn" onClick={() => navigate(`/user/apply/${driveId}`)}>
                <FaPaperPlane /> Apply Now
              </button>
            )}
            <span className="apply-status-text">Applications are open for this drive</span>
          </div>
        </div>

        {/* 5 METRIC CARDS ROW */}
        <div className="metrics-cards-row">
          <div className="metric-card-item">
            <div className="metric-icon-box">
              <FaBriefcase />
            </div>
            <div className="metric-details-text">
              <span>Role / Position</span>
              <h4>{drive.role}</h4>
              <div className="metric-subtag">{drive.employmentType || "Full-time"}</div>
            </div>
          </div>

          <div className="metric-card-item">
            <div className="metric-icon-box">
              <FaMapMarkerAlt />
            </div>
            <div className="metric-details-text">
              <span>Location</span>
              <h4>{drive.location}</h4>
              <div className="metric-subtag">On-site / Hybrid</div>
            </div>
          </div>

          <div className="metric-card-item">
            <div className="metric-icon-box">
              <FaBriefcase />
            </div>
            <div className="metric-details-text">
              <span>Experience</span>
              <h4>{drive.experience || drive.requiredExperience || "As per JD"}</h4>
            </div>
          </div>

          <div className="metric-card-item">
            <div className="metric-icon-box">
              <FaCalendarAlt />
            </div>
            <div className="metric-details-text">
              <span>Posted On</span>
              <h4>{createdDateStr}</h4>
            </div>
          </div>

          <div className="metric-card-item">
            <div className="metric-icon-box">
              <FaClock />
            </div>
            <div className="metric-details-text">
              <span>Last Date to Apply</span>
              <h4>{lastDateStr}</h4>
            </div>
          </div>
        </div>

        {/* 2-COLUMN BODY LAYOUT */}
        <div className="details-content-grid">
          {/* LEFT COLUMN: JOB DESCRIPTION */}
          <div className="section-detail-card">
            <div className="section-title-bar">
              <div className="section-title-icon">
                <FaFileAlt />
              </div>
              <h2>Job Description</h2>
            </div>

            <div className="jd-body-text" style={{ whiteSpace: "pre-line" }}>
              {drive.jdText || drive.description || "No full description text specified."}
            </div>

            {responsibilitiesList.length > 0 && (
              <>
                <h3 className="responsibilities-heading">Key Requirements & Responsibilities</h3>
                <ul className="responsibilities-list">
                  {responsibilitiesList.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* RIGHT COLUMN: REQUIREMENTS & ABOUT COMPANY */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="section-detail-card">
              <div className="section-title-bar">
                <div className="section-title-icon">
                  <FaGraduationCap />
                </div>
                <h2>Requirements</h2>
              </div>

              <table className="requirements-table">
                <tbody>
                  <tr>
                    <td><FaBriefcase className="req-row-icon" /> Required Skills</td>
                    <td>{drive.requiredSkills || "Specified in Job Description"}</td>
                  </tr>
                  <tr>
                    <td><FaGraduationCap className="req-row-icon" /> Qualifications</td>
                    <td>{drive.requiredQualifications || "As specified by company"}</td>
                  </tr>
                  <tr>
                    <td><FaGraduationCap className="req-row-icon" /> Education</td>
                    <td>{drive.requiredEducation || "Relevant Bachelor's / Master's"}</td>
                  </tr>
                  <tr>
                    <td><FaUserCheck className="req-row-icon" /> Experience</td>
                    <td>{drive.requiredExperience || drive.experience || "As per JD"}</td>
                  </tr>
                  <tr>
                    <td><FaBriefcase className="req-row-icon" /> Employment Type</td>
                    <td>{drive.employmentType || "Full-time"}</td>
                  </tr>
                  <tr>
                    <td><FaMapMarkerAlt className="req-row-icon" /> Location</td>
                    <td>{drive.location}</td>
                  </tr>
                </tbody>
              </table>

              <div className="about-company-box">
                <div className="about-company-title">
                  <FaInfoCircle /> About {companyName}
                </div>
                <div className="about-company-desc">
                  {companyName} is actively accepting candidate applications for the {drive.role} position at {drive.location}.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
