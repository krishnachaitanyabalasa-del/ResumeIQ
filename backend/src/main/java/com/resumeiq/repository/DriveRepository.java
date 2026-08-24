package com.resumeiq.repository;

import com.resumeiq.entity.Drive;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DriveRepository extends JpaRepository<Drive, Long> {

    List<Drive> findByCreatedByEmail(String email);

    long countByCreatedByEmail(String email);

    long countByCreatedByEmailAndStatus(String email, String status);

    List<Drive> findByStatus(String status);
}