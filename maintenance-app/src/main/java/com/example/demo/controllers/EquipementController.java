package com.example.demo.controllers;
 
import com.example.demo.dto.EquipementDTO;
import com.example.demo.services.EquipementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
 
@RestController
@RequestMapping("/api/equipements")
@RequiredArgsConstructor
@Tag(name = "Équipements", description = "CRUD équipements")
public class EquipementController {
 
    private final EquipementService service;
 
    @GetMapping
    @Operation(summary = "Liste tous les équipements")
    public ResponseEntity<List<EquipementDTO.Response>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }
 
    @GetMapping("/{id}")
    @Operation(summary = "Trouve un équipement par ID")
    public ResponseEntity<EquipementDTO.Response> findById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }
 
    @PostMapping
    @Operation(summary = "Crée un équipement")
    public ResponseEntity<EquipementDTO.Response> create(@Valid @RequestBody EquipementDTO.Request dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }
 
    @PutMapping("/{id}")
    @Operation(summary = "Modifie un équipement")
    public ResponseEntity<EquipementDTO.Response> update(
            @PathVariable Long id,
            @Valid @RequestBody EquipementDTO.Request dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }
 
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprime un équipement")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
 