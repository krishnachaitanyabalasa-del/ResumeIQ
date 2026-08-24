package com.resumeiq.controller;

import com.resumeiq.entity.Drive;
import com.resumeiq.entity.ScreeningResult;
import com.resumeiq.service.DriveService;
import com.resumeiq.service.ScreeningResultService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drives")
@CrossOrigin
public class DriveController {

    @Autowired
    private DriveService driveService;

    @Autowired
    private ScreeningResultService screeningResultService;

    // ============================================================
    // CREATE DRIVE
    // ============================================================

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createDrive(

            @RequestParam String companyName,

            @RequestParam(required = false)
            String companyLogo,

            @RequestParam(required = false)
            MultipartFile companyLogoFile,

            @RequestParam String driveName,

            @RequestParam String role,

            @RequestParam String location,

            @RequestParam(required = false)
            String experience,

            @RequestParam(required = false)
            String lastDate,

            @RequestParam(required = false)
            String employmentType,

            @RequestParam(required = false)
            String description,

            @RequestParam(required = false)
            String jdText,

            @RequestParam(required = false)
            MultipartFile jdFile,

            Authentication authentication
    ) {

        try {

            // Get logged-in admin email from JWT
            String adminEmail =
                    authentication.getName();

            Drive createdDrive =
                    driveService.createDrive(

                            companyName,

                            companyLogo,

                            companyLogoFile,

                            driveName,

                            role,

                            location,

                            experience,

                            lastDate,

                            employmentType,

                            description,

                            jdText,

                            jdFile,

                            adminEmail
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(createdDrive);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage()
                            )
                    );
        }
    }

    // ============================================================
    // GET DRIVES CREATED BY LOGGED-IN ADMIN
    // ============================================================

    @GetMapping("/my-drives")
    public ResponseEntity<List<Drive>> getMyDrives(
            Authentication authentication
    ) {

        String adminEmail =
                authentication.getName();

        return ResponseEntity.ok(
                driveService
                        .getDrivesByAdminEmail(
                                adminEmail
                        )
        );
    }

    // ============================================================
    // GET ADMIN DASHBOARD STATS
    // ============================================================

    @GetMapping("/my-drives/stats")
    public ResponseEntity<Map<String, Long>> getMyDriveStats(
            Authentication authentication
    ) {

        String adminEmail =
                authentication.getName();

        return ResponseEntity.ok(
                driveService
                        .getAdminDriveStats(
                                adminEmail
                        )
        );
    }


    // ============================================================
    // GET DRIVE COUNT
    // ============================================================

    @GetMapping("/my-drives/count")
    public ResponseEntity<?> getMyDriveCount(
            Authentication authentication
    ) {

        String adminEmail =
                authentication.getName();

        return ResponseEntity.ok(
                Map.of(
                        "count",
                        driveService
                                .getDriveCountByAdminEmail(
                                        adminEmail
                                )
                )
        );
    }


    // ============================================================
    // GET ALL DRIVES
    // ============================================================

    @GetMapping
    public ResponseEntity<List<Drive>> getAllDrives() {

        return ResponseEntity.ok(
                driveService.getAllDrives()
        );
    }


    // ============================================================
    // GET OPEN DRIVES
    // ============================================================

    @GetMapping("/open")
    public ResponseEntity<List<Drive>> getOpenDrives() {

        return ResponseEntity.ok(
                driveService.getOpenDrives()
        );
    }


    // ============================================================
    // GET DRIVE BY ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getDriveById(
            @PathVariable Long id
    ) {

        return driveService
                .getDriveById(id)
                .map(ResponseEntity::ok)
                .orElse(
                        ResponseEntity
                                .status(
                                        HttpStatus.NOT_FOUND
                                )
                                .build()
                );
    }


    // ============================================================
    // UPDATE DRIVE
    // ============================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDrive(

            @PathVariable Long id,

            @RequestBody Drive drive
    ) {

        try {

            Drive updatedDrive =
                    driveService.updateDrive(
                            id,
                            drive
                    );

            return ResponseEntity.ok(
                    updatedDrive
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(
                            HttpStatus.NOT_FOUND
                    )
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage()
                            )
                    );
        }
    }


    // ============================================================
    // GET SCREENING RESULTS FOR DRIVE
    // ============================================================

    @GetMapping("/{driveId}/results")
    public ResponseEntity<List<ScreeningResult>> getResultsForDrive(
            @PathVariable Long driveId
    ) {

        return ResponseEntity.ok(
                screeningResultService
                        .getResultsForDrive(
                                driveId
                        )
        );
    }
}