package com.resumeiq.controller;

import com.resumeiq.entity.Resume;
import com.resumeiq.service.ResumeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    // Upload Resume
    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId
    ) {
        try {
            Resume resume =
                    resumeService.uploadResume(file, userId);

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