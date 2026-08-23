package com.resumeiq.service;

import com.resumeiq.entity.Drive;
import com.resumeiq.repository.DriveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DriveService {

    @Autowired
    private DriveRepository driveRepository;

    public Drive createDrive(Drive drive) {
        return driveRepository.save(drive);
    }

    public List<Drive> getAllDrives() {
        return driveRepository.findAll();
    }

    public List<Drive> getOpenDrives() {
        return driveRepository.findByStatus("OPEN");
    }

    public Optional<Drive> getDriveById(Long id) {
        return driveRepository.findById(id);
    }

    public Drive updateDrive(Long id, Drive driveDetails) {
        Drive existingDrive = driveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Drive not found with id: " + id));

        if (driveDetails.getCompanyName() != null) existingDrive.setCompanyName(driveDetails.getCompanyName());
        if (driveDetails.getCompanyLogo() != null) existingDrive.setCompanyLogo(driveDetails.getCompanyLogo());
        if (driveDetails.getDriveName() != null) existingDrive.setDriveName(driveDetails.getDriveName());
        if (driveDetails.getRole() != null) existingDrive.setRole(driveDetails.getRole());
        if (driveDetails.getLocation() != null) existingDrive.setLocation(driveDetails.getLocation());
        if (driveDetails.getExperience() != null) existingDrive.setExperience(driveDetails.getExperience());
        if (driveDetails.getDescription() != null) existingDrive.setDescription(driveDetails.getDescription());
        if (driveDetails.getJdText() != null) existingDrive.setJdText(driveDetails.getJdText());
        if (driveDetails.getJdFileUrl() != null) existingDrive.setJdFileUrl(driveDetails.getJdFileUrl());
        if (driveDetails.getStatus() != null) existingDrive.setStatus(driveDetails.getStatus());

        return driveRepository.save(existingDrive);
    }
}
