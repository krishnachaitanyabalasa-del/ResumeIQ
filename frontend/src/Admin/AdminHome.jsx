import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/apiService";
import AdminNavbar from "../components/AdminNavbar";
import "./AdminHome.css";
import {
  FaPlus,
  FaSearch,
  FaBriefcase,
  FaPlay,
  FaClock,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

export default function AdminHome() {
  const navigate = useNavigate();

  // Read logged in admin details from sessionStorage
  const adminName = sessionStorage.getItem("name") || "Admin";
  const adminEmail = sessionStorage.getItem("email") || "";
  const token = sessionStorage.getItem("token");

  // Calculate initials
  const getInitials = (name) => {
    if (!name) return "AD";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const adminInitials = getInitials(adminName);

  // Dynamic Backend Data States
  const [drives, setDrives] = useState([]);
  const [applicationsCountMap, setApplicationsCountMap] = useState({});
  const [stats, setStats] = useState({
    totalDrives: 0,
    openDrives: 0,
    closedDrives: 0,
    upcomingDrives: 0,
    completedDrives: 0
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedLocation, setSelectedLocation] = useState("ALL");

  // Fetch drives, applications, and stats from Spring Boot Backend
  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      if (!token) {
        navigate("/login-admin");
        return;
      }

      const [drivesRes, statsRes, appsRes] = await Promise.allSettled([
        authApi.getMyDrives(),
        authApi.getMyDriveStats(),
        authApi.getAllApplications()
      ]);

      if (drivesRes.status === "fulfilled" && drivesRes.value && Array.isArray(drivesRes.value.data)) {
        setDrives(drivesRes.value.data);
      }

      if (statsRes.status === "fulfilled" && statsRes.value && statsRes.value.data) {
        setStats(statsRes.value.data);
      }

      if (appsRes.status === "fulfilled" && appsRes.value && Array.isArray(appsRes.value.data)) {
        const counts = {};
        appsRes.value.data.forEach((app) => {
          const dId = app.drive?.id || app.driveId;
          if (dId) {
            counts[dId] = (counts[dId] || 0) + 1;
          }
        });
        setApplicationsCountMap(counts);
      }
    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
      setErrorMsg("Failed to connect to backend server. Make sure Spring Boot backend is active on Render (https://resumeiq-backend-d7s5.onrender.com)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter drives dynamically
  const filteredDrives = drives.filter((d) => {
    const matchSearch =
      (d.driveName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.role || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.companyName || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus =
      selectedStatus === "ALL" || (d.status || "").toUpperCase() === selectedStatus.toUpperCase();

    const matchLocation =
      selectedLocation === "ALL" || (d.location || "").toLowerCase().includes(selectedLocation.toLowerCase());

    return matchSearch && matchStatus && matchLocation;
  });

  const totalDrivesCount = drives.length || stats.totalDrives || 0;
  const activeDrivesCount = drives.length > 0
    ? drives.filter((d) => (d.status || "").toUpperCase() === "OPEN" || (d.status || "").toUpperCase() === "ACTIVE").length
    : (stats.openDrives || 0);

  const closedUpcomingCount = drives.length > 0
    ? drives.filter((d) => (d.status || "").toUpperCase() === "UPCOMING" || (d.status || "").toUpperCase() === "CLOSED").length
    : ((stats.closedDrives || 0) + (stats.upcomingDrives || 0));

  const completedDrivesCount = drives.length > 0
    ? drives.filter((d) => (d.status || "").toUpperCase() === "COMPLETED").length
    : (stats.completedDrives || 0);

  return (
    <div className="admin-dashboard">
      {/* GLOBAL REUSABLE ADMIN NAVBAR */}
      <AdminNavbar />

      {/* DASHBOARD CONTAINER */}
      <main className="dashboard-content">
        {/* WELCOME BANNER HEADER */}
        <div className="welcome-banner">
          <div className="welcome-avatar-large">{adminInitials}</div>
          <div className="welcome-text">
            <h1>Welcome back, {adminName}</h1>
            <p>Manage and monitor your hiring drives. ({adminEmail || "admin@gmail.com"})</p>
          </div>
        </div>

        {errorMsg && (
          <div className="error-banner" style={{ background: "#FEE2E2", color: "#B91C1C", padding: "14px 20px", borderRadius: "12px", marginBottom: "20px" }}>
            {errorMsg}
          </div>
        )}

        {/* 4 STATS CARDS ROW */}
        <div className="stats-cards-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper icon-blue">
              <FaBriefcase />
            </div>
            <div className="stat-content">
              <span className="stat-label">Total Drives</span>
              <div className="stat-value">{totalDrivesCount}</div>
              <span className="stat-subtitle">All time</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper icon-green">
              <FaPlay />
            </div>
            <div className="stat-content">
              <span className="stat-label">Active Drives</span>
              <div className="stat-value">{activeDrivesCount}</div>
              <span className="stat-subtitle">Currently active</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper icon-orange">
              <FaClock />
            </div>
            <div className="stat-content">
              <span className="stat-label">Closed / Upcoming</span>
              <div className="stat-value">{closedUpcomingCount}</div>
              <span className="stat-subtitle">Starting / Closed</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper icon-purple">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <span className="stat-label">Completed Drives</span>
              <div className="stat-value">{completedDrivesCount}</div>
              <span className="stat-subtitle">Completed</span>
            </div>
          </div>
        </div>

        {/* YOUR DRIVES SECTION CARD */}
        <div className="drives-section-card">
          <div className="drives-section-header">
            <div>
              <h2>Your Drives</h2>
              <p>View and manage all hiring drives created by you.</p>
            </div>

            <button className="create-drive-primary-btn" onClick={() => navigate("/create-drive")}>
              <FaPlus /> Create New Drive
            </button>
          </div>

          {/* CONTROLS BAR: SEARCH & DROPDOWN FILTERS */}
          <div className="controls-bar">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search drives by name, role, company or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-dropdowns">
              <select
                className="filter-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="CLOSED">Closed</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <select
                className="filter-select"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="ALL">All Locations</option>
                <option value="bangalore">Bangalore</option>
                <option value="hyderabad">Hyderabad</option>
                <option value="amaravati">Amaravati</option>
                <option value="pune">Pune</option>
              </select>

              <select className="filter-select">
                <option value="NEWEST">Sort by: Newest</option>
                <option value="OLDEST">Sort by: Oldest</option>
              </select>
            </div>
          </div>

          {/* DRIVES DATA TABLE */}
          <div className="table-responsive">
            <table className="drives-table">
              <thead>
                <tr>
                  <th>DRIVE NAME</th>
                  <th>ROLE / POSITION</th>
                  <th>LOCATION</th>
                  <th>CANDIDATES</th>
                  <th>STATUS</th>
                  <th>CREATED ON</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "#64748B" }}>
                      Loading hiring drives from database...
                    </td>
                  </tr>
                ) : filteredDrives.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "#94A3B8" }}>
                      No hiring drives found in database. Click "+ Create New Drive" above to create one.
                    </td>
                  </tr>
                ) : (
                  filteredDrives.map((drive) => {
                    const companyFirstLetter = (drive.companyName || drive.driveName || "C")
                      .charAt(0)
                      .toUpperCase();

                    const appliedCount = applicationsCountMap[drive.id] || drive.applicationsCount || 0;

                    return (
                      <tr key={drive.id}>
                        <td>
                          <div className="drive-name-cell">
                            <div className="drive-code-icon">
                              {drive.companyLogo ? (
                                <img
                                  src={drive.companyLogo}
                                  alt={drive.companyName || "Logo"}
                                  className="drive-company-logo-img"
                                />
                              ) : (
                                <span className="company-initial-badge">{companyFirstLetter}</span>
                              )}
                            </div>
                            <div>
                              <div className="drive-info-title">{drive.driveName}</div>
                              <div className="drive-info-code">JD-{drive.id}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="role-title">{drive.role}</div>
                          <div className="role-type">{drive.experience || "Full-time"}</div>
                        </td>

                        <td>
                          <div className="location-cell">
                            <div className="location-text">
                              <FaMapMarkerAlt style={{ color: "#94A3B8", fontSize: "12px" }} />
                              {drive.location}
                            </div>
                          </div>
                        </td>

                        {/* LIVE CANDIDATES APPLIED COUNT */}
                        <td>
                          <div className="candidates-count">{appliedCount}</div>
                          <span className="candidates-label">Applied</span>
                        </td>

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

                        <td>
                          <div className="created-date">
                            {drive.createdAt
                              ? new Date(drive.createdAt).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric"
                                })
                              : "24 May 2024"}
                          </div>
                          <span className="created-by">by {drive.createdByEmail || adminName}</span>
                        </td>

                        <td>
                          <button className="action-btn-view" onClick={() => navigate(`/admin/drives/${drive.id}`)}>
                            View Details
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
          <div className="table-footer">
            <span>Showing {filteredDrives.length} of {drives.length} drives</span>

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
