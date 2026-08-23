package com.resumeiq.service;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatModel;
import com.openai.models.responses.Response;
import com.openai.models.responses.ResponseCreateParams;
import org.springframework.stereotype.Service;

@Service
public class OpenAIService {
    String key = System.getenv("OPENAI_API_KEY");
    private final OpenAIClient client;

    public OpenAIService() {
        this.client = OpenAIOkHttpClient.fromEnv();
    }

    public String extractResumeData(String resumeText) {

        String prompt = """
                You are an expert resume parser.

                Analyze the following resume and extract:

                1. Skills
                2. Education
                3. Experience

                Return ONLY valid JSON.

                Do NOT return markdown.
                Do NOT return ```json.
                Do NOT add explanations.

                Use exactly this format:

                {
                  "skills": "Java, Spring Boot, React, SQL",
                  "education": "B.Tech in Computer Science",
                  "experience": "Software Developer Intern - 6 months"
                }

                If a section is not available in the resume,
                or retrieve the skills from the projects mentioned.
                if both not present return an empty string for that field 

                RESUME:

                %s
                """.formatted(resumeText);

        ResponseCreateParams params =
                ResponseCreateParams.builder()
                        .model(ChatModel.GPT_5_2)
                        .input(prompt)
                        .build();

        Response response =
                client.responses().create(params);

        return response.output()
                .stream()
                .flatMap(item -> item.message().stream())
                .flatMap(message -> message.content().stream())
                .flatMap(content -> content.outputText().stream())
                .map(outputText -> outputText.text())
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException(
                                "OpenAI returned no response"
                        )
                );
    }
}