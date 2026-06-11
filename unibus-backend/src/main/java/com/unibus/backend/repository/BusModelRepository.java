package com.unibus.backend.repository;

import com.unibus.backend.entity.BusModel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

import java.util.Optional;

public interface BusModelRepository extends JpaRepository<BusModel, UUID> {
    Optional<BusModel> findByModelName(String modelName);
}
