package com.example.demo.entities;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class Technicien {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
 
    @Column(nullable = false)
    private String nom;
 
    @Column(length = 500)
    private String competences;
 
    @Column(nullable = false)
    private boolean disponibilite;
 
    @OneToMany(mappedBy = "technicien")
    private List<Intervention> interventions;
}