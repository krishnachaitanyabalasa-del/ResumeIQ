package com.resumeiq.controller;

import com.resumeiq.entity.Resume;
import com.resumeiq.service.ResumeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resumes")
@CrossOrigin
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    // Upload Resume with full candidate form details
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadResume(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("userId") Long userId,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "skills", required = false) String skills,
            @RequestParam(value = "education", required = false) String education,
            @RequestParam(value = "experience", required = false) String experience,
            @RequestParam(value = "projects", required = false) String projects,
            @RequestParam(value = "certifications", required = false) String certifications,
            @RequestParam(value = "summary", required = false) String summary,
            @RequestParam(value = "achievements", required = false) String achievements
    ) {
        try {
            Resume resume = resumeService.uploadResumeWithDetails(
                    file,
                    userId,
                    name,
                    email,
                    phone,
                    skills,
                    education,
                    experience,
                    projects,
                    certifications,
                    summary,
                    achievements
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(resume);

        } catch (Exception e) {
            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // Get Resume by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getResumeById(
            @PathVariable Long id
    ) {
        return resumeService.getResumeById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .build()
                );
    }
}