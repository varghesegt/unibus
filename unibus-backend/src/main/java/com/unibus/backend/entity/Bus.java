package com.unibus.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity
@Table(name = "ub_bus")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bus {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "model_id", nullable = false)
    private UUID modelId;

    @Column(nullable = false, unique = true, length = 20)
    private String busNumber;

    private String routeName;

    @Column(nullable = false)
    private String driverName;

    @Column(nullable = false, length = 15)
    private String driverPhone;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    private String seats; // JSON map of seatId -> seatStatus

    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @Builder.Default
    @Version
    private Long version = 0L;
    
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
