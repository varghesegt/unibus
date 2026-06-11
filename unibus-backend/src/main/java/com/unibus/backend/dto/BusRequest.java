package com.unibus.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;
import java.util.UUID;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
public class BusRequest {
    @NotNull(message = "Model ID is required")
    private UUID modelId;
    
    @NotBlank(message = "Bus Number cannot be empty")
    private String busNumber;
    
    @NotBlank(message = "Route Name cannot be empty")
    private String routeName;
    
    @NotBlank(message = "Driver Name cannot be empty")
    private String driverName;
    
    @NotBlank(message = "Driver Phone cannot be empty")
    private String driverPhone;
    
    private String seats; // JSON string representation
    
    private List<BoardingPointSchedule> boardingPoints;

    @Getter
    @Setter
    public static class BoardingPointSchedule {
        private UUID boardingPointId;
        private String arrivalTime;
    }
}
