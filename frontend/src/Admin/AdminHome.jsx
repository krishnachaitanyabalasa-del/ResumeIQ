import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/apiService";
import "./AdminHome.css";
import {
  FaFileAlt,
  FaBell,
  FaPlus,
  FaSearch,
  FaBriefcase,
  FaPlay,
  FaClock,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaEllipsisV,
  FaCode,
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

  // Calculate initials (e.g., "John Doe" -> "JD", "Admin" -> "AD")
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
  const [stats, setStats] = useState({
    totalDrives: 0,
    activeDrives: 0,
    upcomingDrives: 0,
    completedDrives: 0
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedLocation, setSelectedLocation] = useState("ALL");

  // Fetch drives and stats from Spring Boot Backend
  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      if (!token) {
        navigate("/login-admin");
        return;
      }

      // Parallel backend requests for My Drives and My Stats
      const [drivesRes, statsRes] = await Promise.all([
        authApi.getMyDrives(),
        authApi.getMyDriveStats()
      ]);

      if (drivesRes && Array.isArray(drivesRes.data)) {
        setDrives(drivesRes.data);
      }

      if (statsRes && statsRes.data) {
        setStats({
          totalDrives: statsRes.data.totalDrives || 0,
          activeDrives: statsRes.data.openDrives || statsRes.data.activeDrives || 0,
          upcomingDrives: statsRes.data.closedDrives || statsRes.data.upcomingDrives || 0,
          completedDrives: statsRes.data.completedDrives || 0
        });
      }
    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
      setErrorMsg("Failed to connect to backend server. Make sure Spring Boot backend is running on http://localhost:8080");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login-admin");
  };

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

  return (
    <div className="admin-dashboard">
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

          <div className="admin-profile-dropdown" onClick={handleLogout} title="Click to Logout">
            <div className="admin-avatar-small">{adminInitials}</div>
            <span className="admin-name-text">{adminName}</span>
            <FaChevronDown style={{ fontSize: "11px", color: "#94A3B8" }} />
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="dashboard-content">
        {/* WELCOME BANNER */}
        <div className="welcome-banner">
          <div className="welcome-avatar">{adminInitials}</div>
          <div className="welcome-text">
            <h1>Welcome back, {adminName}</h1>
            <p>Manage and monitor your hiring drives. {adminEmail && `(${adminEmail})`}</p>
          </div>
        </div>

        {errorMsg && (
          <div className="error-banner" style={{ marginBottom: "24px" }}>
            {errorMsg}
          </div>
        )}

        {/* 4 STATS METRICS GRID */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-purple">
              <FaBriefcase />
            </div>
            <div className="stat-info">
              <label>Total Drives</label>
              <div className="stat-value">{stats.totalDrives}</div>
              <span className="stat-subtitle">All time</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-green">
              <FaPlay />
            </div>
            <div className="stat-info">
              <label>Active Drives</label>
              <div className="stat-value">{stats.activeDrives}</div>
              <span className="stat-subtitle">Currently active</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-orange">
              <FaClock />
            </div>
            <div className="stat-info">
              <label>Closed / Upcoming</label>
              <div className="stat-value">{stats.upcomingDrives}</div>
              <span className="stat-subtitle">Starting / Closed</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-pink">
              <FaCheckCircle />
            </div>
            <div className="stat-info">
              <label>Completed Drives</label>
              <div className="stat-value">{stats.completedDrives}</div>
              <span className="stat-subtitle">Completed</span>
            </div>
          </div>
        </div>

        {/* YOUR DRIVES SECTION */}
        <div className="drives-container-card">
          <div className="drives-header">
            <div className="drives-title-area">
              <h2>Your Drives</h2>
              <p>View and manage all hiring drives created by you.</p>
            </div>

            <button className="create-drive-btn" onClick={() => navigate("/create-drive")}>
              <FaPlus /> Create New Drive
            </button>
          </div>

          {/* CONTROLS BAR */}
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

            <select
              className="filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open / Active</option>
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
              <option value="pune">Pune</option>
              <option value="chennai">Chennai</option>
            </select>

            <select className="filter-select">
              <option>Sort by: Newest</option>
              <option>Sort by: Oldest</option>
            </select>
          </div>

          {/* DATA TABLE */}
          <div className="table-responsive">
            <table className="drives-table">
              <thead>
                <tr>
                  <th>Drive Name</th>
                  <th>Role / Position</th>
                  <th>Location</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Created By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "#64748B" }}>
                      Loading hiring drives from backend...
                    </td>
                  </tr>
                ) : filteredDrives.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "32px", color: "#94A3B8" }}>
                      No hiring drives found in database. Click "+ Create New Drive" above to create one.
                    </td>
                  </tr>
                ) : (
                  filteredDrives.map((drive) => (
                    <tr key={drive.id}>
                      <td>
                        <div className="drive-name-cell">
                          <div className="drive-code-icon">
                            <FaCode />
                          </div>
                          <div>
                            <div className="drive-info-title">{drive.driveName}</div>
                            <div className="drive-info-code">JD-{drive.id}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="role-title">{drive.role}</div>
                        <div className="role-type">{drive.experience || "0-2 years"}</div>
                      </td>

                      <td>
                        <div className="location-cell">
                          <div className="location-text">
                            <FaMapMarkerAlt style={{ color: "#94A3B8", fontSize: "12px" }} />
                            {drive.location}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="candidates-count">{drive.companyName || "Google"}</div>
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
                        <div className="created-date">{drive.createdByEmail || adminEmail}</div>
                      </td>

                      <td>
                        <button className="action-btn-view" onClick={() => alert(`Drive: ${drive.driveName}\nCompany: ${drive.companyName}\nRole: ${drive.role}\nLocation: ${drive.location}`)}>
                          View Details
                        </button>
                        <button className="action-dots">
                          <FaEllipsisV />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER & PAGINATION */}
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
