package com.example.demo.entities;

import java.time.LocalDateTime;

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
public class Panne {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
 
    @Column(nullable = false, length = 500)
    private String description;
 
    @Column(nullable = false)
    private String categorie;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipement_id", nullable = false)
    private Equipement equipement;
 
    @Column(name = "date_signalement", nullable = false)
    private LocalDateTime dateSignalement;
 
    @Enumerated(EnumType.STRING)
    private StatutPanne statut;
 
    public enum StatutPanne {
        SIGNALE, EN_COURS, RESOLU, FERME
    }
}