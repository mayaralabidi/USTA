package com.example.demo.services;
 
import com.example.demo.dto.EquipementDTO;
import com.example.demo.entities.Equipement;
import com.example.demo.entities.Panne;
import com.example.demo.exceptions.BusinessRuleException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.EquipementRepository;
import com.example.demo.repositories.PanneRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EquipementService {
 
    private final EquipementRepository repo;
    private final PanneRepository panneRepo;
 
    public List<EquipementDTO.Response> findAll() {
        return repo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }
 
    public EquipementDTO.Response findById(Long id) {
        return toResponse(getOrThrow(id));
    }
 
    @Transactional
    public EquipementDTO.Response create(EquipementDTO.Request dto) {
        Equipement e = Equipement.builder()
                .nom(dto.getNom())
                .etat(dto.getEtat())
                .dateAcquisition(dto.getDateAcquisition())
                .localisation(dto.getLocalisation()) 
                .build();
        return toResponse(repo.save(e));
    }
 
    @Transactional
    public EquipementDTO.Response update(Long id, EquipementDTO.Request dto) {
        Equipement e = getOrThrow(id);
        e.setNom(dto.getNom());
        e.setEtat(dto.getEtat());
        e.setDateAcquisition(dto.getDateAcquisition());
        e.setLocalisation(dto.getLocalisation()); 
        return toResponse(repo.save(e));
    }
 
    @Transactional
    public void delete(Long id) {
        Equipement e = getOrThrow(id);
     
        // Check for active pannes (SIGNALE or EN_COURS)
        long activePannes = panneRepo.countByEquipementIdAndStatutIn(
                id,
                List.of(Panne.StatutPanne.SIGNALE, Panne.StatutPanne.EN_COURS));
     
        if (activePannes > 0) {
            throw new BusinessRuleException(
                "Impossible de supprimer l'équipement '" + e.getNom() + "' : " +
                "il possède " + activePannes + " panne(s) active(s). Résolvez-les d'abord.");
        }
     
        repo.deleteById(id);
    }
 
    public Equipement getOrThrow(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Équipement introuvable : id=" + id));
    }
 
    private EquipementDTO.Response toResponse(Equipement e) {
        return EquipementDTO.Response.builder()
                .id(e.getId())
                .nom(e.getNom())
                .etat(e.getEtat())
                .dateAcquisition(e.getDateAcquisition())
                .nombrePannes(e.getPannes() != null ? e.getPannes().size() : 0)
                .nombreInterventions(e.getInterventions() != null ? e.getInterventions().size() : 0)
                .localisation(e.getLocalisation())
                .build();
    }
}