package com.unibus.backend.dto;

import com.unibus.backend.entity.Bus;
import com.unibus.backend.entity.BusBoardingPoint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusResponse {
    private Bus bus;
    private List<BusBoardingPoint> boardingPoints;
}
