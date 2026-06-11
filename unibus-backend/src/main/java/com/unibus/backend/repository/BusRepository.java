package com.unibus.backend.repository;

import com.unibus.backend.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

import java.util.Optional;

public interface BusRepository extends JpaRepository<Bus, UUID> {
    @Query("SELECT b FROM Bus b JOIN BusBoardingPoint bbp ON b.id = bbp.busId WHERE bbp.boardingPointId = :boardingPointId")
    List<Bus> findByBoardingPointId(UUID boardingPointId);

    boolean existsByModelId(UUID modelId);

    Optional<Bus> findByBusNumber(String busNumber);
}
