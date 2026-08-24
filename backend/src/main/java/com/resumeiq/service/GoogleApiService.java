package com.resumeiq.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import org.springframework.stereotype.Service;

@Service
public class GoogleApiService {

    private final Client client;

    public GoogleApiService() {
        this.client = Client.builder()
                .apiKey(System.getenv("GOOGLE_API_KEY2"))
                .build();
    }

    // =========================================================
    // 1. ANALYZE RESUME PDF
    // =========================================================

    public String analyzeResume(byte[] pdfBytes, String prompt) {

        Content content = Content.fromParts(
                Part.fromBytes(pdfBytes, "application/pdf"),
                Part.fromText(prompt)
        );

        GenerateContentResponse response =
                client.models.generateContent(
                        "gemini-3.7-flash",
                        content,
                        null
                );

        return response.text();
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

        1. name:
           Extract the candidate's full name from the top/header of the resume.

        2. email:
           Extract the candidate's email address.

        3. phone:
           Extract the candidate's phone number.

        4. skills:
           Extract ALL technical and soft skills from the Technical Skills section.
           Preserve the categories and skill names.

        5. education:
           Extract ALL education entries from the Education section.

        6. experience:
           Extract ALL work experience entries, including company,
           designation, dates and responsibilities.

        7. projects:
           Extract ALL projects and their descriptions from the Projects section.

        8. certifications:
           Extract ALL certifications from the Certifications section.

        9. achievements:
           Extract ALL achievements from the Achievements section.

        10. summary:
            Extract the complete Summary/Profile section.

        IMPORTANT:
        - Never invent information.
        - Never omit a section if it exists in the resume.
        - If a section genuinely does not exist, return an empty string.
        - Return strings for every field.

        Resume text:
        """ + resumeText;

        GenerateContentResponse response =
                client.models.generateContent(
                        "gemini-3.7-flash",
                        prompt,
                        null
                );

        return response.text();
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
        You are an expert Applicant Tracking System (ATS)
        and professional technical recruiter.

        Your task is to evaluate a candidate's resume against
        a job/placement drive.

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
        SCORE GUIDELINES
        =====================================================

        Skills Match:
        Compare required skills with the candidate's actual skills.
        Consider both exact matches and closely related technologies.

        Experience Match:
        Compare required experience with the candidate's actual
        work/internship experience.

        Education Match:
        Check degree, branch, qualification and other educational
        requirements.

        Projects Match:
        Check whether the candidate's projects demonstrate skills
        relevant to the role.

        Overall Relevance:
        Consider the overall suitability of the candidate for the role.

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

        FIELD RULES:

        score:
        Final score from 0 to 100.

        skillsScore:
        Score from 0 to 40.

        experienceScore:
        Score from 0 to 20.

        educationScore:
        Score from 0 to 10.

        projectScore:
        Score from 0 to 20.

        matchedSkills:
        List of important required skills that the candidate possesses.

        missingSkills:
        List of important required skills that the candidate does not demonstrate.

        strengths:
        List of important strengths relevant to the job.

        weaknesses:
        List of important weaknesses or gaps.

        feedback:
        Give a concise recruiter-friendly explanation of why
        the candidate received this score.

        Make sure:

        skillsScore + experienceScore + educationScore + projectScore
        + overall relevance component = score.

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

        GenerateContentResponse response =
                client.models.generateContent(
                        "gemini-3.7-flash",
                        prompt,
                        null
                );

        return cleanJson(response.text());
    }


    // =========================================================
    // 4. CLEAN GEMINI JSON RESPONSE
    // =========================================================

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
            response = response.substring(
                    0,
                    response.length() - 3
            );
        }

        return response.trim();
    }


    // =========================================================
    // 5. HANDLE NULL VALUES
    // =========================================================

    private String safe(String value) {

        if (value == null || value.isBlank()) {
            return "Not provided";
        }

        return value;
    }
}