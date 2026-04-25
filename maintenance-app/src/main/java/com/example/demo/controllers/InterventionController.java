package com.example.demo.controllers;

import com.example.demo.dto.InterventionDTO;
import com.example.demo.services.InterventionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
 
@RestController
@RequestMapping("/api/interventions")
@RequiredArgsConstructor
@Tag(name = "Interventions", description = "CRUD interventions")
public class InterventionController {
 
    private final InterventionService service;
 
    @GetMapping
    @Operation(summary = "Liste toutes les interventions")
    public ResponseEntity<List<InterventionDTO.Response>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }
 
    @GetMapping("/{id}")
    @Operation(summary = "Trouve une intervention par ID")
    public ResponseEntity<InterventionDTO.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }
 
    @PostMapping
    @Operation(summary = "Planifie une intervention")
    public ResponseEntity<InterventionDTO.Response> create(@Valid @RequestBody InterventionDTO.Request dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }
 
    @PutMapping("/{id}")
    @Operation(summary = "Modifie une intervention")
    public ResponseEntity<InterventionDTO.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody InterventionDTO.Request dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }
 
    @PatchMapping("/{id}/statut")
    @Operation(summary = "Met à jour le statut d'une intervention")
    public ResponseEntity<InterventionDTO.Response> updateStatut(
            @PathVariable Long id,
            @Valid @RequestBody InterventionDTO.StatutUpdate dto) {
        return ResponseEntity.ok(service.updateStatut(id, dto.getStatut()));
    }
 
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprime une intervention")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}