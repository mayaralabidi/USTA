package com.example.demo.services;

import com.example.demo.dto.AuthDTO;
import com.example.demo.entities.Utilisateur;
import com.example.demo.exceptions.BusinessRuleException;
import com.example.demo.repositories.UtilisateurRepository;
import com.example.demo.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest dto) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword())
        );
        Utilisateur user = utilisateurRepo.findByUsername(dto.getUsername()).orElseThrow();
        String token = jwtService.generateToken(user, Map.of("role", user.getRole().name()));
        return AuthDTO.AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }

    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest dto) {
        if (utilisateurRepo.existsByUsername(dto.getUsername())) {
            throw new BusinessRuleException("Ce nom d'utilisateur est déjà pris.");
        }
        Utilisateur user = Utilisateur.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(dto.getRole() != null ? dto.getRole() : Utilisateur.Role.TECHNICIEN)
                .build();
        utilisateurRepo.save(user);
        String token = jwtService.generateToken(user, Map.of("role", user.getRole().name()));
        return AuthDTO.AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }
}