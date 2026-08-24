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
  FaInfoCircle,
  FaCheck,
  FaBuilding,
  FaCalendarAlt
} from "react-icons/fa";

export default function CreateDrive() {
  const navigate = useNavigate();

  // Form State
  const [form, setForm] = useState({
    driveName: "",
    companyName: "",
    role: "",
    location: "",
    experience: "",
    lastDate: "",
    employmentType: "Full-time",
    driveFolder: "",
    description: "",
    jdType: "pdf", // 'pdf' or 'text'
    jdText: ""
  });

  // Files
  const [companyLogoFile, setCompanyLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState(null);
  const [jdFile, setJdFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle Logo Upload with Base64 conversion
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
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
    if (!form.companyName.trim()) {
      setErrorMessage("Company / Organization Name is required.");
      return;
    }
    if (!form.role.trim()) {
      setErrorMessage("Role / Position is required.");
      return;
    }
    if (!form.location.trim()) {
      setErrorMessage("Location is required.");
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
      formData.append("lastDate", form.lastDate);
      formData.append("employmentType", form.employmentType);
      formData.append("description", form.description);

      if (companyLogoFile) {
        formData.append("companyLogoFile", companyLogoFile);
      }
      if (logoPreviewUrl) {
        formData.append("companyLogo", logoPreviewUrl);
      }

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
    <div className="create-drive-container">
      {/* NAVBAR */}
      <nav className="create-drive-navbar">
        <div className="nav-left" onClick={() => navigate("/admin-home")}>
          <div className="nav-brand-icon">
            <FaFileAlt />
          </div>
          <div className="nav-brand-text">
            <h2>ResumeIQ</h2>
            <p>Find Best Opportunities. Apply. Get Matched.</p>
          </div>
        </div>

        <div className="nav-right">
          <div className="notification-btn">
            <FaBell />
            <span className="notification-badge">3</span>
          </div>

          <div className="user-profile-badge">
            <div className="user-avatar">A</div>
            <span>Admin</span>
          </div>
        </div>
      </nav>

      {/* CONTENT WRAPPER */}
      <main className="create-drive-content">
        {/* HEADER BAR */}
        <div className="page-header-row">
          <div className="header-title">
            <h1>Create Hiring Drive</h1>
            <p>Set up a new recruitment drive and configure job criteria for Gemini AI resume parsing.</p>
          </div>

          <button className="back-btn" onClick={() => navigate("/admin-home")}>
            <FaArrowLeft /> Back to Drives
          </button>
        </div>

        {errorMessage && <div className="error-banner-alert">{errorMessage}</div>}

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit} className="create-drive-form">
          {/* SECTION 1: BASIC INFORMATION */}
          <div className="form-section-card">
            <div className="section-header">
              <div className="section-icon-badge">
                <FaBriefcase />
              </div>
              <div>
                <h2>Drive Information</h2>
                <p>Basic details about the hiring campaign and role</p>
              </div>
            </div>

            {/* COMPANY LOGO UPLOAD & PREVIEW */}
            <div className="form-group-field">
              <label>Company Logo (Optional)</label>
              <div className="logo-upload-wrapper">
                <div
                  className="logo-dropzone"
                  onClick={() => document.getElementById("logo-input").click()}
                >
                  <FaBuilding className="logo-drop-icon" />
                  <p>Click to upload Company Logo image</p>

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
                    <div style={{ textAlign: "center", color: "#CBD5E1" }}>
                      <FaBuilding style={{ fontSize: "24px" }} />
                      <div style={{ fontSize: "10px", color: "#94A3B8", marginTop: "2px" }}>No Logo</div>
                    </div>
                  )}
                  <span className="change-logo-link" onClick={() => document.getElementById("logo-input").click()}>
                    {logoPreviewUrl ? "Change Logo" : "Upload Logo"}
                  </span>
                </div>
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

            {/* LOCATION & EMPLOYMENT TYPE 2-COL */}
            <div className="input-row-2col">
              <div className="form-group-field">
                <label>Location *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Bangalore, India"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                />
              </div>

              <div className="form-group-field">
                <label>Employment Type *</label>
                <select
                  className="form-input"
                  value={form.employmentType}
                  onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                  required
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            {/* EXPERIENCE & APPLICATION LAST DATE 2-COL */}
            <div className="input-row-2col">
              <div className="form-group-field">
                <label>Experience Required (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., 0-2 years"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                />
              </div>

              <div className="form-group-field">
                <label>Application Last Date (Optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={form.lastDate}
                  onChange={(e) => setForm({ ...form, lastDate: e.target.value })}
                />
                <div className="field-hint">Last date candidates can submit applications.</div>
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
              <div className="field-hint">Helps organize drives in custom folders.</div>
            </div>

            {/* DESCRIPTION */}
            <div className="form-group-field">
              <label>Description / Notes (Optional)</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Internal notes or additional details about this drive..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              ></textarea>
            </div>
          </div>

          {/* SECTION 2: JOB DESCRIPTION (JD) ATTACHMENT */}
          <div className="form-section-card">
            <div className="section-header">
              <div className="section-icon-badge" style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}>
                <FaFilePdf />
              </div>
              <div>
                <h2>Job Description (JD) Requirements</h2>
                <p>Upload a JD PDF or paste JD text for AI parsing and candidate matching</p>
              </div>
            </div>

            {/* JD TYPE SELECTOR TABS */}
            <div className="jd-type-toggle">
              <button
                type="button"
                className={`jd-type-btn ${form.jdType === "pdf" ? "active" : ""}`}
                onClick={() => setForm({ ...form, jdType: "pdf" })}
              >
                <FaCloudUploadAlt /> Upload PDF File
              </button>

              <button
                type="button"
                className={`jd-type-btn ${form.jdType === "text" ? "active" : ""}`}
                onClick={() => setForm({ ...form, jdType: "text" })}
              >
                <FaFileAlt /> Paste Text Directly
              </button>
            </div>

            {form.jdType === "pdf" ? (
              <div className="form-group-field">
                <label>Upload JD PDF File *</label>

                <div
                  className={`file-drop-zone ${jdFile ? "has-file" : ""}`}
                  onClick={() => document.getElementById("jd-file-input").click()}
                >
                  {jdFile ? (
                    <div className="file-success-box">
                      <FaCheck className="check-icon" />
                      <div>
                        <div className="file-name-text">{jdFile.name}</div>
                        <div className="file-size-text">
                          {(jdFile.size / 1024).toFixed(1)} KB • PDF Document
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="drop-prompt">
                      <FaCloudUploadAlt className="upload-icon-huge" />
                      <h3>Click to browse or drag & drop Job Description PDF</h3>
                      <p>Supports .pdf files up to 10MB</p>
                    </div>
                  )}

                  <input
                    type="file"
                    id="jd-file-input"
                    accept="application/pdf,.pdf"
                    onChange={handlePdfChange}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            ) : (
              <div className="form-group-field">
                <label>Job Description Content *</label>
                <textarea
                  className="form-textarea"
                  rows="10"
                  placeholder="Paste full Job Description text here including required skills, education, experience, and responsibilities..."
                  value={form.jdText}
                  onChange={(e) => setForm({ ...form, jdText: e.target.value })}
                ></textarea>
                <div className="field-hint">
                  Gemini AI will analyze this text to evaluate applicant resumes automatically.
                </div>
              </div>
            )}
          </div>

          {/* FORM ACTIONS FOOTER */}
          <div className="form-actions-footer">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/admin-home")}
            >
              Cancel
            </button>

            <button type="submit" className="submit-drive-btn" disabled={submitting}>
              {submitting ? (
                "Creating Drive & Parsing JD..."
              ) : (
                <>
                  <FaPlus /> Create Hiring Drive
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
