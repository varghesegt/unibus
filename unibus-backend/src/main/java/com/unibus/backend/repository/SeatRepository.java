package com.unibus.backend.repository;

import com.unibus.backend.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    Optional<Seat> findByBusIdAndSeatId(UUID busId, String seatId);
    List<Seat> findByBusId(UUID busId);
    List<Seat> findByUserId(UUID userId);
}
