package com.resumeiq.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import org.springframework.stereotype.Service;

@Service
public class OpenAIService {
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

    private final Client client;

    public OpenAIService() {
        this.client = Client.builder()
                .apiKey(System.getenv("GOOGLE_API_KEY2"))
                .build();
    }
}