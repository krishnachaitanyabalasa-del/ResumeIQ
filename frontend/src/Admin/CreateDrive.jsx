import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/apiService";
import AdminNavbar from "../components/AdminNavbar";
import StatusModal from "../components/StatusModal";
import "./CreateDrive.css";
import {
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

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: ""
  });

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

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Preset Companies
  const presetLogos = [
    { name: "Infosys", logo: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg" },
    { name: "TCS", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg" },
    { name: "Wipro", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg" },
    { name: "Accenture", logo: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Accenture.svg" }
  ];

  const handleSelectPreset = (company) => {
    setForm((prev) => ({ ...prev, companyName: company.name }));
    setLogoPreviewUrl(company.logo);
    setCompanyLogoFile(null);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.companyName.trim()) {
      setErrorMessage("Company Name is required.");
      return;
    }
    if (!form.driveName.trim()) {
      setErrorMessage("Drive Title is required.");
      return;
    }
    if (!form.role.trim()) {
      setErrorMessage("Role / Position is required.");
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

      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Drive Created Successfully!",
        message: "Hiring drive details and Job Description criteria have been saved."
      });
    } catch (err) {
      console.error("Create Drive Error:", err);
      let msg = "Failed to create drive. Check backend server connection.";
      if (err.response && err.response.data && err.response.data.error) {
        msg = err.response.data.error;
      }
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Creation Failed",
        message: msg
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-drive-container">
      {/* REUSABLE ADMIN NAVBAR */}
      <AdminNavbar />

      {/* CONTENT WRAPPER */}
      <main className="create-drive-content">
        {/* HEADER BAR */}
        <div className="page-header-row">
          <div className="header-title">
            <h1>Create Hiring Drive</h1>
            <p>Set up a new recruitment drive and configure job criteria for Gemini AI resume parsing.</p>
          </div>

          <button className="back-btn" onClick={() => navigate("/admin-home")}>
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>

        {errorMessage && (
          <div className="error-banner" style={{ background: "#FEE2E2", color: "#B91C1C", padding: "14px 20px", borderRadius: "12px", marginBottom: "20px" }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="drive-form">
          {/* SECTION 1: COMPANY INFORMATION */}
          <div className="form-card">
            <h2>1. Company Details</h2>

            <div className="form-grid-2col">
              <div className="input-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="e.g. TechSolutions Inc."
                  value={form.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Company Logo</label>
                <div className="logo-upload-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    id="logo-input"
                    onChange={handleLogoChange}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="logo-input" className="upload-logo-btn">
                    <FaCloudUploadAlt /> Choose File
                  </label>

                  {logoPreviewUrl && (
                    <div className="logo-preview-box">
                      <img src={logoPreviewUrl} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PRESET LOGOS */}
            <div className="preset-logos-row">
              <span>Or choose preset:</span>
              {presetLogos.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  className="preset-logo-pill"
                  onClick={() => handleSelectPreset(p)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2: DRIVE DETAILS */}
          <div className="form-card">
            <h2>2. Drive Details</h2>

            <div className="form-grid-2col" style={{ marginBottom: "16px" }}>
              <div className="input-group">
                <label>Drive Title *</label>
                <input
                  type="text"
                  name="driveName"
                  placeholder="e.g. Java Developer Drive"
                  value={form.driveName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Role / Position *</label>
                <input
                  type="text"
                  name="role"
                  placeholder="e.g. Java Developer"
                  value={form.role}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-grid-3col">
              <div className="input-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Bangalore, India"
                  value={form.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Experience Required *</label>
                <input
                  type="text"
                  name="experience"
                  placeholder="e.g. 0 - 2 Years"
                  value={form.experience}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group">
                <label>Application Last Date *</label>
                <input
                  type="date"
                  name="lastDate"
                  value={form.lastDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-grid-2col" style={{ marginTop: "16px" }}>
              <div className="input-group">
                <label>Employment Type *</label>
                <select
                  name="employmentType"
                  className="filter-select"
                  style={{ width: "100%", padding: "12px" }}
                  value={form.employmentType}
                  onChange={handleChange}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="input-group">
                <label>Drive Storage Folder Name</label>
                <input
                  type="text"
                  name="driveFolder"
                  placeholder="e.g. JavaDev_2024_01"
                  value={form.driveFolder}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group" style={{ marginTop: "16px" }}>
              <label>Drive Overview / Brief Description</label>
              <textarea
                name="description"
                rows="3"
                placeholder="Enter a short summary about this hiring drive..."
                value={form.description}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          {/* SECTION 3: JOB DESCRIPTION (JD) SOURCE */}
          <div className="form-card">
            <h2>3. Job Description (JD) Source</h2>

            <div className="jd-type-switcher">
              <label className={`radio-label ${form.jdType === "pdf" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="jdType"
                  value="pdf"
                  checked={form.jdType === "pdf"}
                  onChange={handleChange}
                />
                Upload JD PDF File
              </label>

              <label className={`radio-label ${form.jdType === "text" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="jdType"
                  value="text"
                  checked={form.jdType === "text"}
                  onChange={handleChange}
                />
                Paste JD Text Directly
              </label>
            </div>

            {form.jdType === "pdf" ? (
              <div className="jd-upload-box" onClick={() => document.getElementById("jd-pdf-input").click()}>
                <FaCloudUploadAlt className="upload-icon" />
                <p>{jdFile ? jdFile.name : "Click to upload Job Description (PDF)"}</p>
                <span className="sub-text">PDF document up to 10MB</span>
                <input
                  type="file"
                  id="jd-pdf-input"
                  accept=".pdf,application/pdf"
                  style={{ display: "none" }}
                  onChange={(e) => setJdFile(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="input-group">
                <textarea
                  name="jdText"
                  rows="6"
                  placeholder="Paste complete Job Description text here including skills, experience, qualifications..."
                  value={form.jdText}
                  onChange={handleChange}
                ></textarea>
              </div>
            )}
          </div>

          {/* FORM FOOTER ACTIONS */}
          <div className="form-actions-row">
            <button type="button" className="cancel-btn" onClick={() => navigate("/admin-home")}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Creating Hiring Drive..." : "Create Hiring Drive"}
            </button>
          </div>
        </form>
      </main>

      <StatusModal
        isOpen={statusModal.isOpen}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => {
          setStatusModal({ ...statusModal, isOpen: false });
          if (statusModal.type === "success") {
            navigate("/admin-home");
          }
        }}
      />
    </div>
  );
}
