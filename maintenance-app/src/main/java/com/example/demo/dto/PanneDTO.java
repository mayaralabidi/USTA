package com.example.demo.dto;

import com.example.demo.entities.Panne.StatutPanne;
import com.example.demo.entities.Panne.PrioritePanne;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

public class PanneDTO {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {

        @NotBlank(message = "La description est obligatoire")
        @Size(min = 10, max = 500, message = "La description doit contenir entre 10 et 500 caractères")
        private String description;

        @NotBlank(message = "La catégorie est obligatoire")
        private String categorie;

        @NotNull(message = "L'équipement est obligatoire")
        private Long equipementId;

        private StatutPanne statut;

        private PrioritePanne priorite;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String description;
        private String categorie;
        private Long equipementId;
        private String equipementNom;
        private LocalDateTime dateSignalement;
        private StatutPanne statut;
        private PrioritePanne priorite;  
    }
}