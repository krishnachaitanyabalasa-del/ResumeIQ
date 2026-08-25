package com.resumeiq.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping({"/", "/health", "/api/health"})
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> statusMap = new HashMap<>();
        statusMap.put("status", "OK");
        statusMap.put("service", "ResumeIQ Backend API");
        statusMap.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(statusMap);
    }
}
