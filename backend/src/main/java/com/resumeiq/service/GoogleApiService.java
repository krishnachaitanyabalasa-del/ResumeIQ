package com.resumeiq.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Function;

@Service
public class GoogleApiService {

    private final List<Client> clients = new ArrayList<>();
    private final AtomicInteger currentClientIndex = new AtomicInteger(0);

    public GoogleApiService() {
        List<String> keys = new ArrayList<>();

        // 1. Check GOOGLE_API_KEYS (comma separated)
        String multiKeys = System.getenv("GOOGLE_API_KEYS");
        if (multiKeys != null && !multiKeys.isBlank()) {
            Arrays.stream(multiKeys.split("[,;]+"))
                    .map(String::trim)
                    .filter(k -> !k.isBlank())
                    .forEach(keys::add);
        }

        // 2. Check individual key environment variables
        checkAndAddKey(keys, System.getenv("GOOGLE_API_KEY"));
        checkAndAddKey(keys, System.getenv("GOOGLE_API_KEY1"));
        checkAndAddKey(keys, System.getenv("GOOGLE_API_KEY2"));
        checkAndAddKey(keys, System.getenv("GOOGLE_API_KEY3"));
        checkAndAddKey(keys, System.getenv("GEMINI_API_KEY"));

        // Fallback dummy key if no key was provided at startup
        if (keys.isEmpty()) {
            keys.add("AIzaSyDummyKeyForStartupInitialization12345");
        }

        // Initialize Gemini Client for each API Key
        for (String apiKey : keys) {
            try {
                Client client = Client.builder()
                        .apiKey(apiKey)
                        .build();
                clients.add(client);
            } catch (Exception e) {
                System.out.println("Warning: Failed to initialize Client for key: " + apiKey.substring(0, Math.min(8, apiKey.length())) + "...");
            }
        }

        if (clients.isEmpty()) {
            clients.add(Client.builder().apiKey("AIzaSyDummyKeyForStartupInitialization12345").build());
        }

        System.out.println("GoogleApiService initialized with " + clients.size() + " Gemini API key(s) for rotation.");
    }

    private void checkAndAddKey(List<String> list, String key) {
        if (key != null && !key.isBlank() && !list.contains(key.trim())) {
            list.add(key.trim());
        }
    }

    // Helper method to execute API call with automatic multi-key rotation on quota failover
    private String executeWithKeyRotation(Function<Client, String> apiCall) {
        int totalClients = clients.size();
        Exception lastException = null;

        for (int i = 0; i < totalClients; i++) {
            int index = (currentClientIndex.get() + i) % totalClients;
            Client currentClient = clients.get(index);

            try {
                String result = apiCall.apply(currentClient);
                if (result != null && !result.isBlank()) {
                    currentClientIndex.set(index); // Keep using current working key
                    return result;
                }
            } catch (Exception e) {
                lastException = e;
                System.out.println("Notice: Gemini API Key #" + (index + 1) + " failed / quota exceeded (" + e.getMessage() + "). Rotating to next API key...");
            }
        }

        // If all API keys failed / quota exceeded, rethrow last exception so deterministic fallback handles application
        throw new RuntimeException("All " + totalClients + " Gemini API Key(s) exhausted quota or failed: " + (lastException != null ? lastException.getMessage() : "Unknown error"));
    }

    // =========================================================
    // 1. ANALYZE RESUME PDF
    // =========================================================

    public String analyzeResume(byte[] pdfBytes, String prompt) {
        return executeWithKeyRotation(client -> {
            Content content = Content.fromParts(
                    Part.fromBytes(pdfBytes, "application/pdf"),
                    Part.fromText(prompt)
            );

            GenerateContentResponse response = client.models.generateContent(
                    "gemini-3.7-flash",
                    content,
                    null
            );

            return response.text();
        });
    }

    // =========================================================
    // 2. EXTRACT STRUCTURED DATA FROM RESUME
    // =========================================================

