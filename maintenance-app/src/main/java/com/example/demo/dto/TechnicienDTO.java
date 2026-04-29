package com.example.demo.dto;
 
import jakarta.validation.constraints.*;
import lombok.*;
 
public class TechnicienDTO {
 
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
 
        @NotBlank(message = "Le nom est obligatoire")
        @Size(min = 2, max = 100)
        private String nom;
 
        @Size(max = 500)
        private String competences;
 
        private boolean disponibilite;
 
        @Email(message = "Format email invalide")
        @Size(max = 150)
        private String email;
    }
 
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String nom;
        private String competences;
        private boolean disponibilite;
        private long interventionsEnCours;
        private String email;  
    }
}