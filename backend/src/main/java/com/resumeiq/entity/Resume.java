package com.resumeiq.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String fileName;

    private String fileUrl;

    @Column(columnDefinition = "TEXT")
    private String parsedText;

    @Column(columnDefinition = "TEXT")
    private String name;

    private String email;

    private String phone;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String education;

    @Column(columnDefinition = "TEXT")
    private String experience;

    @Column(columnDefinition = "TEXT")
    private String projects;

    @Column(columnDefinition = "TEXT")
    private String certifications;

    @Column(columnDefinition = "TEXT")
    private String summary;

    private LocalDateTime uploadedAt;

    @Column(columnDefinition = "TEXT")
    private String achievements;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}