package com.unibus.backend.controller;

import com.unibus.backend.dto.JwtResponse;
import com.unibus.backend.dto.LoginRequest;
import com.unibus.backend.dto.MessageResponse;
import com.unibus.backend.dto.SignupRequest;
import com.unibus.backend.entity.User;
import com.unibus.backend.repository.UserRepository;
import com.unibus.backend.security.JwtUtils;
import com.unibus.backend.security.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getUser().getId().toString(),
                userDetails.getUsername(),
                userDetails.getUser().getName(),
                userDetails.getUser().getIsAdmin()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        if (userRepository.findByRollNo(signUpRequest.getRollNo()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Roll Number is already taken!"));
        }

        // Create new user's account
        User user = User.builder()
                .rollNo(signUpRequest.getRollNo())
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .gender(signUpRequest.getGender())
                .phone(signUpRequest.getPhone())
                .address(signUpRequest.getAddress())
                .dateOfBirth(LocalDate.parse(signUpRequest.getDateOfBirth()))
                .college(signUpRequest.getCollege())
                .degree(signUpRequest.getDegree())
                .department(signUpRequest.getDepartment())
                .year(signUpRequest.getYear())
                .semester(signUpRequest.getSemester())
                .isVerified(false)
                .isAdmin(false)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
