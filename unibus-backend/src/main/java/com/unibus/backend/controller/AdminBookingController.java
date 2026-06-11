package com.unibus.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.unibus.backend.dto.MessageResponse;
import com.unibus.backend.entity.Bus;
import com.unibus.backend.entity.Seat;
import com.unibus.backend.entity.User;
import com.unibus.backend.repository.BusRepository;
import com.unibus.backend.repository.SeatRepository;
import com.unibus.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/bookings")
// @PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    @Autowired
    SeatRepository seatRepository;

    @Autowired
    BusRepository busRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingBookings() {
        List<Seat> pendingSeats = seatRepository.findAll().stream()
                .filter(s -> "PENDING".equals(s.getApprovalStatus()))
                .toList();

        List<Map<String, Object>> response = new ArrayList<>();
        for (Seat seat : pendingSeats) {
            Map<String, Object> map = new HashMap<>();
            map.put("seat", seat);
            userRepository.findById(seat.getUserId()).ifPresent(user -> map.put("user", user));
            busRepository.findById(seat.getBusId()).ifPresent(bus -> map.put("bus", bus));
            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{seatId}/approve")
    @Transactional
    public ResponseEntity<?> approveBooking(@PathVariable Long seatId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        if (!"PENDING".equals(seat.getApprovalStatus())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Booking is not pending"));
        }

        seat.setApprovalStatus("APPROVED");
        seatRepository.saveAndFlush(seat);

        Bus bus = busRepository.findById(seat.getBusId())
                .orElseThrow(() -> new RuntimeException("Bus not found"));

        try {
            Map<String, String> seatsMap = objectMapper.readValue(bus.getSeats(), new TypeReference<Map<String, String>>() {});
            seatsMap.put(seat.getSeatId(), seat.getStatus()); // set to bookedMale / bookedFemale
            bus.setSeats(objectMapper.writeValueAsString(seatsMap));
            busRepository.saveAndFlush(bus);
            
            messagingTemplate.convertAndSend("/topic/bus/" + bus.getId(), "UPDATE");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Error updating bus JSON"));
        }

        return ResponseEntity.ok(new MessageResponse("Booking approved successfully"));
    }

    @PostMapping("/{seatId}/reject")
    @Transactional
    public ResponseEntity<?> rejectBooking(@PathVariable Long seatId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new RuntimeException("Seat not found"));

        if (!"PENDING".equals(seat.getApprovalStatus())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Booking is not pending"));
        }

        seat.setApprovalStatus("REJECTED");
        
        Bus bus = busRepository.findById(seat.getBusId())
                .orElseThrow(() -> new RuntimeException("Bus not found"));

        try {
            Map<String, String> seatsMap = objectMapper.readValue(bus.getSeats(), new TypeReference<Map<String, String>>() {});
            seatsMap.put(seat.getSeatId(), "available");
            bus.setSeats(objectMapper.writeValueAsString(seatsMap));
            busRepository.saveAndFlush(bus);
            
            messagingTemplate.convertAndSend("/topic/bus/" + bus.getId(), "UPDATE");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Error updating bus JSON"));
        }

        seatRepository.delete(seat); // Or keep it as rejected history

        return ResponseEntity.ok(new MessageResponse("Booking rejected successfully"));
    }
}
