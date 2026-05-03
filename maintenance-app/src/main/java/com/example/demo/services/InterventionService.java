package com.example.demo.services;

import com.example.demo.dto.InterventionDTO;
import com.example.demo.entities.Equipement.EtatEquipement;
import com.example.demo.entities.Intervention;
import com.example.demo.entities.Intervention.StatutIntervention;
import com.example.demo.entities.Panne.StatutPanne;
import com.example.demo.entities.Technicien;
import com.example.demo.exceptions.BusinessRuleException;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.EquipementRepository;
import com.example.demo.repositories.InterventionRepository;
import com.example.demo.repositories.PanneRepository;
import com.example.demo.repositories.TechnicienRepository;
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
    private final TechnicienRepository technicienRepo;
    private final PanneRepository panneRepo;
    private final EquipementRepository equipementRepo;

    public List<InterventionDTO.Response> findAll() {
        return repo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public InterventionDTO.Response findById(Long id) {
        return toResponse(getWithDetails(id));
    }

    @Transactional
    public InterventionDTO.Response create(InterventionDTO.Request dto) {

        Technicien technicien = dto.getTechnicienId() != null
                ? technicienService.getOrThrow(dto.getTechnicienId())
                : null;

        // Rule 1: technicien must be disponible
        if (technicien != null && !technicien.isDisponibilite()) {
            throw new BusinessRuleException(
                    "Le technicien '" + technicien.getNom() + "' n'est pas disponible. " +
                    "Choisissez un technicien disponible.");
        }
        
        var equipement = equipementService.getOrThrow(dto.getEquipementId());
	
	     // Rule: cannot intervene on a decommissioned machine
	     if (equipement.getEtat() == EtatEquipement.HORS_SERVICE) {
	         throw new BusinessRuleException(
	             "Impossible de créer une intervention : l'équipement '" +
	             equipement.getNom() + "' est hors service.");
	     }

        Intervention i = Intervention.builder()
                .equipement(equipement)
                .technicien(technicien)
                .panne(dto.getPanneId() != null ? panneService.getOrThrow(dto.getPanneId()) : null)
                .statut(dto.getStatut())
                .date(dto.getDate())
                .cout(dto.getCout())
                .notes(dto.getNotes())
                .build();

        Intervention saved = repo.save(i);

        // If created directly as EN_COURS, apply side effects immediately
        if (dto.getStatut() == StatutIntervention.EN_COURS) {
            applyEnCoursEffects(saved);
        }

        return toResponse(saved);
    }

    @Transactional
    public InterventionDTO.Response update(Long id, InterventionDTO.Request dto) {
        Intervention i = getWithDetails(id);

        Technicien technicien = dto.getTechnicienId() != null
                ? technicienService.getOrThrow(dto.getTechnicienId())
                : null;

        // Rule 1: technicien must be disponible
        if (technicien != null && !technicien.isDisponibilite()) {
            throw new BusinessRuleException(
                    "Le technicien '" + technicien.getNom() + "' n'est pas disponible.");
        }

        i.setEquipement(equipementService.getOrThrow(dto.getEquipementId()));
        i.setTechnicien(technicien);
        i.setPanne(dto.getPanneId() != null ? panneService.getOrThrow(dto.getPanneId()) : null);
        i.setStatut(dto.getStatut());
        i.setDate(dto.getDate());
        i.setCout(dto.getCout());
        i.setNotes(dto.getNotes());

        return toResponse(repo.save(i));
    }

    @Transactional
    public InterventionDTO.Response updateStatut(Long id, StatutIntervention newStatut) {

        // getWithDetails loads technicien, panne, equipement eagerly
        // so the side effects can access them without lazy loading issues
        Intervention i = getWithDetails(id);
        StatutIntervention current = i.getStatut();

        // Rule 2: enforce valid status transitions
        boolean valid = switch (current) {
            case PLANIFIEE        -> newStatut == StatutIntervention.EN_COURS
                                  || newStatut == StatutIntervention.ANNULEE;
            case EN_COURS         -> newStatut == StatutIntervention.TERMINEE
                                  || newStatut == StatutIntervention.ANNULEE;
            case TERMINEE,
                 ANNULEE          -> false;
        };

        if (!valid) {
            String allowed = switch (current) {
                case PLANIFIEE        -> "EN_COURS, ANNULEE";
                case EN_COURS         -> "TERMINEE, ANNULEE";
                case TERMINEE,
                     ANNULEE          -> "aucune (statut terminal)";
            };
            throw new BusinessRuleException(
                    "Transition invalide : " + current + " → " + newStatut +
                    ". Transitions autorisées depuis " + current + " : " + allowed);
        }

        i.setStatut(newStatut);
        repo.save(i);

        // ── Side effects ──────────────────────────────────────────────────────

        // PLANIFIEE → EN_COURS:
        //   machine        → EN_MAINTENANCE
        //   linked panne   → EN_COURS
        //   technicien     → non disponible
        if (newStatut == StatutIntervention.EN_COURS) {
            applyEnCoursEffects(i);
        }

        // EN_COURS → TERMINEE:
        //   linked panne   → RESOLU
        //   technicien     → disponible again
        //   machine        → OPERATIONNEL (if no more active pannes)
        if (newStatut == StatutIntervention.TERMINEE) {
            applyTermineeEffects(i);
        }

        // → ANNULEE:
        //   technicien     → disponible again (if no other EN_COURS interventions)
        if (newStatut == StatutIntervention.ANNULEE) {
            freeTechnicienIfIdle(i);
        }

        return toResponse(i);
    }

    @Transactional
    public void delete(Long id) {
        Intervention i = getWithDetails(id);

        // Rule 3: cannot delete an EN_COURS intervention
        if (i.getStatut() == StatutIntervention.EN_COURS) {
            throw new BusinessRuleException(
                    "Impossible de supprimer une intervention en cours. " +
                    "Terminez-la ou annulez-la d'abord.");
        }

        repo.delete(i);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Loads the intervention with all relationships eagerly (technicien, panne, equipement).
     * Use this instead of findById() whenever side effects need to access related entities.
     * Prevents LazyInitializationException when modifying technicien/panne/equipement.
     */
    private Intervention getWithDetails(Long id) {
        return repo.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention introuvable : id=" + id));
    }

    public Intervention getOrThrow(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention introuvable : id=" + id));
    }

    // ── Side effect methods ───────────────────────────────────────────────────

    private void applyEnCoursEffects(Intervention i) {
        // Machine → EN_MAINTENANCE
        var eq = i.getEquipement();
        if (eq.getEtat() != EtatEquipement.EN_MAINTENANCE) {
            eq.setEtat(EtatEquipement.EN_MAINTENANCE);
            equipementRepo.save(eq);
        }

        // Linked panne → EN_COURS
        if (i.getPanne() != null && i.getPanne().getStatut() == StatutPanne.SIGNALE) {
            i.getPanne().setStatut(StatutPanne.EN_COURS);
            panneRepo.save(i.getPanne());
        }

        // Technicien → non disponible
        if (i.getTechnicien() != null && i.getTechnicien().isDisponibilite()) {
            i.getTechnicien().setDisponibilite(false);
            technicienRepo.save(i.getTechnicien());
        }
    }

    private void applyTermineeEffects(Intervention i) {
        // Linked panne → RESOLU
        if (i.getPanne() != null) {
            i.getPanne().setStatut(StatutPanne.RESOLU);
            panneRepo.save(i.getPanne());
        }

        // Technicien → disponible again if no other EN_COURS interventions
        freeTechnicienIfIdle(i);

        // Machine → OPERATIONNEL if no more active pannes
        var eq = i.getEquipement();
        long activePannes = panneRepo.countByEquipementIdAndStatutIn(
                eq.getId(),
                List.of(StatutPanne.SIGNALE, StatutPanne.EN_COURS));

        if (activePannes == 0) {
            eq.setEtat(EtatEquipement.OPERATIONNEL);
            equipementRepo.save(eq);
        }
    }

    private void freeTechnicienIfIdle(Intervention i) {
        if (i.getTechnicien() == null) return;

        long stillActive = repo.countByTechnicienIdAndStatut(
                i.getTechnicien().getId(), StatutIntervention.EN_COURS);

        if (stillActive == 0) {
            i.getTechnicien().setDisponibilite(true);
            technicienRepo.save(i.getTechnicien());
        }
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

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