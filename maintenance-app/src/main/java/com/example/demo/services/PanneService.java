package com.example.demo.services;

import com.example.demo.dto.PanneDTO;
import com.example.demo.entities.Equipement;
import com.example.demo.entities.Equipement.EtatEquipement;
import com.example.demo.entities.Panne;
import com.example.demo.entities.Panne.PrioritePanne;
import com.example.demo.entities.Panne.StatutPanne;
import com.example.demo.exceptions.BusinessRuleException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.EquipementRepository;
import com.example.demo.repositories.PanneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PanneService {

    private final PanneRepository repo;
    private final EquipementRepository equipementRepo;

    public List<PanneDTO.Response> findAll() {
        return repo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public PanneDTO.Response findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public List<PanneDTO.Response> findByEquipement(Long equipementId) {
        return repo.findByEquipementId(equipementId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public PanneDTO.Response create(PanneDTO.Request dto) {
        Equipement equipement = equipementRepo.findById(dto.getEquipementId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipement", dto.getEquipementId()));

        if (equipement.getEtat() == EtatEquipement.HORS_SERVICE) {
            throw new BusinessRuleException(
                "Impossible de signaler une panne : l'equipement '"
                + equipement.getNom() + "' est hors service.");
        }

        Panne p = Panne.builder()
                .description(dto.getDescription())
                .categorie(dto.getCategorie())
                .equipement(equipement)
                .dateSignalement(LocalDateTime.now())
                .statut(dto.getStatut() != null ? dto.getStatut() : StatutPanne.SIGNALE)
                .priorite(dto.getPriorite() != null ? dto.getPriorite() : PrioritePanne.MOYENNE)
                .build();

        Panne saved = repo.save(p);

        if (equipement.getEtat() == EtatEquipement.OPERATIONNEL) {
            equipement.setEtat(EtatEquipement.EN_PANNE);
            equipementRepo.save(equipement);
        }

        return toResponse(saved);
    }

    @Transactional
    public PanneDTO.Response update(Long id, PanneDTO.Request dto) {
        Panne p = getOrThrow(id);

        if (p.getStatut() == StatutPanne.FERME) {
            throw new BusinessRuleException("Impossible de modifier une panne fermee.");
        }

        StatutPanne ancienStatut = p.getStatut();

        p.setDescription(dto.getDescription());
        p.setCategorie(dto.getCategorie());
        if (dto.getStatut() != null) p.setStatut(dto.getStatut());
        if (dto.getPriorite() != null) p.setPriorite(dto.getPriorite());

        Panne saved = repo.save(p);

        if (dto.getStatut() == StatutPanne.RESOLU && ancienStatut != StatutPanne.RESOLU) {
            syncEquipementEtat(p.getEquipement());
        }

        return toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        Panne p = getOrThrow(id);
        if (p.getStatut() == StatutPanne.EN_COURS) {
            throw new BusinessRuleException("Impossible de supprimer une panne en cours.");
        }
        repo.delete(p);
    }

    public Panne getOrThrow(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Panne introuvable : id=" + id));
    }

    private void syncEquipementEtat(Equipement equipement) {
        long activePannes = repo.countByEquipementIdAndStatutIn(
                equipement.getId(),
                List.of(StatutPanne.SIGNALE, StatutPanne.EN_COURS));

        if (activePannes == 0 && equipement.getEtat() == EtatEquipement.EN_PANNE) {
            equipement.setEtat(EtatEquipement.OPERATIONNEL);
            equipementRepo.save(equipement);
        }
    }

    private PanneDTO.Response toResponse(Panne p) {
        return PanneDTO.Response.builder()
                .id(p.getId())
                .description(p.getDescription())
                .categorie(p.getCategorie())
                .equipementId(p.getEquipement().getId())
                .equipementNom(p.getEquipement().getNom())
                .dateSignalement(p.getDateSignalement())
                .statut(p.getStatut())
                .priorite(p.getPriorite())
                .build();
    }
}