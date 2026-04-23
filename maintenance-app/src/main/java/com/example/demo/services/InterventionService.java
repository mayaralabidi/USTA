package com.example.demo.services;

import com.example.demo.dto.InterventionDTO;
import com.example.demo.entities.Intervention;
import com.example.demo.entities.Intervention.StatutIntervention;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.InterventionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InterventionService {
 
    private final InterventionRepository repo;
    private final EquipementService equipementService;
    private final TechnicienService technicienService;
    private final PanneService panneService;
 
    public List<InterventionDTO.Response> findAll() {
        return repo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }
 
    public InterventionDTO.Response findById(Long id) {
        return toResponse(getOrThrow(id));
    }
 
    @Transactional
    public InterventionDTO.Response create(InterventionDTO.Request dto) {
        Intervention i = Intervention.builder()
                .equipement(equipementService.getOrThrow(dto.getEquipementId()))
                .technicien(dto.getTechnicienId() != null ? technicienService.getOrThrow(dto.getTechnicienId()) : null)
                .panne(dto.getPanneId() != null ? panneService.getOrThrow(dto.getPanneId()) : null)
                .statut(dto.getStatut())
                .date(dto.getDate())
                .cout(dto.getCout())
                .notes(dto.getNotes())
                .build();
        return toResponse(repo.save(i));
    }
 
    @Transactional
    public InterventionDTO.Response update(Long id, InterventionDTO.Request dto) {
        Intervention i = getOrThrow(id);
        i.setEquipement(equipementService.getOrThrow(dto.getEquipementId()));
        i.setTechnicien(dto.getTechnicienId() != null ? technicienService.getOrThrow(dto.getTechnicienId()) : null);
        i.setPanne(dto.getPanneId() != null ? panneService.getOrThrow(dto.getPanneId()) : null);
        i.setStatut(dto.getStatut());
        i.setDate(dto.getDate());
        i.setCout(dto.getCout());
        i.setNotes(dto.getNotes());
        return toResponse(repo.save(i));
    }
 
    @Transactional
    public InterventionDTO.Response updateStatut(Long id, StatutIntervention statut) {
        Intervention i = getOrThrow(id);
        i.setStatut(statut);
        return toResponse(repo.save(i));
    }
 
    @Transactional
    public void delete(Long id) {
        getOrThrow(id);
        repo.deleteById(id);
    }
 
    public Intervention getOrThrow(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention introuvable : id=" + id));
    }
 
    private InterventionDTO.Response toResponse(Intervention i) {
        return InterventionDTO.Response.builder()
                .id(i.getId())
                .equipementId(i.getEquipement().getId())
                .equipementNom(i.getEquipement().getNom())
                .technicienId(i.getTechnicien() != null ? i.getTechnicien().getId() : null)
                .technicienNom(i.getTechnicien() != null ? i.getTechnicien().getNom() : null)
                .panneId(i.getPanne() != null ? i.getPanne().getId() : null)
                .statut(i.getStatut())
                .date(i.getDate())
                .cout(i.getCout())
                .notes(i.getNotes())
                .build();
    }
}