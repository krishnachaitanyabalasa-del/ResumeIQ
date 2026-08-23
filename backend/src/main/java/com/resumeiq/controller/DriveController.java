package com.resumeiq.controller;

import com.resumeiq.entity.Drive;
import com.resumeiq.entity.ScreeningResult;
import com.resumeiq.service.DriveService;
import com.resumeiq.service.ScreeningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drives")
public class DriveController {

    @Autowired
    private DriveService driveService;

    @Autowired
    private ScreeningService screeningService;

    @PostMapping
    public ResponseEntity<?> createDrive(@RequestBody Drive drive) {
        try {
            Drive createdDrive = driveService.createDrive(drive);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDrive);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Drive>> getAllDrives() {
        return ResponseEntity.ok(driveService.getAllDrives());
    }

    @GetMapping("/open")
    public ResponseEntity<List<Drive>> getOpenDrives() {
        return ResponseEntity.ok(driveService.getOpenDrives());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDriveById(@PathVariable Long id) {
        return driveService.getDriveById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDrive(@PathVariable Long id, @RequestBody Drive drive) {
        try {
            Drive updatedDrive = driveService.updateDrive(id, drive);
            return ResponseEntity.ok(updatedDrive);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/{driveId}/apply")
    public ResponseEntity<?> applyToDrive(@PathVariable Long driveId) {
        return ResponseEntity.ok(Map.of(
                "message", "Application submitted successfully for drive ID: " + driveId,
                "driveId", driveId
        ));
    }

    @PostMapping("/{driveId}/screen")
    public ResponseEntity<?> screenDrive(@PathVariable Long driveId) {
        try {
            List<ScreeningResult> results = screeningService.screenDrive(driveId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/{driveId}/results")
    public ResponseEntity<?> getScreeningResults(@PathVariable Long driveId) {
        try {
            List<ScreeningResult> results = screeningService.getResultsByDriveId(driveId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
