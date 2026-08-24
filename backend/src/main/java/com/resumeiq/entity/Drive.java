package com.resumeiq.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "drives")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Drive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;

    @Column(columnDefinition = "LONGTEXT")
    private String companyLogo;

    private String driveName;

    private String role;

    private String location;

    private String experience;

    private String lastDate;

    private String employmentType;

    @Column(columnDefinition = "TEXT")
    private String description;

    /*
     * Complete Job Description text.
     * If HR uploads a PDF, the extracted PDF text
     * will be stored here.
     */
    @Column(columnDefinition = "TEXT")
    private String jdText;

    /*
     * Location/path of uploaded JD PDF.
     */
    private String jdFileUrl;

    /*
     * Structured requirements extracted from the JD.
     */
    @Column(columnDefinition = "TEXT")
    private String requiredSkills;

    @Column(columnDefinition = "TEXT")
    private String requiredExperience;

    @Column(columnDefinition = "TEXT")
    private String requiredEducation;

    @Column(columnDefinition = "TEXT")
    private String requiredResponsibilities;

    @Column(columnDefinition = "TEXT")
    private String requiredQualifications;

    private String status;

    private String createdByEmail;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();

        if (this.status == null || this.status.isBlank()) {
            this.status = "OPEN";
        }

        if (this.employmentType == null || this.employmentType.isBlank()) {
            this.employmentType = "Full-time";
        }
    }
}