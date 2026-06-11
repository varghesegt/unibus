package com.unibus.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.util.UUID;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "ub_boarding_point")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoardingPoint {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotBlank(message = "Boarding Point Name cannot be empty")
    @Column(nullable = false)
    private String name;

    private Double latitude;
    
    private Double longitude;
}
