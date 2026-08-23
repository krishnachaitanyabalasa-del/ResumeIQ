package com.resumeiq.service;

import com.resumeiq.entity.Application;
import com.resumeiq.entity.Drive;
import com.resumeiq.entity.ScreeningResult;
import com.resumeiq.repository.ApplicationRepository;
import com.resumeiq.repository.DriveRepository;
import com.resumeiq.repository.ScreeningResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ScreeningService {

    @Autowired
    private DriveRepository driveRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private ScreeningResultRepository screeningResultRepository;

    public List<ScreeningResult> screenDrive(Long driveId) {
        Drive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new RuntimeException("Drive not found with id: " + driveId));

        List<Application> applications = applicationRepository.findByDriveId(driveId);
        List<ScreeningResult> results = new ArrayList<>();

        for (Application app : applications) {
            // Check if already screened
            ScreeningResult result = screeningResultRepository.findByApplicationId(app.getId())
                    .orElse(ScreeningResult.builder()
                            .application(app)
                            .drive(drive)
                            .score(85.0) // Mock initial screening score
                            .summary("Matched key requirements for role: " + drive.getRole())
                            .skillsMatch("High match")
                            .status("SHORTLISTED")
                            .build());

            results.add(screeningResultRepository.save(result));
            app.setStatus("SCREENED");
            applicationRepository.save(app);
        }

        return results;
    }

    public List<ScreeningResult> getResultsByDriveId(Long driveId) {
        return screeningResultRepository.findByDriveId(driveId);
    }
}
