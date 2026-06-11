package com.unibus.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "ub_bus_model")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusModel {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(updatable = false, nullable = false)
    private UUID id;

    @NotBlank(message = "Model Name cannot be empty")
    @Column(nullable = false, unique = true)
    private String modelName;

    @NotBlank(message = "Model JSON data cannot be empty")
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    private String data; // JSON string representing BusModelProperties
}
