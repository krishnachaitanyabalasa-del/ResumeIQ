package com.resumeiq.repository;

import com.resumeiq.entity.ScreeningResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScreeningResultRepository extends JpaRepository<ScreeningResult, Long> {
    List<ScreeningResult> findByDriveId(Long driveId);
    Optional<ScreeningResult> findByApplicationId(Long applicationId);
}
