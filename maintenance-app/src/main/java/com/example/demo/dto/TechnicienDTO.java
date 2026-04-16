package com.example.demo.dto;
 
import jakarta.validation.constraints.*;
import lombok.*;
 
public class TechnicienDTO {
 
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        @NotBlank(message = "Le nom est obligatoire")
        @Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caractères")
        private String nom;
 
        @Size(max = 500)
        private String competences;
 
        private boolean disponible;
    }
 
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String nom;
        private String competences;
        private boolean disponible;
        private long interventionsEnCours;
    }
}
 