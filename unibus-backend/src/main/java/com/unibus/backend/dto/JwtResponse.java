package com.unibus.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String id;
    private String email;
    private String name;
    private boolean isAdmin;

    public JwtResponse(String token, String id, String email, String name, boolean isAdmin) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.name = name;
        this.isAdmin = isAdmin;
    }
}
