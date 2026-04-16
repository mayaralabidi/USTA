package com.example.demo.repositories;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entities.Intervention;
import com.example.demo.entities.Intervention.StatutIntervention;

@Repository
public interface InterventionRepository extends JpaRepository<Intervention, Long> {
    List<Intervention> findByStatut(StatutIntervention statut);
    List<Intervention> findByTechnicienId(Long technicienId);
    List<Intervention> findByEquipementId(Long equipementId);
    List<Intervention> findByDateBetween(LocalDate debut, LocalDate fin);
    long countByStatut(StatutIntervention statut);
 
    @Query("SELECT COALESCE(SUM(i.cout), 0) FROM Intervention i WHERE i.date BETWEEN :debut AND :fin")
    java.math.BigDecimal sumCoutByDateBetween(
        @Param("debut") LocalDate debut,
        @Param("fin") LocalDate fin
    );
 
    @Query("SELECT i.statut, COUNT(i) FROM Intervention i GROUP BY i.statut")
    List<Object[]> countByStatutGrouped();
}