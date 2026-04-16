package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.Equipement;
import com.example.demo.entities.Equipement.EtatEquipement;

@Repository
public interface EquipementRepository extends JpaRepository<Equipement, Long> {
    List<Equipement> findByEtat(EtatEquipement etat);
    boolean existsByNom(String nom);
    long countByEtat(EtatEquipement etat);
}