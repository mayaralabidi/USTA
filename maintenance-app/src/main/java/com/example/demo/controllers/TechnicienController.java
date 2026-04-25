package com.example.demo.controllers;

import com.example.demo.dto.TechnicienDTO;
import com.example.demo.services.TechnicienService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/techniciens")
@RequiredArgsConstructor
@Tag(name = "Techniciens", description = "CRUD techniciens")
public class TechnicienController {

   private final TechnicienService service;

   @GetMapping
   @Operation(summary = "Liste tous les techniciens")
   public ResponseEntity<List<TechnicienDTO.Response>> findAll() {
       return ResponseEntity.ok(service.findAll());
   }

   @GetMapping("/disponibles")
   @Operation(summary = "Techniciens disponibles uniquement")
   public ResponseEntity<List<TechnicienDTO.Response>> findDisponibles() {
       return ResponseEntity.ok(service.findDisponibles());
   }

   @GetMapping("/{id}")
   @Operation(summary = "Trouve un technicien par ID")
   public ResponseEntity<TechnicienDTO.Response> findById(@PathVariable Long id) {
       return ResponseEntity.ok(service.findById(id));
   }

   @PostMapping
   @Operation(summary = "Ajoute un technicien")
   public ResponseEntity<TechnicienDTO.Response> create(@Valid @RequestBody TechnicienDTO.Request dto) {
       return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
   }

   @PutMapping("/{id}")
   @Operation(summary = "Modifie un technicien")
   public ResponseEntity<TechnicienDTO.Response> update(
           @PathVariable Long id,
           @Valid @RequestBody TechnicienDTO.Request dto) {
       return ResponseEntity.ok(service.update(id, dto));
   }

   @DeleteMapping("/{id}")
   @Operation(summary = "Supprime un technicien")
   public ResponseEntity<Void> delete(@PathVariable Long id) {
       service.delete(id);
       return ResponseEntity.noContent().build();
   }
}
