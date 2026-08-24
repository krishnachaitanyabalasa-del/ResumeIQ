package com.resumeiq.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import org.springframework.stereotype.Service;

@Service
public class OpenAIService {

    private final Client client;

    public OpenAIService() {
        this.client = Client.builder()
                .apiKey(System.getenv("GOOGLE_API_KEY"))
                .build();
    }

    public String extractResumeData(String resumeText) {

        String prompt = """
            Analyze the following resume and extract the important information.

            Return:
            1. Candidate name
            2. Email
            3. Phone number
            4. Skills
            5. Education
            6. Work experience
            7. Projects
            8. Certifications
            9. Overall resume summary

            Resume:
            """ + resumeText;

        GenerateContentResponse response =
                client.models.generateContent(
                        "gemini-3.7-flash",
                        prompt,
                        null
                );

        return response.text();
    }

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
}