# ResumeIQ - Smart Resume Screener & Candidate Matching

ResumeIQ is an AI-powered resume screening and candidate matching platform that helps recruiters create hiring drives, collect applications, parse resumes, and evaluate candidates against job descriptions.

The core objective of the project is to parse resumes, extract structured candidate information, and intelligently match candidates with job descriptions using an LLM.

---

## Live Deployments & Repository Links

- Live Web Application: https://resumeiq-hazel.vercel.app/
- GitHub Repository: https://github.com/krishnachaitanyabalasa-del/ResumeIQ.git
- Demo Video (2–3 min): [Insert Demo Video Link Here]

---

## 1. Project Objective

ResumeIQ provides two main experiences:

### Applicant
An applicant can:
- Register and log in.
- View available hiring drives.
- Open a drive and view its complete job description.
- Apply to an open drive.
- Upload a resume (PDF/DOC/DOCX).
- Review extracted resume information.
- Submit an application.
- View submitted applications and their status.

### Recruiter / Admin
An admin can:
- Register and log in.
- Create hiring drives.
- Upload or enter a job description.
- Automatically extract JD requirements.
- View drives created by the logged-in admin.
- View drive statistics.
- View all applicants for a drive.
- Screen applicants using AI.
- View candidate match scores and sub-scores.
- View screening justifications (strengths, weaknesses, matched & missing skills).
- Update drive status.
- Manage candidates and applications.

---

## 2. Core Requirements

The project is built around the following core requirements:
- Resume input through PDF/text.
- Job description input through text/PDF.
- Structured extraction of:
  - Skills
  - Experience
  - Education
  - Projects, Certifications, and Achievements
- LLM-based semantic matching and scoring.
- Candidate match score generation.
- Candidate screening justification.
- Recruiter dashboard.
- Applicant dashboard.
- Database storage for parsed resumes and applications.
- Clean backend layered architecture.
- Complete README documentation containing architecture and LLM prompts.

---

## 3. Technology Stack

### Backend
- Java 21
- Spring Boot 3.3.2
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- MySQL 8.4 / PostgreSQL
- Apache PDFBox
- Google Gemini API (Gemini 3.7 Flash)

### Frontend
- React 18
- JavaScript / ES6
- Vite
- HTML5 & CSS3
- Axios
- FontAwesome / React Icons

### AI & LLM Engine
- Google Gemini 3.7 Flash
- Structured JD parsing
- Resume text extraction & parsing
- Semantic candidate-to-JD matching
- Match score calculation (0–100)
- Screening justification generation

### Development & Deployment Tools
- Git & GitHub
- Maven
- Render (Backend Web Service)
- Vercel (Frontend Single Page Application)

---

## 4. High-Level Architecture

```text
                         ┌──────────────────────┐
                         │      ResumeIQ        │
                         │     React Frontend   │
                         └──────────┬───────────┘
                                    │
                              HTTP / REST API
                                    │
                                    ▼
                    ┌─────────────────────────────┐
                    │      Spring Boot API        │
                    │                             │
                    │  Controllers                │
                    │      ↓                      │
                    │  Services                   │
                    │      ↓                      │
                    │  Repositories               │
                    └──────────────┬──────────────┘
                                   │
              ┌────────────────────┼───────────────────┐
              │                    │                   │
              ▼                    ▼                   ▼
       ┌─────────────┐      ┌──────────────┐   ┌──────────────┐
       │ MySQL /     │      │ PDFBox       │   │ Gemini API   │
       │ Database    │      │ PDF Parsing  │   │ LLM          │
       └─────────────┘      └──────────────┘   └──────────────┘
```

---

## 5. Backend Architecture

The backend follows a clean layered Spring Boot architecture:

```text
com.resumeiq
│
├── controller
│   ├── AuthController
│   ├── UserController
│   ├── AdminController
│   ├── DriveController
│   ├── ResumeController
│   └── ApplicationController
│
├── service
│   ├── AuthService
│   ├── UserService
│   ├── DriveService
│   ├── ResumeService
│   ├── ApplicationService
│   └── GoogleApiService
│
├── repository
│   ├── UserRepository
│   ├── ResumeRepository
│   ├── DriveRepository
│   └── ApplicationRepository
│
├── entity
│   ├── User
│   ├── Resume
│   ├── Drive
│   └── Application
│
├── dto
│   ├── LoginRequest
│   ├── AuthResponse
│   └── ApplicationDTO
│
├── security
│   ├── JwtUtils
│   ├── UserDetailsService
│   └── SecurityConfig
│
└── config
    ├── WebConfig
    └── CorsConfig
```

---

## 6. Layer Responsibilities

### Controller
Controllers expose REST APIs:
- `POST /api/auth/login`
- `POST /api/drives`
- `GET /api/drives/my-drives`
- `GET /api/drives/my-drives/stats`
- `GET /api/drives/{id}`
- `GET /api/applications/drive/{driveId}`
- `POST /api/applications`

Controllers validate request input, retrieve authenticated user/admin information from SecurityContext, call services, and return standard HTTP responses.

