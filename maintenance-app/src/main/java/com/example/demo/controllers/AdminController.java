package com.example.demo.controllers;

import com.example.demo.dto.AuthDTO;
import com.example.demo.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AuthService authService;

    @PostMapping("/users")
    public ResponseEntity<Void> createUser(@RequestBody AuthDTO.RegisterRequest dto) {
        authService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}