package com.example.demo.controllers;

import com.example.demo.dto.DashboardDTO;
import com.example.demo.services.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Statistiques et indicateurs")
public class DashboardController {
 
    private final DashboardService service;
 
    @GetMapping("/stats")
    @Operation(summary = "Statistiques du tableau de bord")
    public ResponseEntity<DashboardDTO> getStats() {
        return ResponseEntity.ok(service.getStats());
    }
}
 