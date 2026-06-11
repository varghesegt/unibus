
package com.unibus.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.unibus.backend.dto.MessageResponse;
import com.unibus.backend.entity.Bus;
import com.unibus.backend.entity.Seat;
import com.unibus.backend.entity.User;
import com.unibus.backend.repository.UserRepository;
import com.unibus.backend.security.UserDetailsImpl;
import com.unibus.backend.repository.BusRepository;
import com.unibus.backend.repository.SeatRepository;
import com.unibus.backend.service.ReceiptParserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/booking")
public class BookingController {

    @Autowired
    BusRepository busRepository;

    @Autowired
    SeatRepository seatRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    ReceiptParserService receiptParserService;

    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private static final Pattern SEAT_PATTERN = Pattern.compile("([A-Z])([A-Z])(\\d+)");

    @PostMapping("/bookSeat")
    @Transactional
    public ResponseEntity<?> bookSeat(@RequestParam("busId") UUID busId,
                                      @RequestParam("seatId") String seatId,
                                      @RequestParam(value = "receipt", required = false) MultipartFile receipt) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User is not found."));

        // RULE 1: Semester Lock (Max 1 seat per user)
        List<Seat> existingSeats = seatRepository.findByUserId(user.getId());
        if (!existingSeats.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: You have already booked a seat for this semester. Seat changes are not permitted."));
        }

        String receiptUrl = null;
        if (receipt != null && !receipt.isEmpty()) {
            // Save receipt to local disk
            String uploadDir = "uploads/receipts/";
            String fileName = UUID.randomUUID() + "_" + receipt.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName);
            try {
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, receipt.getBytes());
                receiptUrl = "/uploads/receipts/" + fileName;
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body(new MessageResponse("Error saving receipt file."));
            }
        }

        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new RuntimeException("Error: Bus is not found."));

        try {
            Map<String, String> seatsMap = objectMapper.readValue(bus.getSeats(), new TypeReference<Map<String, String>>() {});
            String currentStatus = seatsMap.getOrDefault(seatId, "unavailable");

            if (!currentStatus.equals("available")) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Seat is already booked or unavailable!"));
            }

            // Extract Row and Side from the requested seatId (e.g. LA1 -> Side L, Row A, Col 1)
            Matcher matcher = SEAT_PATTERN.matcher(seatId);
            if (!matcher.matches()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid seat format."));
            }
            String side = matcher.group(1);
            String rowLetter = matcher.group(2);
            int colIndex = Integer.parseInt(matcher.group(3));

            // RULE 2: Gender Zones (Females <= middle, Males > middle)
            int maxRow = 1;
            for (String sId : seatsMap.keySet()) {
                Matcher m = SEAT_PATTERN.matcher(sId);
                if (m.matches()) {
                    String sSide = m.group(1);
                    if (!sSide.equals("B")) {
                        maxRow = Math.max(maxRow, m.group(2).charAt(0) - 'A' + 1);
                    }
                }
            }
            int middleRow = (int) Math.ceil(maxRow / 2.0);
            
            int targetRow;
            if (side.equals("B")) {
                targetRow = maxRow + 1;
            } else {
                targetRow = rowLetter.charAt(0) - 'A' + 1;
            }

            boolean isFemale = "Female".equalsIgnoreCase(user.getGender());
            if (isFemale && targetRow > middleRow) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Female seating is strictly restricted to the front half of the bus."));
            } else if (!isFemale && targetRow <= middleRow) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Male seating is strictly restricted to the back half of the bus."));
            }

            // RULE 3: Adjacent Seats Constraint (No Boy/Girl together)
            // Look for adjacent seats in the same row and side
            String targetGenderStatus = isFemale ? "bookedFemale" : "bookedMale";
            String oppositeGenderStatus = isFemale ? "bookedMale" : "bookedFemale";
            
            // Check adjacent seats (1, 2, 3 etc)
            String[] potentialAdjacents = {
                side + rowLetter + (colIndex - 1),
                side + rowLetter + (colIndex + 1)
            };

            for (String adj : potentialAdjacents) {
                if (seatsMap.containsKey(adj)) {
                    String adjStatus = seatsMap.get(adj);
                    if (adjStatus.equalsIgnoreCase(oppositeGenderStatus)) {
                        return ResponseEntity.badRequest().body(new MessageResponse("Error: Adjacent seat is occupied by a different gender. Strict segregation rules apply."));
                    }
                }
            }

            // Determine new status
            String newStatus = isFemale ? "bookedFemale" : "bookedMale";

            // Update JSON map
            seatsMap.put(seatId, newStatus);
            bus.setSeats(objectMapper.writeValueAsString(seatsMap));
            busRepository.saveAndFlush(bus);

            Seat seat = Seat.builder()
                    .userId(user.getId())
                    .busId(busId)
                    .seatId(seatId)
                    .status(newStatus)
                    .approvalStatus("APPROVED")
                    .receiptUrl(receiptUrl)
                    .build();
            seatRepository.saveAndFlush(seat);

            // Broadcast WebSocket update
            messagingTemplate.convertAndSend("/topic/bus/" + busId, "UPDATE");

            return ResponseEntity.ok(new MessageResponse("Seat request submitted! Waiting for Admin approval."));

        } catch (ObjectOptimisticLockingFailureException e) {
            return ResponseEntity.status(409).body(new MessageResponse("Error: Race condition detected. The seat was just booked or modified by someone else. Please try again."));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Error processing booking: " + e.getMessage()));
        }
    }

    @GetMapping("/mySeat")
    public ResponseEntity<?> getMySeat() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User is not found."));

        List<Seat> existingSeats = seatRepository.findByUserId(user.getId());
        if (existingSeats.isEmpty()) {
            return ResponseEntity.ok().build(); 
        }

        Seat mySeat = existingSeats.get(0);
        Bus bus = busRepository.findById(mySeat.getBusId()).orElse(null);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("seat", mySeat);
        response.put("bus", bus);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/cancelSeat")
    @Transactional
    public ResponseEntity<?> cancelSeat() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User is not found."));

        List<Seat> existingSeats = seatRepository.findByUserId(user.getId());
        if (existingSeats.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: You do not have an active booking."));
        }

        Seat mySeat = existingSeats.get(0);
        Bus bus = busRepository.findById(mySeat.getBusId()).orElse(null);

        if (bus != null) {
            try {
                Map<String, String> seatsMap = objectMapper.readValue(bus.getSeats(), new TypeReference<Map<String, String>>() {});
                seatsMap.put(mySeat.getSeatId(), "available");
                bus.setSeats(objectMapper.writeValueAsString(seatsMap));
                busRepository.save(bus);
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body(new MessageResponse("Error freeing seat: " + e.getMessage()));
            }
        }

        seatRepository.delete(mySeat);

        // Broadcast WebSocket update
        if (bus != null) {
            messagingTemplate.convertAndSend("/topic/bus/" + bus.getId(), "UPDATE");
        }

        return ResponseEntity.ok(new MessageResponse("Booking cancelled successfully!"));
    }
}
