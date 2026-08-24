package com.resumeiq.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeiq.entity.Resume;
import com.resumeiq.entity.User;
import com.resumeiq.repository.ResumeRepository;
import com.resumeiq.repository.UserRepository;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final GoogleApiService googleApiService;
    private final ObjectMapper objectMapper;

    @Value("${file.upload-dir:uploads/resumes}")
    private String uploadDir;

    public ResumeService(
            ResumeRepository resumeRepository,
            UserRepository userRepository,
            GoogleApiService googleApiService,
            ObjectMapper objectMapper
    ) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.googleApiService = googleApiService;
        this.objectMapper = objectMapper;
    }

    // =========================================================
    // UPLOAD RESUME WITH FULL CANDIDATE FORM DATA & AI FALLBACK
    // =========================================================

    public Resume uploadResumeWithDetails(
            MultipartFile file,
            Long userId,
            String name,
            String email,
            String phone,
            String formSkills,
            String formEducation,
            String formExperience,
            String formProjects,
            String formCertifications,
            String formSummary,
            String formAchievements
    ) throws Exception {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found with id: " + userId)
                );

        if (phone != null && !phone.isBlank()) {
            user.setPhone(phone);
            userRepository.save(user);
        }

        String originalFileName = "Candidate_Resume.pdf";
        String fileUrlPath = "";
        String parsedText = "";

        if (file != null && !file.isEmpty()) {
            originalFileName = file.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String savedFileName = UUID.randomUUID() + "_" + originalFileName;
            Path filePath = uploadPath.resolve(savedFileName);
            Files.copy(file.getInputStream(), filePath);

            fileUrlPath = "/uploads/resumes/" + savedFileName;

            try {
                parsedText = extractTextFromPdf(file);
            } catch (Exception e) {
                System.out.println("Notice: Could not extract PDF text. Using candidate form text.");
            }
        }

        // Build combined text representation for AI matching
        StringBuilder combinedText = new StringBuilder();
        if (parsedText != null && !parsedText.isBlank()) {
            combinedText.append(parsedText).append("\n");
        }
        if (name != null) combinedText.append("Name: ").append(name).append("\n");
        if (email != null) combinedText.append("Email: ").append(email).append("\n");
        if (phone != null) combinedText.append("Phone: ").append(phone).append("\n");
        if (formSkills != null) combinedText.append("Skills: ").append(formSkills).append("\n");
        if (formEducation != null) combinedText.append("Education: ").append(formEducation).append("\n");
        if (formExperience != null) combinedText.append("Experience: ").append(formExperience).append("\n");
        if (formSummary != null) combinedText.append("Summary: ").append(formSummary).append("\n");

        String finalParsedText = combinedText.toString();

        String aiSkills = formSkills;
        String aiEducation = formEducation;
        String aiExperience = formExperience;

        // Try AI Extraction with fallback if quota fails or API times out
        try {
            if (finalParsedText != null && !finalParsedText.isBlank()) {
                String aiResponse = googleApiService.extractResumeData(finalParsedText);
                if (aiResponse != null && !aiResponse.isBlank()) {
                    JsonNode json = objectMapper.readTree(aiResponse);
                    String extSkills = json.path("skills").asText("");
                    String extEducation = json.path("education").asText("");
                    String extExperience = json.path("experience").asText("");

                    if (!extSkills.isBlank()) aiSkills = extSkills + (formSkills != null ? ", " + formSkills : "");
                    if (!extEducation.isBlank()) aiEducation = extEducation;
                    if (!extExperience.isBlank()) aiExperience = extExperience;
                }
            }
        } catch (Exception e) {
            System.out.println("Notice: Gemini API parsing skipped or quota exceeded. Using candidate form inputs.");
        }

        Resume resume = Resume.builder()
                .user(user)
                .fileName(originalFileName)
                .fileUrl(fileUrlPath)
                .parsedText(finalParsedText)
                .name(name != null && !name.isBlank() ? name : user.getName())
                .email(email != null && !email.isBlank() ? email : user.getEmail())
                .phone(phone)
                .skills(aiSkills)
                .education(aiEducation)
                .experience(aiExperience)
                .projects(formProjects)
                .certifications(formCertifications)
                .summary(formSummary)
                .achievements(formAchievements)
                .build();

        return resumeRepository.save(resume);
    }

    public Resume uploadResume(MultipartFile file, Long userId) throws Exception {
        return uploadResumeWithDetails(file, userId, null, null, null, null, null, null, null, null, null, null);
    }

    // =========================================================
    // PDF -> TEXT
    // =========================================================

    private String extractTextFromPdf(MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getInputStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    public Optional<Resume> getResumeById(Long id) {
        return resumeRepository.findById(id);
    }

    public List<Resume> getResumesByUserId(Long userId) {
        return resumeRepository.findByUserId(userId);
    }
}