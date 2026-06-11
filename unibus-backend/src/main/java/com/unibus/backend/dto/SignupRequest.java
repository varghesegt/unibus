package com.unibus.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {
    @NotBlank
    private String rollNo;
    @NotBlank
    private String name;
    @NotBlank
    @Email
    private String email;
    @NotBlank
    private String password;
    @NotBlank
    private String gender;
    @NotBlank
    private String phone;
    @NotBlank
    private String address;
    @NotBlank
    private String dateOfBirth; // format "YYYY-MM-DD"
    @NotBlank
    private String college;
    @NotBlank
    private String degree;
    @NotBlank
    private String department;
    @NotBlank
    private String year;
    @NotBlank
    private String semester;
    
    private String boardingPoint; // Optional at signup or ID string
}
