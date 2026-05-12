package com.example.demo.dto;

import com.example.demo.entities.Utilisateur;
import lombok.Builder;
import lombok.Data;

public class AuthDTO {

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class RegisterRequest {
        private String username;
        private String password;
        private Utilisateur.Role role;
    }

    @Builder
    @Data
    public static class AuthResponse {
        private String token;
        private String username;
        private String role;
    }
}