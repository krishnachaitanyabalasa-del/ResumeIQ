package com.resumeiq.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "screening_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScreeningResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "drive_id", nullable = false)
    private Drive drive;

    private Double score;

    @Column(columnDefinition = "TEXT")
    private String summary;

    private String skillsMatch;

    private String status;

    private LocalDateTime screenedAt;

    @PrePersist
    protected void onCreate() {
        this.screenedAt = LocalDateTime.now();
    }
}
