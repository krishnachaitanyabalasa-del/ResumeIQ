package com.resumeiq.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "applicant_id", nullable = false)
    private User applicant;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "drive_id", nullable = false)
    private Drive drive;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "resume_id")
    private Resume resume;

    private String status;

    private LocalDateTime appliedAt;

    // =========================
    // AI SCORING FIELDS
    // =========================

    private Double score;

    private Double skillsScore;

    private Double experienceScore;

    private Double educationScore;

    private Double projectScore;

    @Column(columnDefinition = "TEXT")
    private String matchedSkills;

    @Column(columnDefinition = "TEXT")
    private String missingSkills;

    @Column(columnDefinition = "TEXT")
    private String aiFeedback;

    @PrePersist
    protected void onCreate() {

        this.appliedAt = LocalDateTime.now();

        if (this.status == null) {
            this.status = "APPLIED";
        }
    }
}