    public String extractResumeData(String resumeText) {
        String prompt = """
        You are an expert resume parser.

        Extract information ONLY from the resume text provided below.

        Return ONLY a valid JSON object.
        Do NOT return markdown.
        Do NOT use ```json.
        Do NOT write "Here is the JSON".
        Do NOT write any explanation.

        The JSON MUST contain exactly these fields:

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
        1. name: Extract the candidate's full name from the top/header of the resume.
        2. email: Extract the candidate's email address.
        3. phone: Extract the candidate's phone number.
        4. skills: Extract ALL technical and soft skills from the Technical Skills section.
        5. education: Extract ALL education entries from the Education section.
        6. experience: Extract ALL work experience entries, including company, designation, dates and responsibilities.
        7. projects: Extract ALL projects and their descriptions from the Projects section.
        8. certifications: Extract ALL certifications from the Certifications section.
        9. achievements: Extract ALL achievements from the Achievements section.
        10. summary: Extract the complete Summary/Profile section.

        IMPORTANT:
        - Never invent information.
        - Never omit a section if it exists in the resume.
        - If a section genuinely does not exist, return an empty string.
        - Return strings for every field.

        Resume text:
        """ + resumeText;

        return executeWithKeyRotation(client -> {
            GenerateContentResponse response = client.models.generateContent(
                    "gemini-3.7-flash",
                    prompt,
                    null
            );

            return response.text();
        });
    }

    // =========================================================
    // 3. CALCULATE RESUME SCORE AGAINST A DRIVE
    // =========================================================

    public String calculateResumeScore(
            String resumeData,
            String jdText,
            String requiredSkills,
            String requiredExperience,
            String requiredEducation,
            String requiredResponsibilities,
            String requiredQualifications
    ) {

        String prompt = """
        You are an expert Applicant Tracking System (ATS) and professional technical recruiter.

        Your task is to evaluate a candidate's resume against a job/placement drive.

        IMPORTANT:
        - Analyze ONLY the information provided.
        - Never invent candidate experience or skills.
        - Do not give a high score merely because a keyword appears.
        - Consider actual relevance and context.
        - Be strict but fair.
        - Return ONLY valid JSON.
        - Do NOT return markdown.
        - Do NOT use ```json.
        - Do NOT provide any explanation outside the JSON.

        =====================================================
        SCORING SYSTEM
        =====================================================
        Calculate the final score out of 100.
        Skills Match       = 40 points
        Experience Match   = 20 points
        Education Match    = 10 points
        Projects Match     = 20 points
        Overall Relevance  = 10 points
        Total = 100 points.

        =====================================================
        JOB DESCRIPTION
        =====================================================
        %s

        =====================================================
        REQUIRED SKILLS
        =====================================================
        %s

        =====================================================
        REQUIRED EXPERIENCE
        =====================================================
        %s

        =====================================================
        REQUIRED EDUCATION
        =====================================================
        %s

        =====================================================
        RESPONSIBILITIES
        =====================================================
        %s

        =====================================================
        QUALIFICATIONS
        =====================================================
        %s

        =====================================================
        CANDIDATE RESUME DATA
        =====================================================
        %s

        =====================================================
        REQUIRED OUTPUT
        =====================================================
        Return EXACTLY this JSON structure:

        {
          "score": 0,
          "skillsScore": 0,
          "experienceScore": 0,
          "educationScore": 0,
          "projectScore": 0,
          "matchedSkills": [],
          "missingSkills": [],
          "strengths": [],
          "weaknesses": [],
          "feedback": ""
        }

        Return ONLY JSON.
        """.formatted(
                safe(jdText),
                safe(requiredSkills),
                safe(requiredExperience),
                safe(requiredEducation),
                safe(requiredResponsibilities),
                safe(requiredQualifications),
                safe(resumeData)
        );

        return executeWithKeyRotation(client -> {
            GenerateContentResponse response = client.models.generateContent(
                    "gemini-3.7-flash",
                    prompt,
                    null
            );

            return cleanJson(response.text());
        });
    }

    private String cleanJson(String response) {
        if (response == null) {
            return "";
        }
        response = response.trim();
        if (response.startsWith("```json")) {
            response = response.substring(7);
        }
        if (response.startsWith("```")) {
            response = response.substring(3);
        }
        if (response.endsWith("```")) {
            response = response.substring(0, response.length() - 3);
        }
        return response.trim();
    }

    private String safe(String value) {
        if (value == null || value.isBlank()) {
            return "Not provided";
        }
        return value;
    }
}