import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/apiService";
import "./CreateDrive.css";
import {
  FaFileAlt,
  FaBell,
  FaArrowLeft,
  FaPlus,
  FaBriefcase,
  FaCloudUploadAlt,
  FaFilePdf,
  FaFileText,
  FaInfoCircle,
  FaCog,
  FaCheck
} from "react-icons/fa";

export default function CreateDrive() {
  const navigate = useNavigate();

  // Form State
  const [form, setForm] = useState({
    driveName: "",
    companyName: "TCS",
    role: "",
    location: "Bangalore, India",
    experience: "0-2 years",
    driveFolder: "",
    description: "",
    jdType: "pdf", // 'pdf' or 'text'
    jdText: "",
    minScore: 60,
    autoShortlist: true,
    shortlistLimit: 20
  });

  // Files
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
  const [jdFile, setJdFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle Logo Upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyLogoFile(file);
      setLogoPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handle PDF Upload
  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setJdFile(file);
    }
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.driveName.trim()) {
      setErrorMessage("Drive Name is required.");
      return;
    }
    if (!form.role.trim()) {
      setErrorMessage("Role / Position is required.");
      return;
    }

    if (form.jdType === "pdf" && !jdFile) {
      setErrorMessage("Please select a Job Description PDF file.");
      return;
    }
    if (form.jdType === "text" && !form.jdText.trim()) {
      setErrorMessage("Please enter Job Description text.");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("companyName", form.companyName);
      formData.append("driveName", form.driveName);
      formData.append("role", form.role);
      formData.append("location", form.location);
      formData.append("experience", form.experience);
      formData.append("description", form.description);

      if (form.jdType === "text") {
        formData.append("jdText", form.jdText);
      } else if (form.jdType === "pdf" && jdFile) {
        formData.append("jdFile", jdFile);
      }

      await authApi.createDrive(formData);

      alert("Hiring Drive created successfully!");
      navigate("/admin-home");
    } catch (err) {
      console.error("Create Drive Error:", err);
      let msg = "Failed to create drive. Check backend server connection.";
      if (err.response && err.response.data && err.response.data.error) {
        msg = err.response.data.error;
      }
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-drive-page">
      {/* HEADER NAVBAR */}
      <nav className="dashboard-navbar">
        <div className="navbar-brand" onClick={() => navigate("/")}>
          <div className="navbar-brand-icon">
            <FaFileAlt />
          </div>
          <div className="navbar-brand-text">
            <h2>ResumeIQ</h2>
            <p>AI-Powered Resume Screening & Candidate Matching</p>
          </div>
        </div>

        <div className="navbar-right">
          <div className="notification-btn">
            <FaBell />
            <span className="notification-badge">3</span>
          </div>

          <button className="cancel-btn" style={{ padding: "8px 16px" }} onClick={() => navigate("/admin-home")}>
            <FaArrowLeft /> Back to Drives
          </button>

          <button className="create-drive-btn" style={{ padding: "8px 16px" }} onClick={handleSubmit}>
            <FaPlus /> Create New Drive
          </button>
        </div>
      </nav>

      {/* PAGE TITLE */}
      <div className="page-title-section">
        <h1>Create New Drive</h1>
        <p>Create a new screening drive to evaluate and match candidates.</p>
      </div>

      {/* MAIN FORM */}
      <form onSubmit={handleSubmit} className="create-drive-container">
        {errorMessage && (
          <div className="error-banner" style={{ background: "#FEE2E2", color: "#B91C1C", padding: "14px 20px", borderRadius: "12px", fontSize: "14px", fontWeight: "600" }}>
            {errorMessage}
          </div>
        )}

        <div className="form-columns-grid">
          {/* SECTION 1: DRIVE INFORMATION */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon-badge">
                <FaBriefcase />
              </div>
              <div>
                <h3>1. Drive Information</h3>
              </div>
            </div>

            {/* COMPANY LOGO UPLOAD */}
            <div className="logo-upload-row">
              <div className="logo-dropzone" onClick={() => document.getElementById("logo-input").click()}>
                <FaCloudUploadAlt className="upload-icon" />
                <h5>Click to upload logo</h5>
                <p>PNG, JPG or SVG (max. 2MB)</p>
                <input
                  type="file"
                  id="logo-input"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: "none" }}
                />
              </div>

              <div className="logo-preview-box">
                <span style={{ fontSize: "10px", color: "#94A3B8", marginBottom: "4px" }}>Preview</span>
                {logoPreviewUrl ? (
                  <img src={logoPreviewUrl} alt="Logo Preview" className="logo-preview-img" />
                ) : (
                  <div style={{ textAlign: "center", color: "#4F46E5", fontWeight: "800", fontSize: "14px" }}>
                    TATA
                  </div>
                )}
                <span className="change-logo-link" onClick={() => document.getElementById("logo-input").click()}>
                  Change Logo
                </span>
              </div>
            </div>

            {/* DRIVE NAME */}
            <div className="form-group-field">
              <label>Drive Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Java Developer Drive"
                value={form.driveName}
                onChange={(e) => setForm({ ...form, driveName: e.target.value })}
                required
              />
              <div className="field-hint">Give a clear and descriptive name to your drive.</div>
            </div>

            {/* COMPANY & ROLE 2-COL */}
            <div className="input-row-2col">
              <div className="form-group-field">
                <label>Company / Organization *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., TCS"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group-field">
                <label>Role / Position *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Java Developer"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* DRIVE FOLDER */}
            <div className="form-group-field">
              <label>Drive Folder (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., /Drives/May 2024/Java Developer"
                value={form.driveFolder}
                onChange={(e) => setForm({ ...form, driveFolder: e.target.value })}
              />
              <div className="field-hint">Helps you organize drives in folders. If left empty, it will be saved in "My Drives".</div>
            </div>

            {/* DRIVE DESCRIPTION */}
            <div className="form-group-field">
              <label>Drive Description (Optional)</label>
              <textarea
                className="form-input"
                rows="4"
                maxLength="500"
                placeholder="Add notes about this drive, hiring goals, team, etc."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              ></textarea>
              <div className="field-hint" style={{ textAlign: "right" }}>
                {form.description.length} / 500
              </div>
            </div>
          </div>

          {/* SECTION 2: JOB DESCRIPTION */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-icon-badge">
                <FaFileText />
              </div>
              <div>
                <h3>2. Job Description</h3>
                <p>Add the job description for this drive.</p>
              </div>
            </div>

            <label style={{ fontSize: "13px", fontWeight: "700", display: "block", marginBottom: "8px" }}>
              Add Job Description *
            </label>

            {/* TABS TOGGLE */}
            <div className="jd-tabs">
              <button
                type="button"
                className={`jd-tab-btn ${form.jdType === "pdf" ? "active" : ""}`}
                onClick={() => setForm({ ...form, jdType: "pdf" })}
              >
                <FaFilePdf /> Upload JD (PDF)
              </button>

              <button
                type="button"
                className={`jd-tab-btn ${form.jdType === "text" ? "active" : ""}`}
                onClick={() => setForm({ ...form, jdType: "text" })}
              >
                <FaFileText /> Enter JD as Text
              </button>
            </div>

            {/* TAB CONTENT: PDF */}
            {form.jdType === "pdf" ? (
              <div className="pdf-drag-box">
                <FaCloudUploadAlt style={{ fontSize: "36px", color: "#4F46E5", marginBottom: "10px" }} />
                <h4 style={{ fontSize: "14px", fontWeight: "700", color: "#1E293B" }}>
                  {jdFile ? jdFile.name : "Drag & drop your JD PDF here"}
                </h4>
                <p style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px" }}>or</p>
                <button
                  type="button"
                  className="choose-file-btn"
                  onClick={() => document.getElementById("pdf-input").click()}
                >
                  Choose File
                </button>
                <input
                  type="file"
                  id="pdf-input"
                  accept=".pdf"
                  onChange={handlePdfChange}
                  style={{ display: "none" }}
                />
                <p style={{ fontSize: "11px", color: "#94A3B8", marginTop: "12px" }}>PDF up to 10 MB</p>
              </div>
            ) : (
              /* TAB CONTENT: TEXT */
              <div className="form-group-field">
                <textarea
                  className="form-input"
                  rows="10"
                  placeholder="Paste raw Job Description requirements here..."
                  value={form.jdText}
                  onChange={(e) => setForm({ ...form, jdText: e.target.value })}
                ></textarea>
              </div>
            )}

            {/* TIP ALERT BOX */}
            <div className="tip-alert-box">
              <FaInfoCircle style={{ fontSize: "16px", flexShrink: 0 }} />
              <span>Tip: A well-defined job description improves matching accuracy.</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: SETTINGS */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-icon-badge">
              <FaCog />
            </div>
            <div>
              <h3>3. Settings</h3>
            </div>
          </div>

          <div className="settings-grid">
            <div className="form-group-field" style={{ marginBottom: 0 }}>
              <label>Minimum Match Score (%) <FaInfoCircle style={{ color: "#94A3B8", fontSize: "12px" }} /></label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="number"
                  className="form-input"
                  value={form.minScore}
                  onChange={(e) => setForm({ ...form, minScore: e.target.value })}
                  min="0"
                  max="100"
                />
                <span style={{ fontWeight: "700", color: "#64748B" }}>%</span>
              </div>
              <div className="field-hint">Candidates scoring below this will be marked as Rejected.</div>
            </div>

            <div className="form-group-field" style={{ marginBottom: 0 }}>
              <label>Auto Shortlist <FaInfoCircle style={{ color: "#94A3B8", fontSize: "12px" }} /></label>
              <div className="toggle-switch-container">
                <label className="switch-label">
                  <input
                    type="checkbox"
                    checked={form.autoShortlist}
                    onChange={(e) => setForm({ ...form, autoShortlist: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="field-hint">Automatically shortlist candidates above minimum score.</div>
            </div>

            <div className="form-group-field" style={{ marginBottom: 0 }}>
              <label>Shortlist Limit (Optional) <FaInfoCircle style={{ color: "#94A3B8", fontSize: "12px" }} /></label>
              <input
                type="number"
                className="form-input"
                value={form.shortlistLimit}
                onChange={(e) => setForm({ ...form, shortlistLimit: e.target.value })}
              />
              <div className="field-hint">Maximum number of candidates to shortlist.</div>
            </div>
          </div>
        </div>

        {/* FOOTER ACTION BUTTONS */}
        <div className="form-footer-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate("/admin-home")}>
            Cancel
          </button>
          <button type="submit" className="create-drive-btn" disabled={submitting}>
            {submitting ? "Creating..." : <>Create Drive <FaCheck /></>}
          </button>
        </div>
      </form>
    </div>
  );
}
