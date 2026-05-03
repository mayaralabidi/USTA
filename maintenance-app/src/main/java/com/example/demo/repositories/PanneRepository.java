package com.example.demo.repositories;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.example.demo.entities.Panne;
import com.example.demo.entities.Panne.StatutPanne;

@Repository
public interface PanneRepository extends JpaRepository<Panne, Long> {
    List<Panne> findByStatut(StatutPanne statut);
    List<Panne> findByEquipementId(Long equipementId);
    List<Panne> findByEquipementIdAndStatutIn(Long equipementId, List<StatutPanne> statuts);
    long countByStatut(StatutPanne statut);
    long countByEquipementIdAndStatutIn(Long equipementId, List<StatutPanne> statuts); 

    @Query("SELECT p.categorie, COUNT(p) FROM Panne p GROUP BY p.categorie")
    List<Object[]> countByCategorie();
}