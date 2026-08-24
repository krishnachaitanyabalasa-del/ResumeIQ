import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authApi } from "../api/apiService";
import UserNavbar from "../components/UserNavbar";
import "./ApplyDrive.css";
import {
  FaArrowLeft,
  FaCloudUploadAlt,
  FaFilePdf,
  FaTrashAlt,
  FaPlus,
  FaPaperPlane,
  FaCheck
} from "react-icons/fa";

export default function ApplyDrive() {
  const { driveId } = useParams();
  const navigate = useNavigate();

  // Logged-in user details
  const userId = sessionStorage.getItem("userId");
  const userName = sessionStorage.getItem("name") || "";
  const userEmail = sessionStorage.getItem("email") || "";

  // Drive state
  const [drive, setDrive] = useState(null);
  const [loadingDrive, setLoadingDrive] = useState(true);

  // Resume File
  const [resumeFile, setResumeFile] = useState(null);

  // Form State (9 Sections matching mockup)
  const [personalInfo, setPersonalInfo] = useState({
    fullName: userName,
    email: userEmail,
    phone: "",
    countryCode: "+91",
    linkedIn: "",
    portfolio: "",
    currentLocation: ""
  });

  const [summary, setSummary] = useState("");

  const [skillsInput, setSkillsInput] = useState("");

  const [educationList, setEducationList] = useState([
    { degree: "", institute: "", passingYear: "", cgpa: "" }
  ]);

  const [experienceList, setExperienceList] = useState([
    { companyName: "", role: "", startDate: "", endDate: "", currentlyWorking: false }
  ]);

  const [projectsList, setProjectsList] = useState([
    { projectTitle: "", technologies: "", projectLink: "" }
  ]);

  const [certificationsInput, setCertificationsInput] = useState("");
  const [achievementsInput, setAchievementsInput] = useState("");

  // Submitting states
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Suggested Skill Tag List
  const suggestedSkills = [
    "Java",
    "Spring Boot",
    "React",
    "SQL",
    "JavaScript",
    "Git",
    "REST APIs",
    "Docker"
  ];

  // Fetch Drive Details
  useEffect(() => {
    const fetchDrive = async () => {
      try {
        const res = await authApi.getDriveById(driveId);
        if (res && res.data) {
          setDrive(res.data);
        }
      } catch (err) {
        console.error("Error loading drive:", err);
      } finally {
        setLoadingDrive(false);
      }
    };
    fetchDrive();
  }, [driveId]);

  // Skill tag click handler
  const handleAddSkillTag = (skill) => {
    if (!skillsInput) {
      setSkillsInput(skill);
    } else if (!skillsInput.toLowerCase().includes(skill.toLowerCase())) {
      setSkillsInput(skillsInput + ", " + skill);
    }
  };

  // Add Dynamic Rows
  const handleAddEducation = () => {
    setEducationList([...educationList, { degree: "", institute: "", passingYear: "", cgpa: "" }]);
  };

  const handleAddExperience = () => {
    setExperienceList([...experienceList, { companyName: "", role: "", startDate: "", endDate: "", currentlyWorking: false }]);
  };

  const handleAddProject = () => {
    setProjectsList([...projectsList, { projectTitle: "", technologies: "", projectLink: "" }]);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!personalInfo.fullName.trim()) {
      setErrorMessage("Full Name is required.");
      return;
    }
    if (!personalInfo.email.trim()) {
      setErrorMessage("Email address is required.");
      return;
    }
    if (!personalInfo.phone.trim()) {
      setErrorMessage("Phone number is required.");
      return;
    }
    if (!personalInfo.currentLocation.trim()) {
      setErrorMessage("Current Location is required.");
      return;
    }

    setSubmitting(true);

    try {
      const educationText = educationList
        .filter((e) => e.degree || e.institute)
        .map((e) => `${e.degree} at ${e.institute} (${e.passingYear}) - CGPA: ${e.cgpa}`)
        .join("; ");

      const experienceText = experienceList
        .filter((x) => x.companyName || x.role)
        .map((x) => `${x.role} at ${x.companyName} (${x.startDate} to ${x.currentlyWorking ? "Present" : x.endDate})`)
        .join("; ");

      const projectsText = projectsList
        .filter((p) => p.projectTitle)
        .map((p) => `${p.projectTitle} [${p.technologies}] - ${p.projectLink}`)
        .join("; ");

      const formData = new FormData();
      if (resumeFile) {
        formData.append("file", resumeFile);
      }
      formData.append("userId", userId || 1);
      formData.append("name", personalInfo.fullName);
      formData.append("email", personalInfo.email);
      formData.append("phone", `${personalInfo.countryCode} ${personalInfo.phone}`);
      formData.append("skills", skillsInput);
      formData.append("education", educationText);
      formData.append("experience", experienceText);
      formData.append("projects", projectsText);
      formData.append("certifications", certificationsInput);
      formData.append("summary", summary);
      formData.append("achievements", achievementsInput);

      const resumeRes = await authApi.uploadResume(formData);
      const savedResume = resumeRes.data;

      if (!savedResume || !savedResume.id) {
        throw new Error("Failed to process application details.");
      }

      await authApi.applyToDrive({
        applicantId: Number(userId || 1),
        driveId: Number(driveId),
        resumeId: Number(savedResume.id)
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate(`/user/drives/${driveId}`);
      }, 2000);
    } catch (err) {
      console.error("Submit application error:", err);
      let msg = "Failed to submit application. Please check form details.";
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const driveTitle = drive ? drive.driveName : "Hiring Drive";
  const companyName = drive ? drive.companyName : "Organization";
  const createdDateStr = drive && drive.createdAt
    ? new Date(drive.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "24 May 2024";

  return (
    <div className="apply-drive-page">
      {/* REUSABLE USER NAVBAR */}
      <UserNavbar />

      <main className="apply-container">
        {/* BREADCRUMB */}
        <div className="apply-breadcrumb">
          Drives &gt; {companyName} &gt; <span>Apply</span>
        </div>

        {/* PAGE HEADER */}
        <div className="apply-header-row">
          <button className="back-circle-btn" onClick={() => navigate(`/user/drives/${driveId}`)}>
            <FaArrowLeft />
          </button>

          <div className="apply-header-title">
            <h1>Apply for {driveTitle}</h1>
            <div className="apply-header-meta">
              <strong>{companyName}</strong>
              <span style={{ background: "#DCFCE7", color: "#15803D", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800" }}>
                {(drive?.status || "OPEN").toUpperCase()}
              </span>
              <span>• Drive ID: JD-{driveId}</span>
              <span>• Posted on {createdDateStr}</span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div style={{ background: "#FEE2E2", color: "#B91C1C", border: "1px solid #FCA5A5", padding: "14px 20px", borderRadius: "14px", fontWeight: "600" }}>
            {errorMessage}
          </div>
        )}

        {submitSuccess && (
          <div style={{ background: "#DCFCE7", color: "#15803D", border: "1px solid #86EFAC", padding: "20px", borderRadius: "14px", textAlign: "center", fontWeight: "800" }}>
            <FaCheck style={{ fontSize: "24px", marginBottom: "8px" }} />
            <div>Application Submitted Successfully! Evaluated by ResumeIQ Match Engine.</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* SECTION 1: RESUME UPLOAD */}
          <div className="apply-section-card">
            <h2>1. Resume</h2>
            <div className="section-desc">
              Upload your latest resume. Supported formats: PDF, DOC, DOCX (Max size: 5MB)
            </div>

            <div className="apply-resume-dropzone" onClick={() => document.getElementById("resume-input-file").click()}>
              <FaCloudUploadAlt className="dropzone-upload-icon" />
              <div className="dropzone-prompt">
                <h4>Drag & drop your resume here</h4>
                <div style={{ fontSize: "12px", color: "#94A3B8", margin: "4px 0" }}>or</div>
                <span className="choose-file-pill-btn">Choose File</span>
              </div>

              <input
                type="file"
                id="resume-input-file"
                accept=".pdf,application/pdf"
                style={{ display: "none" }}
                onChange={(e) => setResumeFile(e.target.files[0])}
              />
            </div>

            {resumeFile && (
              <div className="selected-file-badge">
                <div className="file-info-left">
                  <FaFilePdf className="pdf-icon-red" />
                  <div>
                    <strong style={{ fontSize: "14px", color: "#0F172A" }}>{resumeFile.name}</strong>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>
                      {(resumeFile.size / 1024).toFixed(0)} KB
                    </div>
                  </div>
                </div>

                <button type="button" className="delete-file-btn" onClick={() => setResumeFile(null)}>
                  <FaTrashAlt />
                </button>
              </div>
            )}
          </div>

          {/* SECTION 2: PERSONAL INFORMATION */}
          <div className="apply-section-card">
            <h2>2. Personal Information</h2>
            <div className="section-desc">Enter your contact and profile details</div>

            <div className="form-input-grid-2col" style={{ marginBottom: "16px" }}>
              <div className="field-group">
                <label>Full Name <span>*</span></label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="Enter your full name"
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="field-group">
                <label>Email <span>*</span></label>
                <input
                  type="email"
                  className="field-input"
                  placeholder="Enter your email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-input-grid-2col" style={{ marginBottom: "16px" }}>
              <div className="field-group">
                <label>Phone Number <span>*</span></label>
                <div style={{ display: "flex", gap: "10px" }}>
                  <select
                    className="field-select"
                    style={{ width: "90px" }}
                    value={personalInfo.countryCode}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, countryCode: e.target.value })}
                  >
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                  </select>
                  <input
                    type="tel"
                    className="field-input"
                    placeholder="Enter your phone number"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label>LinkedIn Profile</label>
                <input
                  type="url"
                  className="field-input"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={personalInfo.linkedIn}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, linkedIn: e.target.value })}
                />
              </div>
            </div>

            <div className="form-input-grid-2col">
              <div className="field-group">
                <label>Portfolio / Website</label>
                <input
                  type="url"
                  className="field-input"
                  placeholder="https://yourportfolio.com"
                  value={personalInfo.portfolio}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, portfolio: e.target.value })}
                />
              </div>

              <div className="field-group">
                <label>Current Location <span>*</span></label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="Enter your current location"
                  value={personalInfo.currentLocation}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, currentLocation: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: PROFESSIONAL SUMMARY */}
          <div className="apply-section-card">
            <h2>3. Professional Summary</h2>
            <div className="section-desc">Write a brief summary about yourself</div>

            <div className="field-group">
              <textarea
                className="field-textarea"
                rows="4"
                maxLength="500"
                placeholder="Write 2-3 lines about your professional background, key skills and career goals..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              ></textarea>
              <div style={{ textAlign: "right", fontSize: "11px", color: "#94A3B8" }}>
                {summary.length} / 500
              </div>
            </div>
          </div>

          {/* SECTION 4: SKILLS */}
          <div className="apply-section-card">
            <h2>4. Skills</h2>
            <div className="section-desc">Add your key skills (comma separated)</div>

            <div className="field-group">
              <input
                type="text"
                className="field-input"
                placeholder="e.g. Java, Spring Boot, React, SQL, Docker"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
              />

              <div className="suggested-skills-row">
                <span className="suggested-label">Suggested:</span>
                {suggestedSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="skill-tag-pill"
                    onClick={() => handleAddSkillTag(skill)}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 5: EDUCATION */}
          <div className="apply-section-card">
            <div className="section-header-row">
              <div>
                <h2>5. Education</h2>
                <div className="section-desc" style={{ marginBottom: 0 }}>Add your highest degree first</div>
              </div>

              <button type="button" className="add-item-btn" onClick={handleAddEducation}>
                <FaPlus /> Add Education
              </button>
            </div>

            {educationList.map((edu, index) => (
              <div className="form-input-grid-2col" key={index} style={{ marginBottom: "16px" }}>
                <div className="field-group">
                  <label>Degree <span>*</span></label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="e.g. B.Tech in Computer Science"
                    value={edu.degree}
                    onChange={(e) => {
                      const updated = [...educationList];
                      updated[index].degree = e.target.value;
                      setEducationList(updated);
                    }}
                  />
                </div>

                <div className="field-group">
                  <label>Institute / University <span>*</span></label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="e.g. VIT-AP University"
                    value={edu.institute}
                    onChange={(e) => {
                      const updated = [...educationList];
                      updated[index].institute = e.target.value;
                      setEducationList(updated);
                    }}
                  />
                </div>

                <div className="field-group">
                  <label>Year of Passing <span>*</span></label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="e.g. 2024"
                    value={edu.passingYear}
                    onChange={(e) => {
                      const updated = [...educationList];
                      updated[index].passingYear = e.target.value;
                      setEducationList(updated);
                    }}
                  />
                </div>

                <div className="field-group">
                  <label>CGPA / Percentage <span>*</span></label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="e.g. 8.50 or 85%"
                    value={edu.cgpa}
                    onChange={(e) => {
                      const updated = [...educationList];
                      updated[index].cgpa = e.target.value;
                      setEducationList(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* SECTION 6: EXPERIENCE */}
          <div className="apply-section-card">
            <div className="section-header-row">
              <div>
                <h2>6. Experience</h2>
                <div className="section-desc" style={{ marginBottom: 0 }}>Add your work experience (if any)</div>
              </div>

              <button type="button" className="add-item-btn" onClick={handleAddExperience}>
                <FaPlus /> Add Experience
              </button>
            </div>

            {experienceList.map((exp, index) => (
              <div className="form-input-grid-3col" key={index} style={{ marginBottom: "16px" }}>
                <div className="field-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="e.g. Infosys"
                    value={exp.companyName}
                    onChange={(e) => {
                      const updated = [...experienceList];
                      updated[index].companyName = e.target.value;
                      setExperienceList(updated);
                    }}
                  />
                </div>

                <div className="field-group">
                  <label>Role / Position</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="e.g. Software Engineer"
                    value={exp.role}
                    onChange={(e) => {
                      const updated = [...experienceList];
                      updated[index].role = e.target.value;
                      setExperienceList(updated);
                    }}
                  />
                </div>

                <div className="field-group">
                  <label>Duration</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="date"
                      className="field-input"
                      value={exp.startDate}
                      onChange={(e) => {
                        const updated = [...experienceList];
                        updated[index].startDate = e.target.value;
                        setExperienceList(updated);
                      }}
                    />
                    <input
                      type="date"
                      className="field-input"
                      disabled={exp.currentlyWorking}
                      value={exp.endDate}
                      onChange={(e) => {
                        const updated = [...experienceList];
                        updated[index].endDate = e.target.value;
                        setExperienceList(updated);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* SECTION 7: PROJECTS */}
          <div className="apply-section-card">
            <div className="section-header-row">
              <div>
                <h2>7. Projects</h2>
                <div className="section-desc" style={{ marginBottom: 0 }}>Add your key projects (if any)</div>
              </div>

              <button type="button" className="add-item-btn" onClick={handleAddProject}>
                <FaPlus /> Add Project
              </button>
            </div>

            {projectsList.map((proj, index) => (
              <div className="form-input-grid-3col" key={index} style={{ marginBottom: "16px" }}>
                <div className="field-group">
                  <label>Project Title</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="e.g. E-Commerce Website"
                    value={proj.projectTitle}
                    onChange={(e) => {
                      const updated = [...projectsList];
                      updated[index].projectTitle = e.target.value;
                      setProjectsList(updated);
                    }}
                  />
                </div>

                <div className="field-group">
                  <label>Technologies Used</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="e.g. React, Spring Boot, MySQL"
                    value={proj.technologies}
                    onChange={(e) => {
                      const updated = [...projectsList];
                      updated[index].technologies = e.target.value;
                      setProjectsList(updated);
                    }}
                  />
                </div>

                <div className="field-group">
                  <label>Project Link (Optional)</label>
                  <input
                    type="url"
                    className="field-input"
                    placeholder="https://github.com/username/project"
                    value={proj.projectLink}
                    onChange={(e) => {
                      const updated = [...projectsList];
                      updated[index].projectLink = e.target.value;
                      setProjectsList(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* SECTION 8: CERTIFICATIONS */}
          <div className="apply-section-card">
            <h2>8. Certifications (Optional)</h2>
            <div className="section-desc">Add relevant certifications (if any)</div>

            <div className="field-group">
              <input
                type="text"
                className="field-input"
                placeholder="e.g. AWS Certified Developer, Oracle Java Certification"
                value={certificationsInput}
                onChange={(e) => setCertificationsInput(e.target.value)}
              />
            </div>
          </div>

          {/* SECTION 9: ACHIEVEMENTS */}
          <div className="apply-section-card">
            <h2>9. Achievements (Optional)</h2>
            <div className="section-desc">Add your achievements (if any)</div>

            <div className="field-group">
              <textarea
                className="field-textarea"
                rows="3"
                maxLength="500"
                placeholder="e.g. Secured 1st place in Hackathon, Dean's List, Published a Research Paper, etc."
                value={achievementsInput}
                onChange={(e) => setAchievementsInput(e.target.value)}
              ></textarea>
              <div style={{ textAlign: "right", fontSize: "11px", color: "#94A3B8" }}>
                {achievementsInput.length} / 500
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="apply-footer-row">
            <button
              type="button"
              className="cancel-form-btn"
              onClick={() => navigate(`/user/drives/${driveId}`)}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-application-btn"
              disabled={submitting}
            >
              {submitting ? (
                "Evaluating & Submitting..."
              ) : (
                <>
                  Submit Application <FaPaperPlane />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
