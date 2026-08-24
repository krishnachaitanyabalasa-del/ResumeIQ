package com.resumeiq.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeiq.dto.ApplicationRequest;
import com.resumeiq.dto.ScoreResponse;
import com.resumeiq.entity.Application;
import com.resumeiq.entity.Drive;
import com.resumeiq.entity.Resume;
import com.resumeiq.entity.User;
import com.resumeiq.repository.ApplicationRepository;
import com.resumeiq.repository.DriveRepository;
import com.resumeiq.repository.ResumeRepository;
import com.resumeiq.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final DriveRepository driveRepository;
    private final ResumeRepository resumeRepository;
    private final GoogleApiService googleApiService;
    private final ObjectMapper objectMapper;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            UserRepository userRepository,
            DriveRepository driveRepository,
            ResumeRepository resumeRepository,
            GoogleApiService googleApiService,
            ObjectMapper objectMapper
    ) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.driveRepository = driveRepository;
        this.resumeRepository = resumeRepository;
        this.googleApiService = googleApiService;
        this.objectMapper = objectMapper;
    }

    // =====================================================
    // CREATE APPLICATION + CALCULATE SCORE WITH AI FALLBACK
    // =====================================================

    public Application createApplication(
            ApplicationRequest request
    ) throws Exception {

        // 1. FIND APPLICANT
        User applicant = userRepository
                .findById(request.getApplicantId())
                .orElseThrow(() ->
                        new RuntimeException("Applicant not found")
                );

        // 2. FIND DRIVE
        Drive drive = driveRepository
                .findById(request.getDriveId())
                .orElseThrow(() ->
                        new RuntimeException("Drive not found")
                );

        // 3. FIND RESUME
        Resume resume = resumeRepository
                .findById(request.getResumeId())
                .orElseThrow(() ->
                        new RuntimeException("Resume not found")
                );

        // 4. VERIFY RESUME BELONGS TO USER
        if (resume.getUser() == null ||
                !resume.getUser().getId().equals(applicant.getId())) {
            throw new RuntimeException("This resume does not belong to the applicant");
        }

        // 5. CHECK IF USER ALREADY APPLIED
        List<Application> existingApplications =
                applicationRepository.findByApplicantId(applicant.getId());

        boolean alreadyApplied = existingApplications.stream()
                .anyMatch(app -> app.getDrive().getId().equals(drive.getId()));

        if (alreadyApplied) {
            throw new RuntimeException("You have already applied to this drive");
        }

        // 6. BUILD RESUME DATA
        String resumeData = buildResumeData(resume);

        // 7. CALL GEMINI AI FOR SCORING WITH FALLBACK
        ScoreResponse scoreResponse = null;

        try {
            String aiResponse = googleApiService.calculateResumeScore(
                    resumeData,
                    drive.getJdText(),
                    drive.getRequiredSkills(),
                    drive.getRequiredExperience(),
                    drive.getRequiredEducation(),
                    drive.getRequiredResponsibilities(),
                    drive.getRequiredQualifications()
            );

            if (aiResponse != null && !aiResponse.isBlank()) {
                scoreResponse = objectMapper.readValue(aiResponse, ScoreResponse.class);
            }
        } catch (Exception e) {
            System.out.println("Notice: Gemini API scoring skipped or quota exceeded: " + e.getMessage() + ". Executing ResumeIQ Match Engine fallback.");
        }

        if (scoreResponse == null || scoreResponse.getScore() == null) {
            scoreResponse = calculateDeterministicScore(resume, drive);
        }

        // 8. CREATE APPLICATION
        Application application = Application.builder()
                .applicant(applicant)
                .drive(drive)
                .resume(resume)
                .status("EVALUATED")
                .score(scoreResponse.getScore())
                .skillsScore(scoreResponse.getSkillsScore())
                .experienceScore(scoreResponse.getExperienceScore())
                .educationScore(scoreResponse.getEducationScore())
                .projectScore(scoreResponse.getProjectScore())
                .relevanceScore(scoreResponse.getRelevanceScore())
                .matchedSkills(scoreResponse.getMatchedSkills())
                .missingSkills(scoreResponse.getMissingSkills())
                .strengths(scoreResponse.getStrengths())
                .weaknesses(scoreResponse.getWeaknesses())
                .aiFeedback(scoreResponse.getAiFeedback())
                .build();

        return applicationRepository.save(application);
    }

    // =====================================================
    // DETERMINISTIC SCORE FALLBACK ENGINE
    // =====================================================

    private ScoreResponse calculateDeterministicScore(Resume resume, Drive drive) {
        String reqSkillsStr = drive.getRequiredSkills() != null ? drive.getRequiredSkills().toLowerCase() : "";
        String candidateSkillsStr = resume.getSkills() != null ? resume.getSkills().toLowerCase() : "";
        String candidateParsed = resume.getParsedText() != null ? resume.getParsedText().toLowerCase() : "";

        String[] reqSkills = reqSkillsStr.split("[,;]+");
        int matchedCount = 0;
        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String skill : reqSkills) {
            String trimmed = skill.trim();
            if (trimmed.isEmpty()) continue;
            if (candidateSkillsStr.contains(trimmed) || candidateParsed.contains(trimmed)) {
                matchedCount++;
                matched.add(trimmed);
            } else {
                missing.add(trimmed);
            }
        }

        int totalReq = Math.max(1, reqSkills.length);
        double skillsScore = Math.min(100.0, Math.max(50.0, ((double) matchedCount / totalReq) * 100.0));
        double experienceScore = resume.getExperience() != null && !resume.getExperience().isBlank() ? 85.0 : 70.0;
        double educationScore = resume.getEducation() != null && !resume.getEducation().isBlank() ? 90.0 : 75.0;
        double projectScore = resume.getProjects() != null && !resume.getProjects().isBlank() ? 85.0 : 70.0;
        double relevanceScore = 82.0;

        double totalScore = (skillsScore * 0.45) + (experienceScore * 0.25) + (educationScore * 0.20) + (projectScore * 0.10);
        totalScore = Math.round(totalScore * 10.0) / 10.0;

        ScoreResponse res = new ScoreResponse();
        res.setScore(totalScore);
        res.setSkillsScore(skillsScore);
        res.setExperienceScore(experienceScore);
        res.setEducationScore(educationScore);
        res.setProjectScore(projectScore);
        res.setRelevanceScore(relevanceScore);
        res.setMatchedSkills(matched.isEmpty() ? drive.getRequiredSkills() : String.join(", ", matched));
        res.setMissingSkills(String.join(", ", missing));
        res.setStrengths("Strong alignment with core job requirements and skills.");
        res.setWeaknesses(missing.isEmpty() ? "No critical skill gaps identified." : "Additional experience recommended in: " + String.join(", ", missing));
        res.setAiFeedback("Evaluated via ResumeIQ Match Engine.");

        return res;
    }

    // =====================================================
    // BUILD RESUME TEXT FOR AI
    // =====================================================

    private String buildResumeData(Resume resume) {
        StringBuilder sb = new StringBuilder();
        if (resume.getName() != null) sb.append("Name: ").append(resume.getName()).append("\n");
        if (resume.getSkills() != null) sb.append("Skills: ").append(resume.getSkills()).append("\n");
        if (resume.getEducation() != null) sb.append("Education: ").append(resume.getEducation()).append("\n");
        if (resume.getExperience() != null) sb.append("Experience: ").append(resume.getExperience()).append("\n");
        if (resume.getSummary() != null) sb.append("Summary: ").append(resume.getSummary()).append("\n");
        if (resume.getParsedText() != null) sb.append("\nParsed Text:\n").append(resume.getParsedText());
        return sb.toString();
    }

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public List<Application> getApplicationsByApplicantId(Long applicantId) {
        return applicationRepository.findByApplicantId(applicantId);
    }

    public List<Application> getApplicationsByDriveId(Long driveId) {
        return applicationRepository.findByDriveId(driveId);
    }
}