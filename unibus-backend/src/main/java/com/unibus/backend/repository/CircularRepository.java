package com.unibus.backend.repository;

import com.unibus.backend.entity.Circular;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CircularRepository extends JpaRepository<Circular, Long> {
    List<Circular> findAllByOrderByCreatedAtDesc();
}
