package com.resumeiq.service;

import com.resumeiq.dto.JDRequirements;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class JDParserService {

    private static final List<String> SKILLS = Arrays.asList(

            // Programming
            "Java",
            "Python",
            "C++",
            "C",
            "JavaScript",
            "TypeScript",
            "Go",
            "Rust",

            // Backend
            "Spring Boot",
            "Spring",
            "Spring Security",
            "REST API",
            "REST APIs",
            "Microservices",
            "Node.js",
            "Express.js",

            // Frontend
            "React",
            "Next.js",
            "Angular",
            "HTML",
            "CSS",
            "Tailwind CSS",

            // Databases
            "MySQL",
            "PostgreSQL",
            "MongoDB",
            "Oracle",
            "SQL",
            "Redis",

            // Cloud
            "AWS",
            "Azure",
            "GCP",
            "Docker",
            "Kubernetes",

            // CS
            "Data Structures",
            "Algorithms",
            "DSA",
            "Operating Systems",
            "Computer Networks",
            "DBMS",
            "Object Oriented Programming",
            "OOP",

            // Tools
            "Git",
            "GitHub",
            "Jenkins",
            "Maven",
            "Gradle",

            // Other
            "Machine Learning",
            "Deep Learning",
            "Artificial Intelligence",
            "Generative AI",
            "LLM"
    );

    public JDRequirements parse(String jdText) {

        JDRequirements result =
                new JDRequirements();

        result.setRequiredSkills(
                extractSkills(jdText)
        );

        result.setRequiredExperience(
                extractExperience(jdText)
        );

        result.setRequiredEducation(
                extractEducation(jdText)
        );

        result.setRequiredResponsibilities(
                extractSection(
                        jdText,
                        "responsibilities",
                        "responsibility",
                        "roles and responsibilities",
                        "what you'll do",
                        "what you will do"
                )
        );

        result.setRequiredQualifications(
                extractSection(
                        jdText,
                        "qualifications",
                        "requirements",
                        "eligibility",
                        "what we're looking for",
                        "what we are looking for"
                )
        );

        return result;
    }

    // ============================================================
    // SKILLS
    // ============================================================

    private String extractSkills(String text) {

        List<String> found = new ArrayList<>();

        String lowerText =
                text.toLowerCase();

        for (String skill : SKILLS) {

            if (lowerText.contains(
                    skill.toLowerCase()
            )) {

                found.add(skill);
            }
        }

        return String.join(", ", found);
    }

    // ============================================================
    // EXPERIENCE
    // ============================================================

    private String extractExperience(String text) {

        List<String> patterns = Arrays.asList(

                "\\d+\\s*[-–]\\s*\\d+\\s*years?\\s*(?:of)?\\s*experience",

                "\\d+\\+\\s*years?\\s*(?:of)?\\s*experience",

                "minimum\\s+\\d+\\s*years?\\s*(?:of)?\\s*experience",

                "\\d+\\s*years?\\s*(?:of)?\\s*experience"
        );

        for (String regex : patterns) {

            Pattern pattern =
                    Pattern.compile(
                            regex,
                            Pattern.CASE_INSENSITIVE
                    );

            Matcher matcher =
                    pattern.matcher(text);

            if (matcher.find()) {

                return matcher.group();
            }
        }

        // Check common fresher terminology

        String lower =
                text.toLowerCase();

        if (lower.contains("freshers")
                || lower.contains("fresher")
                || lower.contains("entry level")
                || lower.contains("entry-level")) {

            return "Fresher / Entry Level";
        }

        return "";
    }

    // ============================================================
    // EDUCATION
    // ============================================================

    private String extractEducation(String text) {

        List<String> educationKeywords =
                Arrays.asList(
                        "bachelor",
                        "b.tech",
                        "btech",
                        "b.e",
                        "b.e.",
                        "master",
                        "m.tech",
                        "mtech",
                        "m.e",
                        "m.e.",
                        "computer science",
                        "information technology",
                        "engineering degree",
                        "degree",
                        "graduation",
                        "university"
                );

        String[] lines =
                text.split("\\r?\\n");

        List<String> result =
                new ArrayList<>();

        for (String line : lines) {

            String lower =
                    line.toLowerCase();

            for (String keyword :
                    educationKeywords) {

                if (lower.contains(keyword)) {

                    result.add(line.trim());

                    break;
                }
            }
        }

        return String.join(
                "\n",
                result
        );
    }

    // ============================================================
    // SECTION EXTRACTION
    // ============================================================

    private String extractSection(
            String text,
            String... headings
    ) {

        String[] lines =
                text.split("\\r?\\n");

        StringBuilder result =
                new StringBuilder();

        boolean capturing = false;

        for (String line : lines) {

            String clean =
                    line.trim();

            if (clean.isEmpty()) {
                continue;
            }

            String lower =
                    clean.toLowerCase();

            // Start section
            if (!capturing) {

                for (String heading :
                        headings) {

                    if (lower.equals(
                            heading.toLowerCase()
                    )
                            || lower.startsWith(
                            heading.toLowerCase() + ":"
                    )) {

                        capturing = true;

                        break;
                    }
                }

                continue;
            }

            // Stop at another heading
            if (isHeading(lower)) {
                break;
            }

            result.append(clean)
                    .append("\n");
        }

        return result.toString().trim();
    }

    // ============================================================
    // CHECK SECTION HEADING
    // ============================================================

    private boolean isHeading(
            String line
    ) {

        return line.equals("requirements")
                || line.equals("qualifications")
                || line.equals("responsibilities")
                || line.equals("education")
                || line.equals("experience")
                || line.equals("skills")
                || line.equals("benefits")
                || line.equals("about us")
                || line.equals("about the role")
                || line.equals("preferred qualifications");
    }
}