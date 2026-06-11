package com.unibus.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.time.LocalTime;

@Entity
@Table(name = "ub_bus_boarding_point")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusBoardingPoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bus_id", nullable = false)
    private UUID busId;

    @Column(name = "boarding_point_id", nullable = false)
    private UUID boardingPointId;

    @Column(nullable = false)
    private LocalTime arrivalTime;
}
