package com.example.demo.services;
 
import com.example.demo.dto.PanneDTO;
import com.example.demo.entities.Panne;
import com.example.demo.entities.Panne.StatutPanne;
import com.example.demo.exceptions.ResourceNotFoundException;
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
    private final EquipementService equipementService;
 
    public List<PanneDTO.Response> findAll() {
        return repo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }
 
    public PanneDTO.Response findById(Long id) {
        return toResponse(getOrThrow(id));
    }
 
    public List<PanneDTO.Response> findByEquipement(Long equipementId) {
        return repo.findByEquipementId(equipementId).stream().map(this::toResponse).collect(Collectors.toList());
    }
 
    @Transactional
    public PanneDTO.Response create(PanneDTO.Request dto) {
        Panne p = Panne.builder()
                .description(dto.getDescription())
                .categorie(dto.getCategorie())
                .equipement(equipementService.getOrThrow(dto.getEquipementId()))
                .dateSignalement(LocalDateTime.now())
                .statut(dto.getStatut() != null ? dto.getStatut() : StatutPanne.SIGNALE)
                .build();
        return toResponse(repo.save(p));
    }
 
    @Transactional
    public PanneDTO.Response update(Long id, PanneDTO.Request dto) {
        Panne p = getOrThrow(id);
        p.setDescription(dto.getDescription());
        p.setCategorie(dto.getCategorie());
        p.setEquipement(equipementService.getOrThrow(dto.getEquipementId()));
        if (dto.getStatut() != null) p.setStatut(dto.getStatut());
        return toResponse(repo.save(p));
    }
 
    @Transactional
    public void delete(Long id) {
        getOrThrow(id);
        repo.deleteById(id);
    }
 
    public Panne getOrThrow(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Panne introuvable : id=" + id));
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
                .build();
    }
}
 