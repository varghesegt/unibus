package com.unibus.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "ub_user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(unique = true, nullable = false, length = 10)
    private String rollNo;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String gender;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Column(nullable = false)
    private String college;

    private String degree;

    private String department;

    @Column(name = "study_year")
    private String year;

    @Column(name = "study_semester")
    private String semester;

    private String password;

    private Boolean isVerified = false;

    private Boolean isAdmin = false;

    // We can map these using IDs for simplicity and loosely coupled relationships
    @Column(name = "boarding_point_id")
    private UUID boardingPointId;

    @Column(name = "bus_id")
    private UUID busId;
}