### Service
Services contain business logic:
- `DriveService`: Creates hiring drives, parses JD text, and persists drive criteria.
- `ApplicationService`: Loads candidate resumes and drive requirements, calculates deterministic sub-scores, calls Google Gemini API for semantic evaluation, and persists application match results.
- `GoogleApiService`: Handles communication with Google Gemini LLM, featuring multi-API key rotation and automatic failover.

### Repository
Repositories communicate with the database via Spring Data JPA:
- `findByCreatedByEmail(String email)`
- `countByCreatedByEmail(String email)`
- `findByDriveId(Long driveId)`

---

## 7. Authentication & Authorization

ResumeIQ enforces role-based access control using Spring Security + JWT:
- `ROLE_USER` (Applicant)
- `ROLE_ADMIN` (Recruiter / HR Admin)

### Drive Ownership Enforcment
The backend determines the logged-in admin directly from the validated JWT token rather than trusting frontend input:

```java
String adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
drive.setCreatedByEmail(adminEmail);
```

This ensures recruiters can only manage and view statistics for hiring drives they created.

---

## 8. Database Model

### User
Stores applicant and admin credentials:
- `id` (Primary Key)
- `name`
- `email` (Unique)
- `password` (Hashed)
- `phone`
- `role` (`ROLE_USER` or `ROLE_ADMIN`)

### Resume
Stores parsed resume details:
- `id` (Primary Key)
- `user_id` (Foreign Key -> User)
- `fileName`
- `fileUrl`
- `parsedText`
- `name`
- `email`
- `phone`
- `skills`
- `education`
- `experience`
- `projects`
- `certifications`
- `summary`
- `achievements`
- `uploadedAt`

### Drive
Stores hiring drive criteria and requirements:
- `id` (Primary Key)
- `companyName`
- `companyLogo`
- `driveName`
- `role`
- `location`
- `experience`
- `lastDate`
- `employmentType`
- `description`
- `jdText`
- `jdFileUrl`
- `requiredSkills`
- `requiredExperience`
- `requiredEducation`
- `requiredResponsibilities`
- `requiredQualifications`
- `status` (`OPEN`, `UPCOMING`, `CLOSED`, `COMPLETED`)
- `createdByEmail`
- `createdAt`

### Application
Stores candidate application and LLM evaluation output:
- `id` (Primary Key)
- `applicant_id` (Foreign Key -> User)
- `drive_id` (Foreign Key -> Drive)
- `resume_id` (Foreign Key -> Resume)
- `score` (Overall 0–100)
- `skillsScore` (0–40)
- `experienceScore` (0–20)
- `educationScore` (0–10)
- `projectScore` (0–20)
- `relevanceScore` (0–10)
- `matchedSkills`
- `missingSkills`
- `strengths`
- `weaknesses`
- `aiFeedback`
- `status` (`APPLIED`, `SHORTLISTED`, `REVIEW`, `REJECTED`)
- `appliedAt`

---

## 9. Resume Application Flow

```text
Applicant clicks "Apply Now"
             │
             ▼
      Application Form
             │
             ▼
       Upload Resume (PDF)
             │
             ▼
       Validate File Size & Type
             │
             ▼
       Extract PDF Text (Apache PDFBox)
             │
             ▼
      Parse Structured Data (Gemini LLM)
             │
             ├── Name, Email, Phone
             ├── Skills, Education
             ├── Experience, Projects
             └── Summary, Achievements
             │
             ▼
      Submit Application
             │
             ▼
       Calculate ATS Score & Justification
             │
             ▼
       Link Candidate + Resume + Drive Application
```

---

## 10. LLM Usage & Prompts

The LLM is utilized for semantic data extraction and ATS candidate-to-JD matching.

### 1. Resume Data Extraction Prompt (`extractResumeData`)

```text
You are an expert resume parser.

Extract information ONLY from the resume text provided below.

Return ONLY a valid JSON object without markdown or code fences:

{
  "name": "",
  "email": "",
  "phone": "",
  "skills": "",
  "education": "",
  "experience": "",
  "projects": "",
  "certifications": "",
  "achievements": "",
  "summary": ""
}

EXTRACTION RULES:
1. name: Extract candidate's full name from the top header.
2. email: Extract valid email address.
3. phone: Extract phone number with country code.
4. skills: Extract technical and soft skills.
5. education: Extract degrees, institutes, passing years, CGPAs.
6. experience: Extract designations, companies, dates, responsibilities.
7. projects: Extract project titles, tech stack, and links.
8. certifications: Extract professional certifications.
9. achievements: Extract honors, hackathons, and awards.
10. summary: Extract the complete professional profile summary.

Resume text:
[RAW_RESUME_TEXT]
```

### 2. Resume-to-JD Matching Prompt (`calculateResumeScore`)

