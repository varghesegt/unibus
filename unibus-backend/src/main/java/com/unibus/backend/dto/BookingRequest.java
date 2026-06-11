package com.unibus.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
public class BookingRequest {
    private UUID busId;
    private String seatId;
}
