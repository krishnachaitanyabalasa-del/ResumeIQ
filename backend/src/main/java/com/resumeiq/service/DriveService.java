package com.resumeiq.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;
import com.resumeiq.dto.JDRequirements;
import com.resumeiq.entity.Drive;
import com.resumeiq.repository.DriveRepository;
import jakarta.annotation.PostConstruct;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class DriveService {

    @Autowired
    private DriveRepository driveRepository;

    @Autowired
    private JDParserService jdParserService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Client geminiClient;

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public DriveService() {

        String apiKey = System.getenv("GOOGLE_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            apiKey = System.getenv("GOOGLE_API_KEY2");
        }
        if (apiKey == null || apiKey.isBlank()) {
            apiKey = "AIzaSyDummyKeyForStartupInitialization12345";
        }

        this.geminiClient = Client.builder()
                .apiKey(apiKey)
                .build();
    }

    @PostConstruct
    public void ensureLongtextColumn() {
        try {
            jdbcTemplate.execute("ALTER TABLE drives MODIFY COLUMN company_logo LONGTEXT");
            System.out.println("MySQL DB Migration: Altered drives.company_logo to LONGTEXT successfully.");
        } catch (Exception e) {
            System.out.println("MySQL DB Migration Notice: " + e.getMessage());
        }
    }

    // ============================================================
    // CREATE DRIVE
    // ============================================================

    public Drive createDrive(
            String companyName,
            String companyLogo,
            MultipartFile companyLogoFile,
            String driveName,
            String role,
            String location,
            String experience,
            String lastDate,
            String employmentType,
            String description,
            String jdText,
            MultipartFile jdFile,
            String adminEmail
    ) throws Exception {

        System.out.println(
                "========== DRIVE CREATION START =========="
        );

        boolean hasText =
                jdText != null &&
                        !jdText.trim().isEmpty();

        boolean hasFile =
                jdFile != null &&
                        !jdFile.isEmpty();

        System.out.println(
                "Admin Email: " + adminEmail
        );

        System.out.println(
                "Has JD text: " + hasText
        );

        System.out.println(
                "Has JD file: " + hasFile
        );

        // --------------------------------------------------------
        // PROCESS COMPANY LOGO
        // --------------------------------------------------------

        String finalCompanyLogo = companyLogo;

        if (companyLogoFile != null && !companyLogoFile.isEmpty()) {
            byte[] logoBytes = companyLogoFile.getBytes();
            String base64Logo = Base64.getEncoder().encodeToString(logoBytes);
            String contentType = companyLogoFile.getContentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = "image/png";
            }
            finalCompanyLogo = "data:" + contentType + ";base64," + base64Logo;
            System.out.println("Converted company logo file to Base64 data URL. Length: " + finalCompanyLogo.length());
        } else if (companyLogo != null && !companyLogo.isBlank()) {
            finalCompanyLogo = companyLogo;
            System.out.println("Received string company logo. Length: " + finalCompanyLogo.length());
        }

        // --------------------------------------------------------
        // VALIDATE JD
        // --------------------------------------------------------

        if (!hasText && !hasFile) {

            throw new RuntimeException(
                    "Please provide JD text or PDF"
            );
        }

        if (hasText && hasFile) {

            throw new RuntimeException(
                    "Please provide either JD text or PDF, not both"
            );
        }

        String finalJdText = jdText;

        // --------------------------------------------------------
        // PDF EXTRACTION
        // --------------------------------------------------------

        if (hasFile) {

            System.out.println(
                    "1. Starting PDF extraction..."
            );

            finalJdText =
                    extractTextFromPdf(jdFile);

            System.out.println(
                    "2. PDF extraction completed."
            );

            System.out.println(
                    "Extracted JD characters: "
                            + finalJdText.length()
            );
        }

        // --------------------------------------------------------
        // LOCAL JD PARSING
        // --------------------------------------------------------

        System.out.println(
                "3. Parsing JD locally..."
        );

        JDRequirements requirements =
                jdParserService.parse(
                        finalJdText
                );

        System.out.println(
                "4. JD parsing completed."
        );

        // --------------------------------------------------------
        // BUILD DRIVE
        // --------------------------------------------------------

        Drive drive =
                Drive.builder()

                        .companyName(companyName)

                        .companyLogo(finalCompanyLogo)

                        .driveName(driveName)

                        .role(role)

                        .location(location)

                        .experience(experience)

                        .lastDate(lastDate)

                        .employmentType(employmentType != null && !employmentType.isBlank() ? employmentType : "Full-time")

                        .description(description)

                        .jdText(finalJdText)

                        .jdFileUrl(null)

                        .requiredSkills(
                                requirements
                                        .getRequiredSkills()
                        )

                        .requiredExperience(
                                requirements
                                        .getRequiredExperience()
                        )

                        .requiredEducation(
                                requirements
                                        .getRequiredEducation()
                        )

                        .requiredResponsibilities(
                                requirements
                                        .getRequiredResponsibilities()
                        )

                        .requiredQualifications(
                                requirements
                                        .getRequiredQualifications()
                        )

                        .status("OPEN")

                        // ⭐ IMPORTANT
                        .createdByEmail(adminEmail)

                        .build();

        // --------------------------------------------------------
        // SAVE DRIVE
        // --------------------------------------------------------

        System.out.println(
                "5. Saving Drive..."
        );

        Drive saved =
                driveRepository.save(drive);

        System.out.println(
                "6. Drive saved with ID: "
                        + saved.getId()
        );

        return saved;
    }

    // ============================================================
    // GET DRIVES CREATED BY ADMIN
    // ============================================================

    public List<Drive> getDrivesByAdminEmail(
            String email
    ) {

        return driveRepository
                .findByCreatedByEmail(email);
    }

    // ============================================================
    // GET ADMIN TOTAL DRIVE COUNT
    // ============================================================

    public long getDriveCountByAdminEmail(
            String email
    ) {

        return driveRepository
                .countByCreatedByEmail(email);
    }

    // ============================================================
    // GET ADMIN DASHBOARD STATISTICS
    // ============================================================

    public Map<String, Long> getAdminDriveStats(
            String email
    ) {

        long total =
                driveRepository
                        .countByCreatedByEmail(email);

        long open =
                driveRepository
                        .countByCreatedByEmailAndStatus(
                                email,
                                "OPEN"
                        );

        long closed =
                driveRepository
                        .countByCreatedByEmailAndStatus(
                                email,
                                "CLOSED"
                        );

        long upcoming =
                driveRepository
                        .countByCreatedByEmailAndStatus(
                                email,
                                "UPCOMING"
                        );

        long completed =
                driveRepository
                        .countByCreatedByEmailAndStatus(
                                email,
                                "COMPLETED"
                        );

        return Map.of(
                "totalDrives", total,
                "openDrives", open,
                "closedDrives", closed,
                "upcomingDrives", upcoming,
                "closedAndUpcoming", closed + upcoming,
                "completedDrives", completed
        );
    }

    // ============================================================
    // PDF TEXT EXTRACTION
    // ============================================================

    private String extractTextFromPdf(
            MultipartFile file
    ) throws IOException {

        try (
                PDDocument document =
                        PDDocument.load(
                                file.getInputStream()
                        )
        ) {

            PDFTextStripper stripper =
                    new PDFTextStripper();

            return stripper.getText(document);
        }
    }

    // ============================================================
    // GET ALL DRIVES
    // ============================================================

    public List<Drive> getAllDrives() {

        return driveRepository.findAll();
    }

    // ============================================================
    // GET OPEN DRIVES
    // ============================================================

    public List<Drive> getOpenDrives() {

        return driveRepository.findByStatus(
                "OPEN"
        );
    }

    // ============================================================
    // GET DRIVE BY ID
    // ============================================================

    public java.util.Optional<Drive> getDriveById(
            Long id
    ) {

        return driveRepository.findById(id);
    }

    // ============================================================
    // UPDATE DRIVE
    // ============================================================

    public Drive updateDrive(
            Long id,
            Drive driveDetails
    ) {

        Drive existingDrive =
                driveRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Drive not found with id: "
                                                + id
                                )
                        );

        if (driveDetails.getCompanyName() != null) {
            existingDrive.setCompanyName(
                    driveDetails.getCompanyName()
            );
        }

        if (driveDetails.getCompanyLogo() != null) {
            existingDrive.setCompanyLogo(
                    driveDetails.getCompanyLogo()
            );
        }

        if (driveDetails.getDriveName() != null) {
            existingDrive.setDriveName(
                    driveDetails.getDriveName()
            );
        }

        if (driveDetails.getRole() != null) {
            existingDrive.setRole(
                    driveDetails.getRole()
            );
        }

        if (driveDetails.getLocation() != null) {
            existingDrive.setLocation(
                    driveDetails.getLocation()
            );
        }

        if (driveDetails.getExperience() != null) {
            existingDrive.setExperience(
                    driveDetails.getExperience()
            );
        }

        if (driveDetails.getLastDate() != null) {
            existingDrive.setLastDate(
                    driveDetails.getLastDate()
            );
        }

        if (driveDetails.getEmploymentType() != null) {
            existingDrive.setEmploymentType(
                    driveDetails.getEmploymentType()
            );
        }

        if (driveDetails.getDescription() != null) {
            existingDrive.setDescription(
                    driveDetails.getDescription()
            );
        }

        if (driveDetails.getJdText() != null) {
            existingDrive.setJdText(
                    driveDetails.getJdText()
            );
        }

        if (driveDetails.getJdFileUrl() != null) {
            existingDrive.setJdFileUrl(
                    driveDetails.getJdFileUrl()
            );
        }

        if (driveDetails.getRequiredSkills() != null) {
            existingDrive.setRequiredSkills(
                    driveDetails.getRequiredSkills()
            );
        }

        if (driveDetails.getRequiredExperience() != null) {
            existingDrive.setRequiredExperience(
                    driveDetails.getRequiredExperience()
            );
        }

        if (driveDetails.getRequiredEducation() != null) {
            existingDrive.setRequiredEducation(
                    driveDetails.getRequiredEducation()
            );
        }

        if (driveDetails.getRequiredResponsibilities() != null) {
            existingDrive.setRequiredResponsibilities(
                    driveDetails.getRequiredResponsibilities()
            );
        }

        if (driveDetails.getRequiredQualifications() != null) {
            existingDrive.setRequiredQualifications(
                    driveDetails.getRequiredQualifications()
            );
        }

        if (driveDetails.getStatus() != null) {
            existingDrive.setStatus(
                    driveDetails.getStatus()
            );
        }

        return driveRepository.save(
                existingDrive
        );
    }

    // ============================================================
    // GEMINI JD EXTRACTION
    // ============================================================

    private String extractJDRequirements(
            String jdText
    ) {

        String prompt = """
                You are an expert Job Description parser.

                Analyze the Job Description below.

                Return ONLY valid JSON.

                Do NOT:
                - return markdown
                - use ```json
                - write explanations
                - write "Here is the JSON"
                - invent information

                If a value is not available,
                return an empty string.

                Return EXACTLY this JSON:

                {
                  "requiredSkills": "",
                  "requiredExperience": "",
                  "requiredEducation": "",
                  "requiredResponsibilities": "",
                  "requiredQualifications": ""
                }

                JOB DESCRIPTION:

                """ + jdText;

        GenerateContentConfig config =
                GenerateContentConfig.builder()
                        .temperature(0.0F)
                        .maxOutputTokens(800)
                        .responseMimeType("application/json")
                        .build();

        GenerateContentResponse response =
                geminiClient.models.generateContent(
                        "gemini-3.7-flash",
                        prompt,
                        config
                );

        String result =
                response.text();

        if (result == null ||
                result.isBlank()) {

            throw new RuntimeException(
                    "Gemini returned an empty response"
            );
        }

        return result;
    }

    // ============================================================
    // PARSE GEMINI JSON
    // ============================================================

    private JsonNode parseGeminiJson(
            String response
    ) throws IOException {

        if (response == null ||
                response.isBlank()) {

            throw new RuntimeException(
                    "Gemini returned an empty response"
            );
        }

        String json =
                response.trim();

        if (json.startsWith("```json")) {
            json = json.substring(7);
        }
        else if (json.startsWith("```")) {
            json = json.substring(3);
        }

        if (json.endsWith("```")) {

            json = json.substring(
                    0,
                    json.length() - 3
            );
        }

        json = json.trim();

        int firstBrace =
                json.indexOf('{');

        int lastBrace =
                json.lastIndexOf('}');

        if (firstBrace == -1 ||
                lastBrace == -1) {

            throw new RuntimeException(
                    "Gemini did not return valid JSON: "
                            + response
            );
        }

        json =
                json.substring(
                        firstBrace,
                        lastBrace + 1
                );

        return objectMapper.readTree(json);
    }

    // ============================================================
    // PDF VALIDATION
    // ============================================================

    private boolean isPdf(
            MultipartFile file
    ) {

        String contentType =
                file.getContentType();

        String fileName =
                file.getOriginalFilename();

        return "application/pdf"
                .equalsIgnoreCase(contentType)

                || (
                fileName != null
                        &&
                        fileName
                                .toLowerCase()
                                .endsWith(".pdf")
        );
    }
}