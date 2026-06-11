package com.unibus.backend.controller;

import com.unibus.backend.dto.BusRequest;
import com.unibus.backend.dto.MessageResponse;
import com.unibus.backend.entity.BoardingPoint;
import com.unibus.backend.entity.Bus;
import com.unibus.backend.entity.BusBoardingPoint;
import com.unibus.backend.entity.BusModel;
import com.unibus.backend.repository.BoardingPointRepository;
import com.unibus.backend.repository.BusBoardingPointRepository;
import com.unibus.backend.repository.BusModelRepository;
import com.unibus.backend.repository.BusRepository;
import com.unibus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.time.LocalTime;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    BoardingPointRepository boardingPointRepository;

    @Autowired
    BusModelRepository busModelRepository;

    @Autowired
    BusRepository busRepository;

    @Autowired
    BusBoardingPointRepository busBoardingPointRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Autowired
    org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @PostMapping("/addBoardingPoint")
    public ResponseEntity<?> addBoardingPoint(@Valid @RequestBody BoardingPoint request) {
        boardingPointRepository.save(request);
        return ResponseEntity.ok(new MessageResponse("Boarding Point added successfully"));
    }

    @GetMapping("/boardingPoints")
    public ResponseEntity<List<BoardingPoint>> getBoardingPoints() {
        return ResponseEntity.ok(boardingPointRepository.findAll());
    }

    @PostMapping("/addModel")
    public ResponseEntity<?> addModel(@Valid @RequestBody BusModel request) {
        java.util.Optional<BusModel> existing = busModelRepository.findByModelName(request.getModelName());
        if (existing.isPresent()) {
            BusModel existingModel = existing.get();
            existingModel.setData(request.getData());
            busModelRepository.save(existingModel);
            return ResponseEntity.ok(new MessageResponse("Bus Model updated successfully"));
        } else {
            busModelRepository.save(request);
            return ResponseEntity.ok(new MessageResponse("Bus Model added successfully"));
        }
    }

    @GetMapping("/models")
    public ResponseEntity<List<BusModel>> getModels() {
        return ResponseEntity.ok(busModelRepository.findAll());
    }

    @DeleteMapping("/deleteModel/{id}")
    public ResponseEntity<?> deleteModel(@PathVariable java.util.UUID id) {
        try {
            if (busRepository.existsByModelId(id)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Cannot delete model as it is currently assigned to one or more buses."));
            }
            busModelRepository.deleteById(id);
            return ResponseEntity.ok(new MessageResponse("Bus Model deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error deleting model: " + e.getMessage()));
        }
    }

    @PostMapping("/addBus")
    public ResponseEntity<?> addBus(@Valid @RequestBody BusRequest request) {
        String seatsData = request.getSeats();
        if (seatsData == null || seatsData.trim().isEmpty()) {
            BusModel model = busModelRepository.findById(request.getModelId())
                    .orElseThrow(() -> new RuntimeException("Model not found"));
            try {
                java.util.Map<String, String> seatsMap = new java.util.HashMap<>();
                java.util.Queue<com.fasterxml.jackson.databind.JsonNode> queue = new java.util.LinkedList<>();
                queue.add(objectMapper.readTree(model.getData()));
                while (!queue.isEmpty()) {
                    com.fasterxml.jackson.databind.JsonNode node = queue.poll();
                    if (node.isObject()) {
                        if (node.has("id") && node.get("id").isTextual()) {
                            String status = "available";
                            if (node.has("seatStatus") && node.get("seatStatus").isTextual()) {
                                String sStatus = node.get("seatStatus").asText();
                                if ("unavailable".equals(sStatus) || "deleted".equals(sStatus)) {
                                    status = "unavailable";
                                }
                            }
                            seatsMap.put(node.get("id").asText(), status);
                        }
                        node.fields().forEachRemaining(entry -> queue.add(entry.getValue()));
                    } else if (node.isArray()) {
                        node.forEach(queue::add);
                    }
                }
                seatsData = objectMapper.writeValueAsString(seatsMap);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error parsing model seats layout: " + e.getMessage()));
            }
        }

        // Check if bus with this number already exists
        java.util.Optional<Bus> existingBus = busRepository.findByBusNumber(request.getBusNumber());
        if (existingBus.isPresent()) {
            Bus bus = existingBus.get();
            bus.setModelId(request.getModelId());
            bus.setRouteName(request.getRouteName());
            bus.setDriverName(request.getDriverName());
            bus.setDriverPhone(request.getDriverPhone());
            bus.setSeats(seatsData);
            Bus savedBus = busRepository.save(bus);

            // Update boarding points
            busBoardingPointRepository.deleteAll(busBoardingPointRepository.findByBusId(savedBus.getId()));
            if (request.getBoardingPoints() != null) {
                for (BusRequest.BoardingPointSchedule schedule : request.getBoardingPoints()) {
                    BusBoardingPoint bbp = BusBoardingPoint.builder()
                            .busId(savedBus.getId())
                            .boardingPointId(schedule.getBoardingPointId())
                            .arrivalTime(LocalTime.parse(schedule.getArrivalTime()))
                            .build();
                    busBoardingPointRepository.save(bbp);
                }
            }

            return ResponseEntity.ok(new MessageResponse("Bus updated successfully"));
        }

        Bus bus = Bus.builder()
                .modelId(request.getModelId())
                .busNumber(request.getBusNumber())
                .routeName(request.getRouteName())
                .driverName(request.getDriverName())
                .driverPhone(request.getDriverPhone())
                .seats(seatsData)
                .build();

        Bus savedBus = busRepository.save(bus);

        if (request.getBoardingPoints() != null) {
            for (BusRequest.BoardingPointSchedule schedule : request.getBoardingPoints()) {
                BusBoardingPoint bbp = BusBoardingPoint.builder()
                        .busId(savedBus.getId())
                        .boardingPointId(schedule.getBoardingPointId())
                        .arrivalTime(LocalTime.parse(schedule.getArrivalTime()))
                        .build();
                busBoardingPointRepository.save(bbp);
            }
        }

        return ResponseEntity.ok(new MessageResponse("Bus added successfully"));
    }

    @GetMapping("/buses")
    public ResponseEntity<List<com.unibus.backend.dto.BusResponse>> getBuses() {
        List<Bus> buses = busRepository.findAll();
        List<com.unibus.backend.dto.BusResponse> response = new java.util.ArrayList<>();
        for (Bus bus : buses) {
            List<BusBoardingPoint> bbps = busBoardingPointRepository.findByBusId(bus.getId());
            response.add(new com.unibus.backend.dto.BusResponse(bus, bbps));
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/buses/{busId}")
    public ResponseEntity<?> deleteBus(@PathVariable java.util.UUID busId) {
        busBoardingPointRepository.deleteAll(busBoardingPointRepository.findByBusId(busId));
        busRepository.deleteById(busId);
        return ResponseEntity.ok(new MessageResponse("Bus deleted successfully"));
    }

    @GetMapping("/users")
    public ResponseEntity<List<com.unibus.backend.entity.User>> getUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        long totalBuses = busRepository.count();
        long activeRoutes = boardingPointRepository.count();
        long busModels = busModelRepository.count();
        long totalPassengers = userRepository.count();
        
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalBuses", totalBuses);
        stats.put("activeRoutes", activeRoutes);
        stats.put("totalPassengers", totalPassengers);
        stats.put("todayBookings", 0); // Placeholder
        stats.put("busModels", busModels);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("stats", stats);
        response.put("recentActivities", new java.util.ArrayList<>());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/blockStaffSeat")
    public ResponseEntity<?> blockStaffSeat(@RequestParam("busId") java.util.UUID busId,
                                            @RequestParam("seatId") String seatId,
                                            @RequestParam("status") String status) {
        try {
            Bus bus = busRepository.findById(busId).orElseThrow(() -> new RuntimeException("Bus not found"));
            java.util.Map<String, String> seatsMap = objectMapper.readValue(bus.getSeats(), new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, String>>() {});
            seatsMap.put(seatId, status); 
            bus.setSeats(objectMapper.writeValueAsString(seatsMap));
            busRepository.save(bus);
            
            // Broadcast WebSocket update
            messagingTemplate.convertAndSend("/topic/bus/" + busId, "UPDATE");
            
            return ResponseEntity.ok(new MessageResponse("Staff seat blocked successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error blocking staff seat: " + e.getMessage()));
        }
    }
}
