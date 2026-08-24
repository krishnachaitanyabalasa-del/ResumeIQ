package com.resumeiq.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ScoreResponse {

    private Double score;

    private Double skillsScore;

    private Double experienceScore;

    private Double educationScore;

    private Double projectScore;

    private Double relevanceScore;

    private List<String> matchedSkills;

    private List<String> missingSkills;

    private List<String> strengths;

    private List<String> weaknesses;

    private String feedback;
}