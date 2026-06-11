package com.unibus.backend.repository;

import com.unibus.backend.entity.Grievance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrievanceRepository extends JpaRepository<Grievance, Long> {
    List<Grievance> findAllByOrderByCreatedAtDesc();
}
