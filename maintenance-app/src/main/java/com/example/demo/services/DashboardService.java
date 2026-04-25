package com.example.demo.services;

import com.example.demo.dto.DashboardDTO;
import com.example.demo.entities.Intervention.StatutIntervention;
import com.example.demo.entities.Panne.StatutPanne;
import com.example.demo.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;
 
@Service
@RequiredArgsConstructor
public class DashboardService {
 
    private final PanneRepository panneRepo;
    private final InterventionRepository interventionRepo;
    private final TechnicienRepository technicienRepo;
 
    public DashboardDTO getStats() {
        LocalDate debut = LocalDate.now().withDayOfMonth(1);
        LocalDate fin   = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
 
        Map<String, Long> pannesParCategorie = new LinkedHashMap<>();
        panneRepo.countByCategorie()
                .forEach(row -> pannesParCategorie.put((String) row[0], (Long) row[1]));
 
        Map<String, Long> interventionsParStatut = new LinkedHashMap<>();
        interventionRepo.countByStatutGrouped()
                .forEach(row -> interventionsParStatut.put(row[0].toString(), (Long) row[1]));
 
        return DashboardDTO.builder()
                .totalPannes(panneRepo.count())
                .pannesEnCours(panneRepo.countByStatut(StatutPanne.EN_COURS))
                .pannesResolues(panneRepo.countByStatut(StatutPanne.RESOLU))
                .interventionsPlanifiees(interventionRepo.countByStatut(StatutIntervention.PLANIFIEE))
                .interventionsEnCours(interventionRepo.countByStatut(StatutIntervention.EN_COURS))
                .interventionsTerminees(interventionRepo.countByStatut(StatutIntervention.TERMINEE))
                .techniciensDispo(technicienRepo.countByDisponibiliteTrue())
                .coutTotalMois(interventionRepo.sumCoutByDateBetween(debut, fin))
                .pannesParCategorie(pannesParCategorie)
                .interventionsParStatut(interventionsParStatut)
                .build();
    }
}