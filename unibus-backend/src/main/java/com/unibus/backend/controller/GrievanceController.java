package com.unibus.backend.controller;

import com.unibus.backend.dto.GrievanceResponse;
import com.unibus.backend.dto.MessageResponse;
import com.unibus.backend.entity.Grievance;
import com.unibus.backend.entity.User;
import com.unibus.backend.repository.GrievanceRepository;
import com.unibus.backend.repository.UserRepository;
import com.unibus.backend.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class GrievanceController {

    @Autowired
    GrievanceRepository grievanceRepository;

    @Autowired
    UserRepository userRepository;

    @PostMapping("/grievances")
    public ResponseEntity<?> submitGrievance(
            @RequestParam("review") String review,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User is not found."));

        String photoUrl = null;
        if (photo != null && !photo.isEmpty()) {
            String uploadDir = "uploads/grievances/";
            String fileName = UUID.randomUUID() + "_" + photo.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName);
            try {
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, photo.getBytes());
                photoUrl = "/uploads/grievances/" + fileName;
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body(new MessageResponse("Error saving photo."));
            }
        }

        Grievance grievance = Grievance.builder()
                .userId(user.getId())
                .review(review)
                .photoProofUrl(photoUrl)
                .build();

        grievanceRepository.save(grievance);

        return ResponseEntity.ok(new MessageResponse("Grievance submitted successfully."));
    }

    @GetMapping("/admin/grievances")
    // @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<GrievanceResponse>> getAllGrievances() {
        List<Grievance> grievances = grievanceRepository.findAllByOrderByCreatedAtDesc();
        List<GrievanceResponse> response = new ArrayList<>();
        
        for (Grievance g : grievances) {
            User u = userRepository.findById(g.getUserId()).orElse(null);
            response.add(new GrievanceResponse(g, u));
        }

        return ResponseEntity.ok(response);
    }
}
