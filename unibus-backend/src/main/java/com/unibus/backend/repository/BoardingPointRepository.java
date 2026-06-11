package com.unibus.backend.repository;

import com.unibus.backend.entity.BoardingPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface BoardingPointRepository extends JpaRepository<BoardingPoint, UUID> {
}
