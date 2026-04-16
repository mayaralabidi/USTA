package com.example.demo.dto;
 
import com.example.demo.entities.Equipement.EtatEquipement;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
 
public class EquipementDTO {
 
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        @NotBlank(message = "Le nom est obligatoire")
        @Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caractères")
        private String nom;
 
        @NotNull(message = "L'état est obligatoire")
        private EtatEquipement etat;
 
        private LocalDate dateAcquisition;
    }
 
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String nom;
        private EtatEquipement etat;
        private LocalDate dateAcquisition;
        private long nombrePannes;
        private long nombreInterventions;
    }
}
 