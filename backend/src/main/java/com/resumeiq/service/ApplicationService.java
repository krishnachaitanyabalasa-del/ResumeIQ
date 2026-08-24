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
    // CREATE APPLICATION + CALCULATE SCORE
    public Application createApplication(
            ApplicationRequest request
    ) throws Exception {

        // ==========================================
        // 1. FIND APPLICANT
        // ==========================================

        User applicant = userRepository
                .findById(request.getApplicantId())
                .orElseThrow(() ->
                        new RuntimeException("Applicant not found")
                );


        // ==========================================
        // 2. FIND DRIVE
        // ==========================================

        Drive drive = driveRepository
                .findById(request.getDriveId())
                .orElseThrow(() ->
                        new RuntimeException("Drive not found")
                );


        // ==========================================
        // 3. FIND RESUME
        // ==========================================

        Resume resume = resumeRepository
                .findById(request.getResumeId())
                .orElseThrow(() ->
                        new RuntimeException("Resume not found")
                );


        // ==========================================
        // 4. VERIFY RESUME BELONGS TO USER
        // ==========================================

        if (resume.getUser() == null ||
                !resume.getUser().getId()
                        .equals(applicant.getId())) {

            throw new RuntimeException(
                    "This resume does not belong to the applicant"
            );
        }


        // ==========================================
        // 5. CHECK IF USER ALREADY APPLIED
        // ==========================================

        List<Application> existingApplications =
                applicationRepository.findByApplicantId(
                        applicant.getId()
                );

        boolean alreadyApplied =
                existingApplications.stream()
                        .anyMatch(application ->
                                application.getDrive()
                                        .getId()
                                        .equals(drive.getId())
                        );

        if (alreadyApplied) {

            throw new RuntimeException(
                    "You have already applied to this drive"
            );
        }


        // ==========================================
        // 6. BUILD RESUME DATA
        // ==========================================

        String resumeData = buildResumeData(resume);


        // ==========================================
        // 7. CALL GEMINI FOR SCORING
        // ==========================================

        String aiResponse =
                googleApiService.calculateResumeScore(

                        resumeData,

                        drive.getJdText(),

                        drive.getRequiredSkills(),

                        drive.getRequiredExperience(),

                        drive.getRequiredEducation(),

                        drive.getRequiredResponsibilities(),

                        drive.getRequiredQualifications()
                );


        // ==========================================
        // 8. CONVERT AI JSON TO ScoreResponse
        // ==========================================

        ScoreResponse scoreResponse =
                objectMapper.readValue(
                        aiResponse,
                        ScoreResponse.class
                );


        // ==========================================
        // 9. CREATE APPLICATION
        // ==========================================

        Application application = Application.builder()

                .applicant(applicant)

                .drive(drive)

                .resume(resume)

                .status("SCREENED")

                // Overall score
                .score(scoreResponse.getScore())

                // Individual scores
                .skillsScore(
                        scoreResponse.getSkillsScore()
                )

                .experienceScore(
                        scoreResponse.getExperienceScore()
                )

                .educationScore(
                        scoreResponse.getEducationScore()
                )

                .projectScore(
                        scoreResponse.getProjectScore()
                )

                .relevanceScore(
                        scoreResponse.getRelevanceScore()
                )

                .build();


        // ==========================================
        // 10. MATCHED SKILLS
        // ==========================================

        if (scoreResponse.getMatchedSkills() != null) {

            application.setMatchedSkills(
                    String.join(
                            ", ",
                            scoreResponse.getMatchedSkills()
                    )
            );
        }


        // ==========================================
        // 11. MISSING SKILLS
        // ==========================================

        if (scoreResponse.getMissingSkills() != null) {

            application.setMissingSkills(
                    String.join(
                            ", ",
                            scoreResponse.getMissingSkills()
                    )
            );
        }


        // ==========================================
        // 12. STRENGTHS
        // ==========================================

        if (scoreResponse.getStrengths() != null) {

            application.setStrengths(
                    String.join(
                            ", ",
                            scoreResponse.getStrengths()
                    )
            );
        }


        // ==========================================
        // 13. WEAKNESSES
        // ==========================================

        if (scoreResponse.getWeaknesses() != null) {

            application.setWeaknesses(
                    String.join(
                            ", ",
                            scoreResponse.getWeaknesses()
                    )
            );
        }


        // ==========================================
        // 14. AI FEEDBACK
        // ==========================================

        application.setAiFeedback(
                scoreResponse.getFeedback()
        );


        // ==========================================
        // 15. SAVE APPLICATION
        // ==========================================

        return applicationRepository.save(application);
    }


    // =====================================================
    // BUILD RESUME DATA
    // =====================================================
    // =====================================================


    private String buildResumeData(Resume resume) {

        return """
                CANDIDATE NAME:
                %s

                EMAIL:
                %s

                PHONE:
                %s

                SKILLS:
                %s

                EDUCATION:
                %s

                EXPERIENCE:
                %s

                PROJECTS:
                %s

                CERTIFICATIONS:
                %s

                ACHIEVEMENTS:
                %s

                SUMMARY:
                %s

                ORIGINAL PARSED RESUME TEXT:
                %s
                """.formatted(

                safe(resume.getName()),

                safe(resume.getEmail()),

                safe(resume.getPhone()),

                safe(resume.getSkills()),

                safe(resume.getEducation()),

                safe(resume.getExperience()),

                safe(resume.getProjects()),

                safe(resume.getCertifications()),

                safe(resume.getAchievements()),

                safe(resume.getSummary()),

                safe(resume.getParsedText())
        );
    }


    // =====================================================
    // GET ALL APPLICATIONS
    // =====================================================

    public List<Application> getAllApplications() {

        return applicationRepository.findAll();
    }


    // =====================================================
    // GET APPLICATIONS BY USER
    // =====================================================

    public List<Application> getApplicationsByUser(
            Long userId
    ) {

        return applicationRepository
                .findByApplicantId(userId);
    }


    // =====================================================
    // GET APPLICATIONS BY DRIVE - RANKED
    // =====================================================

    public List<Application> getApplicationsByDrive(
            Long driveId
    ) {

        return applicationRepository
                .findByDriveIdOrderByScoreDesc(driveId);
    }


    // =====================================================
    // NULL HANDLER
    // =====================================================

    private String safe(String value) {

        if (value == null || value.isBlank()) {
            return "Not provided";
        }

        return value;
    }
}