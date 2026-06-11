package com.unibus.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "ub_seat", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"bus_id", "seatId"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "bus_id", nullable = false)
    private UUID busId;

    @Column(nullable = false, length = 16)
    private String seatId;

    // e.g. "available", "bookedMale", "bookedFemale", "reserved"
    @Builder.Default
    @Column(nullable = false)
    private String status = "available";

    // PENDING, APPROVED, REJECTED
    @Builder.Default
    @Column(nullable = false)
    private String approvalStatus = "APPROVED";

    @Column(length = 500)
    private String receiptUrl;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
