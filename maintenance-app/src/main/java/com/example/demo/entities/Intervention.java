package com.example.demo.entities;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import com.example.demo.entities.Equipement.EtatEquipement;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Intervention {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipement_id", nullable = false)
    private Equipement equipement;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technicien_id")
    private Technicien technicien;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "panne_id")
    private Panne panne;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutIntervention statut;
 
    @Column(nullable = false)
    private LocalDate date;
 
    @Column(precision = 10, scale = 2)
    private BigDecimal cout;
 
    @Column(length = 1000)
    private String notes;
 
    public enum StatutIntervention {
        PLANIFIEE, EN_COURS, TERMINEE, ANNULEE
    }
}