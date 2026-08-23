package com.resumeiq.controller;

import com.resumeiq.entity.Application;
import com.resumeiq.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @Autowired
    private ApplicationRepository applicationRepository;

    @GetMapping
    public ResponseEntity<List<Application>> getAllApplications() {
        return ResponseEntity.ok(applicationRepository.findAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Application>> getApplicationsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(applicationRepository.findByApplicantId(userId));
    }

    @GetMapping("/drive/{driveId}")
    public ResponseEntity<List<Application>> getApplicationsByDrive(@PathVariable Long driveId) {
        return ResponseEntity.ok(applicationRepository.findByDriveId(driveId));
    }
}
