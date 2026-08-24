package com.resumeiq.controller;

import com.resumeiq.dto.ApplicationRequest;
import com.resumeiq.entity.Application;
import com.resumeiq.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(
            ApplicationService applicationService
    ) {
        this.applicationService = applicationService;
    }

    // ==========================================
    // CREATE APPLICATION + CALCULATE SCORE
    // ==========================================

    @PostMapping
    public ResponseEntity<Application> createApplication(
            @RequestBody ApplicationRequest request
    ) {

        try {

            Application application =
                    applicationService.createApplication(request);

            return ResponseEntity.ok(application);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }

    // ==========================================
    // GET ALL APPLICATIONS
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Application>> getAllApplications() {

        return ResponseEntity.ok(
                applicationService.getAllApplications()
        );
    }

    // ==========================================
    // GET APPLICATIONS BY USER
    // ==========================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Application>>
    getApplicationsByUser(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                applicationService
                        .getApplicationsByUser(userId)
        );
    }

    // ==========================================
    // GET APPLICATIONS BY DRIVE
    // ==========================================

    @GetMapping("/drive/{driveId}")
    public ResponseEntity<List<Application>>
    getApplicationsByDrive(
            @PathVariable Long driveId
    ) {

        return ResponseEntity.ok(
                applicationService
                        .getApplicationsByDrive(driveId)
        );
    }
}