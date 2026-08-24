package com.resumeiq.controller;

import com.resumeiq.entity.Drive;
import com.resumeiq.entity.ScreeningResult;
import com.resumeiq.service.DriveService;
import com.resumeiq.service.ScreeningService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drives")
public class DriveController {

    @Autowired
    private DriveService driveService;

    @Autowired
    private ScreeningService screeningService;

    // ============================================================
    // CREATE DRIVE
    // ============================================================


    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createDrive(

            @RequestParam String companyName,

            @RequestParam(required = false)
            String companyLogo,

            @RequestParam String driveName,

            @RequestParam String role,

            @RequestParam String location,

            @RequestParam(required = false)
            String experience,

            @RequestParam(required = false)
            String description,

            @RequestParam(required = false)
            String jdText,

            @RequestParam(required = false)
            MultipartFile jdFile

    ) {

        try {

            Drive createdDrive =
                    driveService.createDrive(
                            companyName,
                            companyLogo,
                            driveName,
                            role,
                            location,
                            experience,
                            description,
                            jdText,
                            jdFile
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(createdDrive);

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "error",
                            e.getMessage()
                    ));
        }
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
                                .status(HttpStatus.NOT_FOUND)
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
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage()
                            )
                    );
        }
    }

    // ============================================================
    // APPLY TO DRIVE
    // ============================================================

    @PostMapping("/{driveId}/apply")
    public ResponseEntity<?> applyToDrive(
            @PathVariable Long driveId
    ) {

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Application submitted successfully for drive ID: "
                                + driveId,

                        "driveId",
                        driveId
                )
        );
    }

    // ============================================================
    // SCREEN DRIVE
    // ============================================================

    @PostMapping("/{driveId}/screen")
    public ResponseEntity<?> screenDrive(
            @PathVariable Long driveId
    ) {

        try {

            List<ScreeningResult> results =
                    screeningService.screenDrive(
                            driveId
                    );

            return ResponseEntity.ok(
                    results
            );

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
    // GET SCREENING RESULTS
    // ============================================================

    @GetMapping("/{driveId}/results")
    public ResponseEntity<?> getScreeningResults(
            @PathVariable Long driveId
    ) {

        try {

            List<ScreeningResult> results =
                    screeningService
                            .getResultsByDriveId(
                                    driveId
                            );

            return ResponseEntity.ok(
                    results
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "error",
                                    e.getMessage()
                            )
                    );
        }
    }
}