package com.resumeiq.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("/")
    public String health() {
        return "Backend Running";
    }

    @GetMapping("/health")
    public String healthCheck() {
        return "OK";
    }
}