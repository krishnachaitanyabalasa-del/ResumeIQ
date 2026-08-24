import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authApi } from "../api/apiService";
import "./DriveDetails.css";
import {
  FaFileAlt,
  FaBell,
  FaArrowLeft,
  FaBriefcase,
  FaBuilding,
  FaMapMarkerAlt,
  FaUsers,
  FaClock,
  FaSearch,
  FaFileDownload,
  FaCode,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaGraduationCap,
  FaUserCheck,
  FaTools,
  FaCheck
} from "react-icons/fa";

export default function DriveDetails() {
  const { driveId } = useParams();
  const navigate = useNavigate();

  const adminName = sessionStorage.getItem("name") || "Admin";
  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };
  const adminInitials = getInitials(adminName);

  // States
  const [drive, setDrive] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch Drive Details and Applied Candidates from Backend APIs
  const fetchData = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      // Fetch drive info and candidates applied to this drive
      const [driveRes, appsRes] = await Promise.all([
        authApi.getDriveById(driveId),
        authApi.getApplicationsByDrive(driveId)
      ]);

      if (driveRes && driveRes.data) {
        setDrive(driveRes.data);
      }

      if (appsRes && Array.isArray(appsRes.data)) {
        setApplications(appsRes.data);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error("Fetch Drive Details Error:", err);
      setErrorMessage("Failed to load drive details or applications from backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [driveId]);

  // Update Status
  const handleStatusChange = async (newStatus) => {
    setShowStatusDropdown(false);
    try {
      await authApi.updateDrive(driveId, { status: newStatus });
      setDrive({ ...drive, status: newStatus });
    } catch (err) {
      console.error("Status Update Error:", err);
      alert("Failed to update drive status.");
    }
  };

  // Export Applied Candidates to Excel / CSV
  const handleExportExcel = () => {
    if (applications.length === 0) {
      alert("No candidate applications to export.");
      return;
    }

    const headers = ["Index", "Candidate Name", "Email", "Phone", "Experience", "Resume Score", "Applied On"];
    const rows = applications.map((app, idx) => [
      idx + 1,
      `"${app.applicant?.name || "Candidate"}"`,
      `"${app.applicant?.email || ""}"`,
      `"${app.applicant?.phone || "N/A"}"`,
      `"${app.applicant?.experience || app.experience || "0-2 years"}"`,
      app.score || 0,
      `"${app.appliedAt ? new Date(app.appliedAt).toLocaleString() : ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${(drive?.driveName || "Drive").replace(/\s+/g, "_")}_Candidates.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter candidates by search query
  const filteredApps = applications.filter((app) => {
    const name = app.applicant?.name || "";
    const email = app.applicant?.email || "";
    const phone = app.applicant?.phone || "";
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query) || phone.includes(query);
  });

  if (loading) {
    return (
      <div className="drive-details-page">
        <div style={{ textAlign: "center", padding: "100px", color: "#64748B", fontSize: "16px", fontWeight: "600" }}>
          Loading drive details and candidates from backend...
        </div>
      </div>
    );
  }

  return (
    <div className="drive-details-page">
      {/* NAVBAR */}
      <nav className="dashboard-navbar">
        <div className="navbar-brand" onClick={() => navigate("/")}>
          <div className="navbar-brand-icon">
            <FaFileAlt />
          </div>
          <div className="navbar-brand-text">
            <h2>ResumeIQ</h2>
            <p>Recruiter & HR Admin Portal</p>
          </div>
        </div>

        <div className="navbar-right">
          <div className="notification-btn">
            <FaBell />
            <span className="notification-badge">3</span>
          </div>

          <div className="admin-profile-dropdown" onClick={() => navigate("/admin-home")}>
            <div className="admin-avatar-small">{adminInitials}</div>
            <span className="admin-name-text">{adminName}</span>
            <FaChevronDown style={{ fontSize: "11px", color: "#94A3B8" }} />
          </div>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="details-content-container">
        {/* BREADCRUMB & BACK BUTTON */}
        <div className="breadcrumb-row">
          <button className="cancel-btn" style={{ padding: "6px 14px" }} onClick={() => navigate("/admin-home")}>
            <FaArrowLeft /> Back to Drives
          </button>
          <span>Drives</span> &gt; <span className="breadcrumb-current">Drive Details</span>
        </div>

        {errorMessage && (
          <div className="error-banner" style={{ background: "#FEE2E2", color: "#B91C1C", padding: "14px 20px", borderRadius: "12px" }}>
            {errorMessage}
          </div>
        )}

        {/* TOP BANNER CARD */}
        <div className="banner-card">
          <div className="banner-left">
            <div className="drive-details-icon">
              {drive?.companyLogo ? (
                <img src={drive.companyLogo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <FaCode />
              )}
            </div>

            <div>
              <div className="banner-title-row">
                <h1>{drive?.driveName}</h1>
                <span className="status-badge status-active">{drive?.status || "OPEN"}</span>
              </div>
              <div className="banner-meta">
                Drive ID: JD-{drive?.id || driveId} • Created on{" "}
                {drive?.createdAt ? new Date(drive.createdAt).toLocaleDateString() : "N/A"} by{" "}
                {drive?.createdByEmail || "admin@gmail.com"}
              </div>
            </div>
          </div>

          {/* CHANGE STATUS DROPDOWN */}
          <div className="status-dropdown-wrapper">
            <button
              className="status-dropdown-btn"
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            >
              <span>Change Status</span>
              <span className="status-badge status-active" style={{ fontSize: "11px" }}>
                ● {drive?.status || "OPEN"}
              </span>
              <FaChevronDown style={{ fontSize: "11px", color: "#64748B" }} />
            </button>

            {showStatusDropdown && (
              <div className="status-dropdown-menu">
                <div className="status-option-item" onClick={() => handleStatusChange("OPEN")}>
                  <span className="status-dot dot-green"></span> Open {drive?.status === "OPEN" && <FaCheck style={{ marginLeft: "auto", color: "#4F46E5" }} />}
                </div>
                <div className="status-option-item" onClick={() => handleStatusChange("CLOSED")}>
                  <span className="status-dot dot-red"></span> Closed {drive?.status === "CLOSED" && <FaCheck style={{ marginLeft: "auto", color: "#4F46E5" }} />}
                </div>
                <div className="status-option-item" onClick={() => handleStatusChange("UPCOMING")}>
                  <span className="status-dot dot-orange"></span> Upcoming {drive?.status === "UPCOMING" && <FaCheck style={{ marginLeft: "auto", color: "#4F46E5" }} />}
                </div>
                <div className="status-option-item" onClick={() => handleStatusChange("COMPLETED")}>
                  <span className="status-dot dot-purple"></span> Completed {drive?.status === "COMPLETED" && <FaCheck style={{ marginLeft: "auto", color: "#4F46E5" }} />}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5 STAT BOXES STRIP */}
        <div className="stats-strip-grid">
          <div className="strip-box">
            <div className="strip-icon"><FaBriefcase /></div>
            <div className="strip-info">
              <label>Role / Position</label>
              <div className="strip-value">{drive?.role || "N/A"}</div>
              <span className="strip-sub">{drive?.experience || "0-2 years"}</span>
            </div>
          </div>

          <div className="strip-box">
            <div className="strip-icon"><FaBuilding /></div>
            <div className="strip-info">
              <label>Company</label>
              <div className="strip-value">{drive?.companyName || "N/A"}</div>
            </div>
          </div>

          <div className="strip-box">
            <div className="strip-icon"><FaMapMarkerAlt /></div>
            <div className="strip-info">
              <label>Location</label>
              <div className="strip-value">{drive?.location || "N/A"}</div>
            </div>
          </div>

          <div className="strip-box">
            <div className="strip-icon"><FaUsers /></div>
            <div className="strip-info">
              <label>Candidates Applied</label>
              <div className="strip-value">{applications.length}</div>
            </div>
          </div>

          <div className="strip-box">
            <div className="strip-icon"><FaClock /></div>
            <div className="strip-info">
              <label>Drive Type</label>
              <div className="strip-value">Full-time</div>
            </div>
          </div>
        </div>

        {/* 2-COLUMN MIDDLE GRID */}
        <div className="middle-details-grid">
          {/* JOB DESCRIPTION BOX */}
          <div className="section-card jd-box">
            <div className="section-header">
              <div className="section-icon-badge"><FaFileAlt /></div>
              <h3>Job Description</h3>
            </div>
            <p>{drive?.description || drive?.jdText || "No job description text provided."}</p>
          </div>

          {/* REQUIREMENTS TABLE BOX */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon-badge"><FaTools /></div>
              <h3>Requirements</h3>
            </div>

            <table className="req-table">
              <tbody>
                <tr>
                  <td className="req-label"><FaTools /> Required Skills</td>
                  <td className="req-value">{drive?.requiredSkills || "N/A"}</td>
                </tr>
                <tr>
                  <td className="req-label"><FaGraduationCap /> Education</td>
                  <td className="req-value">{drive?.requiredEducation || "Bachelor's Degree"}</td>
                </tr>
                <tr>
                  <td className="req-label"><FaBriefcase /> Experience</td>
                  <td className="req-value">{drive?.requiredExperience || drive?.experience || "0-2 years"}</td>
                </tr>
                <tr>
                  <td className="req-label"><FaClock /> Employment Type</td>
                  <td className="req-value">Full-time</td>
                </tr>
                <tr>
                  <td className="req-label"><FaUserCheck /> Drive Status</td>
                  <td className="req-value"><span className="status-badge status-active">{drive?.status || "OPEN"}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* APPLIED CANDIDATES SECTION */}
        <div className="candidates-card-section">
          <div className="candidates-header-row">
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A" }}>
                Applied Candidates ({filteredApps.length})
              </h2>
              <p style={{ fontSize: "13px", color: "#64748B", marginTop: "2px" }}>
                List of candidates who have applied for this drive from backend database.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div className="search-box" style={{ minWidth: "220px" }}>
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name, email or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* EXPORT TO EXCEL BUTTON */}
              <button className="export-excel-btn" onClick={handleExportExcel}>
                <FaFileDownload /> Export to Excel
              </button>
            </div>
          </div>

          {/* CANDIDATES DATA TABLE */}
          <div className="table-responsive">
            <table className="drives-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Candidate Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Experience</th>
                  <th>Resume Score</th>
                  <th>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "#94A3B8" }}>
                      No candidate applications found in database for this drive.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app, idx) => {
                    const score = Math.round(app.score || 0);
                    const scoreClass = score >= 75 ? "score-green" : score >= 60 ? "score-orange" : "score-red";
                    const candidateName = app.applicant?.name || "Candidate";
                    const candidateInitials = getInitials(candidateName);

                    return (
                      <tr key={app.id || idx}>
                        <td style={{ fontWeight: "700", color: "#64748B" }}>{idx + 1}</td>

                        <td>
                          <div className="candidate-name-cell">
                            <div className="candidate-avatar">{candidateInitials}</div>
                            <span>{candidateName}</span>
                          </div>
                        </td>

                        <td>{app.applicant?.email || "N/A"}</td>

                        <td>{app.applicant?.phone || "N/A"}</td>

                        <td>{app.applicant?.experience || app.experience || "0-2 years"}</td>

                        <td>
                          <span className={`score-badge ${scoreClass}`}>
                            {score}
                          </span>
                        </td>

                        <td style={{ fontSize: "12px", color: "#64748B" }}>
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleString() : "N/A"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER PAGINATION */}
          <div className="table-footer">
            <span>Showing {filteredApps.length} of {applications.length} candidates</span>

            <div className="pagination-controls">
              <button className="page-btn"><FaChevronLeft /></button>
              <button className="page-btn active">1</button>
              <button className="page-btn"><FaChevronRight /></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
