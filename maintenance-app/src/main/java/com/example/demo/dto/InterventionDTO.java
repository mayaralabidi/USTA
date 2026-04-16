package com.example.demo.dto;
 
import com.example.demo.entities.Intervention.StatutIntervention;
import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
 
public class InterventionDTO {
 
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        @NotNull(message = "L'équipement est obligatoire")
        private Long equipementId;
 
        private Long technicienId;
        private Long panneId;
 
        @NotNull(message = "Le statut est obligatoire")
        private StatutIntervention statut;
 
        @NotNull(message = "La date est obligatoire")
        private LocalDate date;
 
        @DecimalMin(value = "0.0", message = "Le coût doit être positif")
        private BigDecimal cout;
 
        @Size(max = 1000)
        private String notes;
    }
 
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private Long equipementId;
        private String equipementNom;
        private Long technicienId;
        private String technicienNom;
        private Long panneId;
        private StatutIntervention statut;
        private LocalDate date;
        private BigDecimal cout;
        private String notes;
    }
 
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StatutUpdate {
        @NotNull(message = "Le statut est obligatoire")
        private StatutIntervention statut;
    }
}