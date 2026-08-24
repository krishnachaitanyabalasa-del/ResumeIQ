import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/apiService";
import UserNavbar from "../components/UserNavbar";
import "./UserHomePage.css";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaEye,
  FaCheck,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

export default function UserHomePage() {
  const navigate = useNavigate();

  // Read logged in candidate details
  const userId = sessionStorage.getItem("userId");
  const userName = sessionStorage.getItem("name") || "User";
  const token = sessionStorage.getItem("token");

  // States
  const [drives, setDrives] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState("NOT_APPLIED"); // 'NOT_APPLIED' (Default), 'ALL', 'APPLIED'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("ALL");
  const [selectedExperience, setSelectedExperience] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Dynamic badge color generator based on company name
  const getBadgeColorClass = (companyName) => {
    if (!companyName) return "badge-blue";
    const firstChar = companyName.charAt(0).toUpperCase();
    if ("ABCDE".includes(firstChar)) return "badge-blue";
    if ("FGHIJ".includes(firstChar)) return "badge-green";
    if ("KLMNO".includes(firstChar)) return "badge-orange";
    if ("PQRST".includes(firstChar)) return "badge-purple";
    return "badge-gray";
  };

  // Fetch all drives & user applications from backend
  const fetchCandidateData = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      if (!token) {
        navigate("/login-user");
        return;
      }

      const [drivesRes, appsRes] = await Promise.allSettled([
        authApi.getAllDrives(),
        userId ? authApi.getApplicationsByUser(userId) : Promise.resolve({ data: [] })
      ]);

      let fetchedDrives = [];
      if (drivesRes.status === "fulfilled" && Array.isArray(drivesRes.value.data)) {
        fetchedDrives = drivesRes.value.data;
      } else {
        try {
          const openRes = await authApi.getOpenDrives();
          if (openRes && Array.isArray(openRes.data)) {
            fetchedDrives = openRes.data;
          }
        } catch (openErr) {
          console.error("Open drives fallback error:", openErr);
        }
      }

      setDrives(fetchedDrives);

      if (appsRes.status === "fulfilled" && Array.isArray(appsRes.value.data)) {
        setUserApplications(appsRes.value.data);
      }
    } catch (err) {
      console.error("Error fetching candidate drives:", err);
      setErrorMsg("Failed to load hiring drives from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidateData();
  }, []);

  // Set of applied drive IDs
  const appliedDriveIds = new Set(
    userApplications.map((app) => app.drive?.id || app.driveId).filter(Boolean)
  );

  // Filter drives per Tab (Default: Not Applied) and dropdown controls
  const filteredDrives = drives.filter((drive) => {
    const isApplied = appliedDriveIds.has(drive.id);

    // Tab Filter
    if (activeTab === "NOT_APPLIED" && isApplied) return false;
    if (activeTab === "APPLIED" && !isApplied) return false;

    // Search Query Filter
    const query = searchQuery.toLowerCase();
    const matchSearch =
      (drive.driveName || "").toLowerCase().includes(query) ||
      (drive.companyName || "").toLowerCase().includes(query) ||
      (drive.role || "").toLowerCase().includes(query) ||
      (drive.location || "").toLowerCase().includes(query);

    if (!matchSearch) return false;

    // Location Dropdown Filter
    if (selectedLocation !== "ALL" && !(drive.location || "").toLowerCase().includes(selectedLocation.toLowerCase())) {
      return false;
    }

    // Experience Dropdown Filter
    if (selectedExperience !== "ALL" && !(drive.experience || "").toLowerCase().includes(selectedExperience.toLowerCase())) {
      return false;
    }

    // Status Dropdown Filter
    if (selectedStatus !== "ALL" && (drive.status || "").toUpperCase() !== selectedStatus.toUpperCase()) {
      return false;
    }

    return true;
  });

  return (
    <div className="user-dashboard">
      {/* REUSABLE USER NAVBAR WITH RED LOGOUT BUTTON */}
      <UserNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MAIN CONTENT CONTAINER */}
      <main className="user-dashboard-content">
        {/* PAGE HEADER BANNER */}
        <div className="user-page-header">
          <h1>All Hiring Drives</h1>
          <p>Explore and apply to the best opportunities that match your skills.</p>
        </div>

        {errorMsg && (
          <div className="error-banner" style={{ background: "#FEE2E2", color: "#B91C1C", padding: "14px 20px", borderRadius: "12px", marginBottom: "20px" }}>
            {errorMsg}
          </div>
        )}

        {/* TAB SWITCHER (DEFAULT: NOT APPLIED DRIVES) */}
        <div className="filter-tabs-row">
          <button
            className={`filter-tab-btn ${activeTab === "NOT_APPLIED" ? "active" : ""}`}
            onClick={() => setActiveTab("NOT_APPLIED")}
          >
            Available Drives (Not Applied) ({drives.filter((d) => !appliedDriveIds.has(d.id)).length})
          </button>

          <button
            className={`filter-tab-btn ${activeTab === "ALL" ? "active" : ""}`}
            onClick={() => setActiveTab("ALL")}
          >
            All Drives ({drives.length})
          </button>

          <button
            className={`filter-tab-btn ${activeTab === "APPLIED" ? "active" : ""}`}
            onClick={() => setActiveTab("APPLIED")}
          >
            My Applications ({userApplications.length})
          </button>
        </div>

        {/* CONTROLS BAR (SEARCH & DROPDOWN FILTERS) */}
        <div className="user-controls-bar">
          <div className="search-box-large">
            <FaSearch className="search-icon-large" />
            <input
              type="text"
              className="search-input-large"
              placeholder="Search drives by title, role, company or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="ALL">All Locations</option>
            <option value="bangalore">Bangalore</option>
            <option value="hyderabad">Hyderabad</option>
            <option value="pune">Pune</option>
            <option value="chennai">Chennai</option>
            <option value="noida">Noida</option>
          </select>

          <select
            className="filter-select"
            value={selectedExperience}
            onChange={(e) => setSelectedExperience(e.target.value)}
          >
            <option value="ALL">All Experience</option>
            <option value="0-1">0 - 1 Year</option>
            <option value="0-2">0 - 2 Years</option>
            <option value="1-3">1 - 3 Years</option>
            <option value="2-5">2 - 5 Years</option>
          </select>

          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="OPEN">Open</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        {/* DRIVES DATA TABLE CARD */}
        <div className="user-drives-card">
          <div className="table-responsive">
            <table className="drives-table">
              <thead>
                <tr>
                  <th>Drive Details</th>
                  <th>Role / Position</th>
                  <th>Location</th>
                  <th>Experience</th>
                  <th>Posted On</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "36px", color: "#64748B" }}>
                      Loading hiring drives from backend...
                    </td>
                  </tr>
                ) : filteredDrives.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "36px", color: "#94A3B8" }}>
                      {activeTab === "NOT_APPLIED"
                        ? "Great job! You have applied to all currently available hiring drives."
                        : "No matching hiring drives found."}
                    </td>
                  </tr>
                ) : (
                  filteredDrives.map((drive) => {
                    const isApplied = appliedDriveIds.has(drive.id);
                    const companyName = drive.companyName || "TechSolutions Inc.";
                    const firstLetter = companyName.charAt(0).toUpperCase();
                    const badgeColor = getBadgeColorClass(companyName);

                    const createdDateStr = drive.createdAt
                      ? new Date(drive.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                      : "24 May 2024";

                    return (
                      <tr key={drive.id}>
                        {/* DRIVE DETAILS (COMPANY LOGO / INITIAL BADGE + DRIVE TITLE) */}
                        <td>
                          <div className="drive-name-cell">
                            {drive.companyLogo ? (
                              <div className="company-logo-badge" style={{ background: "#F1F5F9" }}>
                                <img src={drive.companyLogo} alt={companyName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                              </div>
                            ) : (
                              <div className={`company-logo-badge ${badgeColor}`}>
                                {firstLetter}
                              </div>
                            )}

                            <div>
                              <div className="drive-company-name">{companyName}</div>
                              <div className="drive-title-sub">{drive.driveName}</div>
                              <div className="drive-code-sub">JD-{drive.id}</div>
                            </div>
                          </div>
                        </td>

                        {/* ROLE / POSITION & EMPLOYMENT TYPE */}
                        <td>
                          <div className="role-title">{drive.role}</div>
                          <div className="role-type">{drive.employmentType || "Full-time"}</div>
                        </td>

                        {/* LOCATION */}
                        <td>
                          <div className="location-cell">
                            <div className="location-text">
                              <FaMapMarkerAlt style={{ color: "#94A3B8", fontSize: "12px" }} />
                              {drive.location || "India"}
                            </div>
                            <div className="location-mode">On-site</div>
                          </div>
                        </td>

                        {/* EXPERIENCE */}
                        <td>
                          <div style={{ fontWeight: "700", color: "#0F172A" }}>
                            {drive.experience || "0 - 2 Years"}
                          </div>
                        </td>

                        {/* POSTED ON */}
                        <td>
                          <div className="created-date">{createdDateStr}</div>
                          <span className="created-by">by Admin</span>
                        </td>

                        {/* STATUS */}
                        <td>
                          <span
                            className={`status-badge ${
                              (drive.status || "").toUpperCase() === "OPEN" || (drive.status || "").toUpperCase() === "ACTIVE"
                                ? "status-active"
                                : (drive.status || "").toUpperCase() === "COMPLETED"
                                ? "status-completed"
                                : "status-upcoming"
                            }`}
                          >
                            {(drive.status || "OPEN").toUpperCase()}
                          </span>
                        </td>

                        {/* ACTION */}
                        <td>
                          {isApplied ? (
                            <span className="action-applied-badge" onClick={() => navigate(`/user/drives/${drive.id}`)} style={{ cursor: "pointer" }}>
                              <FaCheck /> Applied
                            </span>
                          ) : (
                            <button
                              className="action-view-btn"
                              onClick={() => navigate(`/user/drives/${drive.id}`)}
                            >
                              View Details <FaEye />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE PAGINATION FOOTER */}
          <div className="table-footer">
            <span>Showing 1 to {filteredDrives.length} of {drives.length} drives</span>

            <div className="pagination-controls">
              <button className="page-btn"><FaChevronLeft /></button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn"><FaChevronRight /></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
