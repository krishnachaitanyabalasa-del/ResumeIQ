import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authApi } from "../api/apiService";
import { BASE_SERVER_URL } from "../api/axiosInstance";
import AdminNavbar from "../components/AdminNavbar";
import "./DriveDetails.css";
import {
  FaFileAlt,
  FaArrowLeft,
  FaBriefcase,
  FaMapMarkerAlt,
  FaUsers,
  FaClock,
  FaTools,
  FaGraduationCap,
  FaUserCheck,
  FaCheck,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaFileDownload,
  FaCode,
  FaBuilding,
  FaEye,
  FaTimes,
  FaPhoneAlt,
  FaEnvelope,
  FaDownload
} from "react-icons/fa";

export default function DriveDetails() {
  const { driveId } = useParams();
  const navigate = useNavigate();

  // Admin details
  const adminName = sessionStorage.getItem("name") || "Admin";

  const getInitials = (name) => {
    if (!name) return "A";
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  };

  // States
  const [drive, setDrive] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Candidate Details Modal State
  const [selectedCandidateApp, setSelectedCandidateApp] = useState(null);

  // Fetch Drive & Applications Data
  const fetchData = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const [driveRes, appsRes] = await Promise.allSettled([
        authApi.getDriveById(driveId),
        authApi.getApplicationsByDrive(driveId)
      ]);

      if (driveRes.status === "fulfilled" && driveRes.value.data) {
        setDrive(driveRes.value.data);
      } else {
        setErrorMessage("Drive details not found.");
      }

      if (appsRes.status === "fulfilled" && Array.isArray(appsRes.value.data)) {
        setApplications(appsRes.value.data);
      }
    } catch (err) {
      console.error("Error loading drive details:", err);
      setErrorMessage("Failed to load drive details from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [driveId]);

  // Handle Drive Status Change
  const handleStatusChange = async (newStatus) => {
    setShowStatusDropdown(false);
    try {
      const updatedData = { ...drive, status: newStatus };
      await authApi.updateDrive(driveId, updatedData);
      setDrive(updatedData);
    } catch (err) {
      console.error("Error updating drive status:", err);
      alert("Failed to update status.");
    }
  };

  // Export Candidates List to CSV / Excel format
  const handleExportExcel = () => {
    if (applications.length === 0) {
      alert("No candidate data available to export.");
      return;
    }

    const headers = ["#", "Candidate Name", "Email", "Phone", "Experience", "Resume Score", "Applied On"];
    const rows = applications.map((app, index) => {
      const name = app.resume?.name || app.applicant?.name || "Candidate";
      const email = app.resume?.email || app.applicant?.email || "N/A";
      const phone = app.resume?.phone || app.applicant?.phone || "N/A";
      const exp = app.resume?.experience || app.applicant?.experience || drive?.experience || "N/A";
      const score = Math.round(app.score || 0);
      const appliedDate = app.appliedAt ? new Date(app.appliedAt).toLocaleString() : "N/A";

      return [index + 1, `"${name}"`, `"${email}"`, `"${phone}"`, `"${exp}"`, score, `"${appliedDate}"`].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Applied_Candidates_Drive_${driveId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter applications by search query
  const filteredApps = applications.filter((app) => {
    const query = searchQuery.toLowerCase();
    const name = (app.resume?.name || app.applicant?.name || "").toLowerCase();
    const email = (app.resume?.email || app.applicant?.email || "").toLowerCase();
    const phone = (app.resume?.phone || app.applicant?.phone || "").toLowerCase();

    return name.includes(query) || email.includes(query) || phone.includes(query);
  });

  if (loading) {
    return (
      <div className="drive-details-page">
        <div style={{ textAlign: "center", padding: "80px", color: "#64748B" }}>
          Loading drive details from backend database...
        </div>
      </div>
    );
  }

  return (
    <div className="drive-details-page">
      {/* REUSABLE ADMIN NAVBAR */}
      <AdminNavbar />

      {/* MAIN CONTAINER */}
      <main className="details-content-container">
        {/* BREADCRUMB & BACK BUTTON */}
        <div className="breadcrumb-row">
          <button className="cancel-btn" style={{ padding: "6px 14px", background: "#FFF", border: "1px solid #CBD5E1", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", color: "#334155" }} onClick={() => navigate("/admin-home")}>
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
                <span className="status-badge status-active">{(drive?.status || "OPEN").toUpperCase()}</span>
              </div>
              <div className="banner-meta">
                Drive ID: JD-{drive?.id || driveId} • Created on{" "}
                {drive?.createdAt ? new Date(drive.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"} by{" "}
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
                ● {(drive?.status || "OPEN").toUpperCase()}
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
              <label>Employment Type</label>
              <div className="strip-value">{drive?.employmentType || "Full-time"}</div>
            </div>
          </div>
        </div>

        {/* 2-COLUMN MIDDLE GRID */}
        <div className="middle-details-grid">
          {/* JOB DESCRIPTION BOX */}
          <div className="section-card jd-box">
            <div className="section-header" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div className="section-icon-badge" style={{ background: "#EEF2FF", color: "#4F46E5", padding: "8px", borderRadius: "8px" }}><FaFileAlt /></div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F172A" }}>Job Description</h3>
            </div>
            <p style={{ whiteSpace: "pre-line" }}>{drive?.description || drive?.jdText || "No job description text provided."}</p>
          </div>

          {/* REQUIREMENTS TABLE BOX */}
          <div className="section-card">
            <div className="section-header" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div className="section-icon-badge" style={{ background: "#EEF2FF", color: "#4F46E5", padding: "8px", borderRadius: "8px" }}><FaTools /></div>
              <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F172A" }}>Requirements</h3>
            </div>

            <table className="req-table">
              <tbody>
                <tr>
                  <td className="req-label"><FaTools /> Required Skills</td>
                  <td className="req-value">{(!drive?.requiredSkills || drive?.requiredSkills?.includes("C, Go, Data Structures")) ? "As specified in Job Description" : drive.requiredSkills}</td>
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
                  <td className="req-value">{drive?.employmentType || "Full-time"}</td>
                </tr>
                <tr>
                  <td className="req-label"><FaUserCheck /> Drive Status</td>
                  <td className="req-value"><span className="status-badge status-active">{(drive?.status || "OPEN").toUpperCase()}</span></td>
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
              <div className="search-box" style={{ minWidth: "220px", display: "flex", alignItems: "center", background: "#F8FAFC", border: "1px solid #CBD5E1", borderRadius: "10px", padding: "6px 12px" }}>
                <FaSearch className="search-icon" style={{ color: "#94A3B8", marginRight: "8px" }} />
                <input
                  type="text"
                  style={{ border: "none", outline: "none", background: "transparent", width: "100%", fontSize: "13px" }}
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "32px", color: "#94A3B8" }}>
                      No candidate applications found in database for this drive.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app, idx) => {
                    const score = Math.round(app.score || 0);
                    const scoreClass = score >= 75 ? "score-green" : score >= 60 ? "score-orange" : "score-red";

                    const candidateName = app.resume?.name || app.applicant?.name || "Candidate";
                    const candidateEmail = app.resume?.email || app.applicant?.email || "N/A";
                    const candidatePhone = app.resume?.phone || app.applicant?.phone || app.phone || "N/A";
                    const candidateInitials = getInitials(candidateName);

                    return (
                      <tr key={app.id || idx}>
                        <td style={{ fontWeight: "700", color: "#64748B" }}>{idx + 1}</td>

                        <td>
                          <div className="candidate-name-cell">
                            <div className="candidate-avatar">{candidateInitials}</div>
                            <span style={{ fontWeight: "700" }}>{candidateName}</span>
                          </div>
                        </td>

                        <td>{candidateEmail}</td>

                        {/* PHONE NUMBER - FETCHED FROM RESUME / USER */}
                        <td>
                          <span style={{ fontWeight: "600", color: "#0F172A" }}>
                            {candidatePhone}
                          </span>
                        </td>

                        <td>{app.resume?.experience || app.applicant?.experience || drive?.experience || "0-2 years"}</td>

                        <td>
                          <span className={`score-badge ${scoreClass}`}>
                            {score}
                          </span>
                        </td>

                        <td style={{ fontSize: "12px", color: "#64748B" }}>
                          {app.appliedAt ? new Date(app.appliedAt).toLocaleString() : "N/A"}
                        </td>

                        <td>
                          <button
                            className="action-view-btn"
                            style={{ padding: "6px 12px", background: "#EEF2FF", border: "1px solid #C7D2FE", color: "#4F46E5", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                            onClick={() => setSelectedCandidateApp(app)}
                          >
                            View Details <FaEye />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER PAGINATION */}
          <div className="table-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", fontSize: "13px", color: "#64748B" }}>
            <span>Showing {filteredApps.length} of {applications.length} candidates</span>

            <div className="pagination-controls" style={{ display: "flex", gap: "6px" }}>
              <button className="page-btn" style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", background: "#FFF" }}><FaChevronLeft /></button>
              <button className="page-btn active" style={{ padding: "6px 12px", borderRadius: "6px", border: "none", background: "#4F46E5", color: "#FFF", fontWeight: "700" }}>1</button>
              <button className="page-btn" style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", background: "#FFF" }}><FaChevronRight /></button>
            </div>
          </div>
        </div>
      </main>

      {/* FULL CANDIDATE DETAILS MODAL */}
      {selectedCandidateApp && (
        <div className="modal-overlay" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div className="candidate-modal-card" style={{ background: "#FFFFFF", borderRadius: "24px", width: "100%", maxWidth: "880px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column" }}>
            
            {/* MODAL HEADER BANNER */}
            <div style={{ padding: "24px 32px", borderBottom: "1px solid #E2E8F0", background: "#F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "center", borderTopLeftRadius: "24px", borderTopRightRadius: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#4F46E5", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "18px" }}>
                  {getInitials(selectedCandidateApp.resume?.name || selectedCandidateApp.applicant?.name)}
                </div>

                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A" }}>
                    {selectedCandidateApp.resume?.name || selectedCandidateApp.applicant?.name || "Candidate Details"}
                  </h2>
                  <div style={{ fontSize: "13px", color: "#64748B", display: "flex", alignItems: "center", gap: "12px", marginTop: "2px" }}>
                    <span><FaEnvelope style={{ marginRight: "4px" }} /> {selectedCandidateApp.resume?.email || selectedCandidateApp.applicant?.email}</span>
                    <span><FaPhoneAlt style={{ marginRight: "4px" }} /> {selectedCandidateApp.resume?.phone || selectedCandidateApp.applicant?.phone || selectedCandidateApp.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {selectedCandidateApp.resume?.fileUrl && (
                  <a
                    href={`${BASE_SERVER_URL}${selectedCandidateApp.resume.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ padding: "8px 16px", background: "#EEF2FF", border: "1px solid #C7D2FE", color: "#4F46E5", borderRadius: "10px", fontWeight: "700", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
                  >
                    <FaDownload /> View PDF Resume
                  </a>
                )}

                <button
                  style={{ background: "#F1F5F9", border: "none", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", color: "#64748B", fontSize: "16px" }}
                  onClick={() => setSelectedCandidateApp(null)}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* MODAL BODY CONTENT */}
            <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* SCORE BREAKDOWN BANNER */}
              <div style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: "16px", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#4338CA", textTransform: "uppercase" }}>
                    AI Resume Match Evaluation
                  </div>
                  <h3 style={{ fontSize: "28px", fontWeight: "900", color: "#1E1B4B", marginTop: "4px" }}>
                    {Math.round(selectedCandidateApp.score || 0)} <span style={{ fontSize: "16px", color: "#6366F1" }}>/ 100 Overall Score</span>
                  </h3>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <div style={{ background: "#FFF", padding: "8px 14px", borderRadius: "10px", border: "1px solid #E0E7FF", textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: "#64748B", fontWeight: "700" }}>SKILLS</div>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A" }}>{Math.round(selectedCandidateApp.skillsScore || 0)}%</div>
                  </div>
                  <div style={{ background: "#FFF", padding: "8px 14px", borderRadius: "10px", border: "1px solid #E0E7FF", textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: "#64748B", fontWeight: "700" }}>EXPERIENCE</div>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A" }}>{Math.round(selectedCandidateApp.experienceScore || 0)}%</div>
                  </div>
                  <div style={{ background: "#FFF", padding: "8px 14px", borderRadius: "10px", border: "1px solid #E0E7FF", textAlign: "center" }}>
                    <div style={{ fontSize: "10px", color: "#64748B", fontWeight: "700" }}>EDUCATION</div>
                    <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A" }}>{Math.round(selectedCandidateApp.educationScore || 0)}%</div>
                  </div>
                </div>
              </div>

              {/* MATCHED & MISSING SKILLS */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "16px 20px" }}>
                  <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#16A34A", marginBottom: "8px" }}>
                    ✓ Matched Skills
                  </h4>
                  <div style={{ fontSize: "13px", color: "#334155", fontWeight: "600" }}>
                    {selectedCandidateApp.matchedSkills || "Skills aligned with drive requirements."}
                  </div>
                </div>

                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "16px 20px" }}>
                  <h4 style={{ fontSize: "13px", fontWeight: "800", color: "#EA580C", marginBottom: "8px" }}>
                    ⚠ Missing / Recommended Skills
                  </h4>
                  <div style={{ fontSize: "13px", color: "#334155", fontWeight: "600" }}>
                    {selectedCandidateApp.missingSkills || "No major skill gaps identified."}
                  </div>
                </div>
              </div>

              {/* CANDIDATE SUBMITTED SECTIONS */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* PROFESSIONAL SUMMARY */}
                {selectedCandidateApp.resume?.summary && (
                  <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A", marginBottom: "6px" }}>
                      Professional Summary
                    </h4>
                    <p style={{ fontSize: "13px", color: "#475569", lineHeight: "1.5" }}>
                      {selectedCandidateApp.resume.summary}
                    </p>
                  </div>
                )}

                {/* SKILLS */}
                {selectedCandidateApp.resume?.skills && (
                  <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A", marginBottom: "6px" }}>
                      Candidate Skills
                    </h4>
                    <p style={{ fontSize: "13px", color: "#475569", fontWeight: "600" }}>
                      {selectedCandidateApp.resume.skills}
                    </p>
                  </div>
                )}

                {/* EDUCATION */}
                {selectedCandidateApp.resume?.education && (
                  <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A", marginBottom: "6px" }}>
                      Education Background
                    </h4>
                    <p style={{ fontSize: "13px", color: "#475569" }}>
                      {selectedCandidateApp.resume.education}
                    </p>
                  </div>
                )}

                {/* WORK EXPERIENCE */}
                {selectedCandidateApp.resume?.experience && (
                  <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A", marginBottom: "6px" }}>
                      Work Experience
                    </h4>
                    <p style={{ fontSize: "13px", color: "#475569" }}>
                      {selectedCandidateApp.resume.experience}
                    </p>
                  </div>
                )}

                {/* PROJECTS */}
                {selectedCandidateApp.resume?.projects && (
                  <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A", marginBottom: "6px" }}>
                      Key Projects
                    </h4>
                    <p style={{ fontSize: "13px", color: "#475569" }}>
                      {selectedCandidateApp.resume.projects}
                    </p>
                  </div>
                )}

                {/* CERTIFICATIONS & ACHIEVEMENTS */}
                {selectedCandidateApp.resume?.certifications && (
                  <div>
                    <h4 style={{ fontSize: "14px", fontWeight: "800", color: "#0F172A", marginBottom: "6px" }}>
                      Certifications & Achievements
                    </h4>
                    <p style={{ fontSize: "13px", color: "#475569" }}>
                      {selectedCandidateApp.resume.certifications}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
