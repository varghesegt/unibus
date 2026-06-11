package com.unibus.backend.controller;

import com.unibus.backend.entity.Bus;
import com.unibus.backend.entity.BusModel;
import com.unibus.backend.repository.BusModelRepository;
import com.unibus.backend.repository.BusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import com.unibus.backend.entity.BusBoardingPoint;
import com.unibus.backend.repository.BusBoardingPointRepository;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/bus")
public class BusController {

    @Autowired
    BusRepository busRepository;

    @Autowired
    BusModelRepository busModelRepository;

    @Autowired
    com.unibus.backend.repository.BoardingPointRepository boardingPointRepository;

    @Autowired
    BusBoardingPointRepository busBoardingPointRepository;

    @GetMapping("/debugBbp")
    public ResponseEntity<List<BusBoardingPoint>> getDebugBbp() {
        return ResponseEntity.ok(busBoardingPointRepository.findAll());
    }

    @GetMapping("/boardingPoints")
    public ResponseEntity<List<com.unibus.backend.entity.BoardingPoint>> getBoardingPoints() {
        return ResponseEntity.ok(boardingPointRepository.findAll());
    }

    @GetMapping("/byBoardingPoint/{boardingPointId}")
    public ResponseEntity<List<Bus>> getBusesByBoardingPoint(@PathVariable UUID boardingPointId) {
        List<Bus> buses = busRepository.findByBoardingPointId(boardingPointId);
        return ResponseEntity.ok(buses);
    }

    @GetMapping("/{busId}")
    public ResponseEntity<?> getBusDetails(@PathVariable UUID busId) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new RuntimeException("Bus not found"));
        BusModel model = busModelRepository.findById(bus.getModelId())
                .orElseThrow(() -> new RuntimeException("Model not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("bus", bus);
        response.put("model", model);

        return ResponseEntity.ok(response);
    }
}
