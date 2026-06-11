package com.unibus.backend.controller;

import com.unibus.backend.dto.MessageResponse;
import com.unibus.backend.entity.Circular;
import com.unibus.backend.repository.CircularRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class CircularController {

    @Autowired
    CircularRepository circularRepository;

    // Public to authenticated users (students and admins)
    @GetMapping("/circulars")
    public ResponseEntity<List<Circular>> getAllCirculars() {
        return ResponseEntity.ok(circularRepository.findAllByOrderByCreatedAtDesc());
    }

    // Admin only endpoints
    @PostMapping("/admin/circulars")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCircular(
            @RequestParam("title") String title,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "attachment", required = false) MultipartFile attachment) {

        String attachmentUrl = null;

        if (attachment != null && !attachment.isEmpty()) {
            String uploadDir = "uploads/circulars/";
            String fileName = UUID.randomUUID() + "_" + attachment.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName);
            try {
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, attachment.getBytes());
                attachmentUrl = "/uploads/circulars/" + fileName;
            } catch (IOException e) {
                return ResponseEntity.internalServerError().body(new MessageResponse("Error saving attachment."));
            }
        }

        Circular circular = Circular.builder()
                .title(title)
                .content(content)
                .attachmentUrl(attachmentUrl)
                .build();

        circularRepository.save(circular);

        return ResponseEntity.ok(new MessageResponse("Circular posted successfully."));
    }

    @DeleteMapping("/admin/circulars/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCircular(@PathVariable Long id) {
        if (!circularRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Circular not found."));
        }
        circularRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Circular deleted successfully."));
    }
}
