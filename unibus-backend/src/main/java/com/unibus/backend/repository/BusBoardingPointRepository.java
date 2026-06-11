package com.unibus.backend.repository;

import com.unibus.backend.entity.BusBoardingPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface BusBoardingPointRepository extends JpaRepository<BusBoardingPoint, Long> {
    List<BusBoardingPoint> findByBusId(UUID busId);
}
