package com.example.demo.services;
 
import com.example.demo.dto.TechnicienDTO;
import com.example.demo.entities.Intervention.StatutIntervention;
import com.example.demo.entities.Technicien;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.TechnicienRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
 
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TechnicienService {
 
    private final TechnicienRepository repo;
 
    public List<TechnicienDTO.Response> findAll() {
        return repo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }
 
    public List<TechnicienDTO.Response> findDisponibles() {
        return repo.findByDisponibiliteTrue().stream().map(this::toResponse).collect(Collectors.toList());
    }
 
    public TechnicienDTO.Response findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public TechnicienDTO.Response findByUsername(String username) {
        return toResponse(getByUsernameOrThrow(username));
    }
 
    @Transactional
    public TechnicienDTO.Response create(TechnicienDTO.Request dto) {
        Technicien t = Technicien.builder()
                .nom(dto.getNom())
                .competences(dto.getCompetences())
                .disponibilite(dto.isDisponibilite())
                .email(dto.getEmail())   
                .build();
        return toResponse(repo.save(t));
    }
 
    @Transactional
    public TechnicienDTO.Response update(Long id, TechnicienDTO.Request dto) {
        Technicien t = getOrThrow(id);
        t.setNom(dto.getNom());
        t.setCompetences(dto.getCompetences());
        t.setDisponibilite(dto.isDisponibilite());
        t.setEmail(dto.getEmail());
        return toResponse(repo.save(t));
    }
 
    @Transactional
    public void delete(Long id) {
        getOrThrow(id);
        repo.deleteById(id);
    }
 
    public Technicien getOrThrow(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Technicien introuvable : id=" + id));
    }

    public Technicien getByUsernameOrThrow(String username) {
        return repo.findByNom(username)
                .orElseThrow(() -> new ResourceNotFoundException("Technicien introuvable pour l'utilisateur : " + username));
    }

    @Transactional
    public TechnicienDTO.Response updateDisponibilite(String username, boolean disponibilite) {
        Technicien t = getByUsernameOrThrow(username);
        t.setDisponibilite(disponibilite);
        return toResponse(repo.save(t));
    }
 
    private TechnicienDTO.Response toResponse(Technicien t) {
        long enCours = t.getInterventions() != null
                ? t.getInterventions().stream()
                    .filter(i -> i.getStatut() == StatutIntervention.EN_COURS).count()
                : 0;
        return TechnicienDTO.Response.builder()
                .id(t.getId())
                .nom(t.getNom())
                .competences(t.getCompetences())
                .disponibilite(t.isDisponibilite())
                .interventionsEnCours(enCours)
                .email(t.getEmail())
                .build();
    }
}