package com.example.demo.controllers;

import com.example.demo.dto.PanneDTO;
import com.example.demo.services.PanneService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
 
@RestController
@RequestMapping("/api/pannes")
@RequiredArgsConstructor
@Tag(name = "Pannes", description = "CRUD pannes")
public class PanneController {
 
    private final PanneService service;
 
    @GetMapping
    @Operation(summary = "Liste toutes les pannes")
    public ResponseEntity<List<PanneDTO.Response>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }
 
    @GetMapping("/{id}")
    @Operation(summary = "Trouve une panne par ID")
    public ResponseEntity<PanneDTO.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }
 
    @GetMapping("/equipement/{equipementId}")
    @Operation(summary = "Pannes d'un équipement")
    public ResponseEntity<List<PanneDTO.Response>> findByEquipement(@PathVariable Long equipementId) {
        return ResponseEntity.ok(service.findByEquipement(equipementId));
    }
 
    @PostMapping
    @Operation(summary = "Signale une panne")
    public ResponseEntity<PanneDTO.Response> create(@Valid @RequestBody PanneDTO.Request dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }
 
    @PutMapping("/{id}")
    @Operation(summary = "Modifie une panne")
    public ResponseEntity<PanneDTO.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody PanneDTO.Request dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }
 
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprime une panne")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
 