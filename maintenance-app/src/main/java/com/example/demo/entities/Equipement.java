package com.example.demo.entities;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class Equipement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
 
    @Column(nullable = false)
    private String nom;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EtatEquipement etat;
 
    @Column(name = "date_acquisition")
    private LocalDate dateAcquisition;
 
    @OneToMany(mappedBy = "equipement", cascade = CascadeType.ALL)
    private List<Panne> pannes;
 
    @OneToMany(mappedBy = "equipement", cascade = CascadeType.ALL)
    private List<Intervention> interventions;
 
    public enum EtatEquipement {
        OPERATIONNEL, EN_PANNE, EN_MAINTENANCE, HORS_SERVICE
    }

}