```text
You are an expert Applicant Tracking System (ATS) and professional technical recruiter.

Evaluate the candidate's resume against the hiring drive requirements.

SCORING SYSTEM (Total: 100 points):
- Skills Match       = 40 points
- Experience Match   = 20 points
- Education Match    = 10 points
- Projects Match     = 20 points
- Overall Relevance  = 10 points

REQUIRED OUTPUT FORMAT (JSON ONLY):
{
  "score": 85,
  "skillsScore": 36,
  "experienceScore": 18,
  "educationScore": 9,
  "projectScore": 17,
  "matchedSkills": ["Java", "Spring Boot", "React", "SQL"],
  "missingSkills": ["Docker", "Kubernetes"],
  "strengths": ["Strong backend development experience", "Relevant degree in CS"],
  "weaknesses": ["Limited cloud deployment exposure"],
  "feedback": "Candidate demonstrates excellent Java & Spring Boot experience with strong project alignment."
}

JOB DESCRIPTION:
[JD_TEXT]

REQUIRED SKILLS:
[REQUIRED_SKILLS]

CANDIDATE RESUME DATA:
[CANDIDATE_DATA]
```

---

## 11. Candidate Screening Flow & Status Logic

When an application is evaluated:
1. Candidate resume details and Drive requirements are fetched from the database.
2. The payload is evaluated through Google Gemini LLM (`calculateResumeScore`).
3. If an API key quota limit occurs (`429 Resource Exhausted`), the system rotates to key #2 or key #3 automatically. If all keys fail, the backend fallback matching engine generates an accurate score.
4. Candidates are assigned threshold status levels:
   - 80 – 100 : `SHORTLISTED`
   - 60 – 79  : `REVIEW`
   - 0 – 59   : `REJECTED`

---

## 12. Recommended REST API Structure

### Authentication
- `POST /api/auth/register` - Register applicant account
- `POST /api/auth/login` - Authenticate applicant
- `POST /api/admin` - Register admin account
- `POST /api/admin/login` - Authenticate admin

### Drives
- `POST /api/drives` - Create hiring drive
- `GET /api/drives` - List all drives
- `GET /api/drives/open` - List open drives
- `GET /api/drives/my-drives` - List admin drives
- `GET /api/drives/my-drives/stats` - Admin drive metrics
- `GET /api/drives/{id}` - Get drive details
- `PUT /api/drives/{id}` - Update drive status

### Applications & Screening
- `POST /api/applications` - Submit candidate application
- `GET /api/applications/drive/{driveId}` - List applicants for drive
- `GET /api/applications/user/{userId}` - List candidate's applications
- `GET /api/applications` - List all applications

### Resume
- `POST /api/resumes/upload` - Upload and parse PDF resume

---

## 13. Environment Variables Setup

Configure the following environment variables for deployment or local execution:

```env
# Database Credentials
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/ResumeIQ?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_database_password

# Gemini LLM API Keys (Supports multi-key failover rotation)
GOOGLE_API_KEYS=AIzaSyFirstKey,AIzaSySecondKey,AIzaSyThirdKey

# Server Port
SERVER_PORT=8080
```

---

## 14. Project Directory Structure

```text
ResumeIQ/
├── backend/                        # Spring Boot Java 21 Backend
│   ├── src/main/java/com/resumeiq/
│   │   ├── config/                 # SecurityConfig, WebConfig
│   │   ├── controller/             # AuthController, DriveController, ApplicationController
│   │   ├── entity/                 # User, Drive, Application, Resume
│   │   ├── repository/             # JPA Repositories
│   │   ├── security/               # JwtUtils, UserDetailsService
│   │   └── service/                # GoogleApiService, ApplicationService, ResumeService
│   ├── src/main/resources/
│   │   └── application.properties  # Spring Configuration
│   └── pom.xml                     # Maven Dependencies
│
├── frontend/                       # React 18 + Vite Frontend
│   ├── src/
│   │   ├── Admin/                  # AdminHome, DriveDetails, CreateDrive
│   │   ├── User/                   # UserHomePage, UserDriveDetails, ApplyDrive
│   │   ├── components/             # UserNavbar, AdminNavbar
│   │   ├── api/                    # axiosInstance, apiService
│   │   ├── App.jsx                 # Routes
│   │   └── index.jsx
│   ├── public/                     # Favicon & Assets
│   └── package.json
│
├── render.yaml                     # Render Deployment Blueprint
└── README.md                       # Documentation
```

---

## 15. Development & Security Rules

1. **Keep Controllers Thin**: Business logic and database operations are encapsulated inside Service classes.
2. **AI & LLM Isolation**: Gemini API communication and key rotation are managed inside `GoogleApiService.java`.
3. **Never Trust Frontend Role Information**: Security Context & JWT determine admin ownership (`createdByEmail`) and candidate identities.
4. **Resilient Data Fallbacks**: Uploaded resumes are backed up on disk (`fileUrl`), and evaluation fallback logic ensures candidate submission success even under network/quota limits.

---

## 16. Future Improvements

- Vector embeddings and semantic search for instant candidate pool queries.
- Automated email notifications to candidates on shortlist/status updates.
- Duplicate resume detection across multiple drives.
- Interactive skill-gap analysis report for applicants.
- Batch resume screening background jobs for large candidate pools.

---

## 17. Author & Acknowledgements

Developed by **Krishna Chaitanya Balasa** for the **Smart Resume Screener** evaluation.  
Powered by **Spring Boot**, **React**, **Google Gemini AI**, **Aiven Cloud MySQL**, **Render**, and **Vercel**.
