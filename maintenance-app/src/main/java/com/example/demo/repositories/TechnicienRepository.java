package com.example.demo.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.Technicien;

@Repository
public interface TechnicienRepository extends JpaRepository<Technicien, Long> {
    List<Technicien> findByDisponibiliteTrue();
    long countByDisponibiliteTrue();
    Optional<Technicien> findByNom(String nom);
}