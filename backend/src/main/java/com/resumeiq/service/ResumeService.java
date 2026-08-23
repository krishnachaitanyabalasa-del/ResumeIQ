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
    private final OpenAIService openAIService;
    private final ObjectMapper objectMapper;

    @Value("${file.upload-dir:uploads/resumes}")
    private String uploadDir;

    public ResumeService(
            ResumeRepository resumeRepository,
            UserRepository userRepository,
            OpenAIService openAIService,
            ObjectMapper objectMapper
    ) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.openAIService = openAIService;
        this.objectMapper = objectMapper;
    }

    // =========================================================
    // UPLOAD RESUME
    // PDF -> TEXT -> OPENAI -> SKILLS/EDUCATION/EXPERIENCE
    // -> DATABASE
    // =========================================================

    public Resume uploadResume(
            MultipartFile file,
            Long userId
    ) throws Exception {

        // -----------------------------------------------------
        // 1. Validate file
        // -----------------------------------------------------

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Resume file is empty");
        }

        String originalFileName = file.getOriginalFilename();

        if (originalFileName == null ||
                !originalFileName.toLowerCase().endsWith(".pdf")) {

            throw new RuntimeException(
                    "Only PDF resumes are supported"
            );
        }

        // -----------------------------------------------------
        // 2. Find user
        // -----------------------------------------------------

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with id: " + userId
                        )
                );

        // -----------------------------------------------------
        // 3. Save PDF file
        // -----------------------------------------------------

        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName =
                UUID.randomUUID() + "_" + originalFileName;

        Path filePath =
                uploadPath.resolve(fileName);

        Files.copy(
                file.getInputStream(),
                filePath
        );

        // -----------------------------------------------------
        // 4. Extract text from PDF using PDFBox
        // -----------------------------------------------------

        String parsedText =
                extractTextFromPdf(file);

        if (parsedText == null ||
                parsedText.trim().isEmpty()) {

            throw new RuntimeException(
                    "Could not extract text from resume"
            );
        }

        // -----------------------------------------------------
        // 5. Send extracted text to OpenAI
        // -----------------------------------------------------

        String aiResponse =
                openAIService.extractResumeData(parsedText);

        // -----------------------------------------------------
        // 6. Convert OpenAI JSON response
        //    into skills, education, experience
        // -----------------------------------------------------

        JsonNode json =
                objectMapper.readTree(aiResponse);

        String skills =
                json.path("skills").asText("");

        String education =
                json.path("education").asText("");

        String experience =
                json.path("experience").asText("");

        // -----------------------------------------------------
        // 7. Create Resume entity
        // -----------------------------------------------------

        Resume resume = Resume.builder()
                .user(user)
                .fileName(originalFileName)
                .fileUrl("/uploads/resumes/" + fileName)
                .parsedText(parsedText)
                .skills(skills)
                .education(education)
                .experience(experience)
                .build();

        // -----------------------------------------------------
        // 8. Save to MySQL
        // -----------------------------------------------------

        return resumeRepository.save(resume);
    }

    // =========================================================
    // PDF -> TEXT
    // =========================================================

    private String extractTextFromPdf(
            MultipartFile file
    ) throws IOException {

        try (PDDocument document =
                     PDDocument.load(file.getInputStream())) {

            PDFTextStripper stripper =
                    new PDFTextStripper();

            return stripper.getText(document);
        }
    }

    // =========================================================
    // GET RESUME BY ID
    // =========================================================

    public Optional<Resume> getResumeById(Long id) {

        return resumeRepository.findById(id);
    }

    // =========================================================
    // GET ALL RESUMES OF A USER
    // =========================================================

    public List<Resume> getResumesByUserId(Long userId) {

        return resumeRepository.findByUserId(userId);
    }
}