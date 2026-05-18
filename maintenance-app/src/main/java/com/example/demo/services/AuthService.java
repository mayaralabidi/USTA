package com.example.demo.services;

import com.example.demo.dto.AuthDTO;
import com.example.demo.entities.Utilisateur;
import com.example.demo.entities.Technicien;
import com.example.demo.exceptions.BusinessRuleException;
import com.example.demo.repositories.UtilisateurRepository;
import com.example.demo.repositories.TechnicienRepository;
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
    private final TechnicienRepository technicienRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest dto) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword())
        );
        Utilisateur user = utilisateurRepo.findByUsername(dto.getUsername()).orElseThrow();
        return buildResponse(user);
    }

    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest dto) {
        Utilisateur user = createUser(dto, false);
        return buildResponse(user);
    }

    public AuthDTO.AuthResponse createUser(AuthDTO.RegisterRequest dto) {
        Utilisateur user = createUser(dto, true);
        return buildResponse(user);
    }

    public AuthDTO.AuthResponse bootstrapAdmin(AuthDTO.RegisterRequest dto) {
        if (utilisateurRepo.count() > 0) {
            throw new BusinessRuleException("L'administration initiale est déjà configurée.");
        }
        Utilisateur user = createUserWithRole(dto, Utilisateur.Role.ADMIN);
        return buildResponse(user);
    }

    public AuthDTO.SetupStatusResponse setupStatus() {
        return AuthDTO.SetupStatusResponse.builder()
                .bootstrapRequired(utilisateurRepo.count() == 0)
                .build();
    }

    private Utilisateur createUser(AuthDTO.RegisterRequest dto, boolean allowRoleChoice) {
        if (utilisateurRepo.existsByUsername(dto.getUsername())) {
            throw new BusinessRuleException("Ce nom d'utilisateur est déjà pris.");
        }
        return createUserWithRole(
                dto,
                allowRoleChoice && dto.getRole() != null ? dto.getRole() : Utilisateur.Role.TECHNICIEN
        );
    }

    private Utilisateur createUserWithRole(AuthDTO.RegisterRequest dto, Utilisateur.Role role) {
        Utilisateur user = Utilisateur.builder()
                .username(dto.getUsername())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(role)
                .build();
        Utilisateur savedUser = utilisateurRepo.save(user);
        
        if (role == Utilisateur.Role.TECHNICIEN) {
            Technicien tech = Technicien.builder()
                    .nom(dto.getUsername())
                    .disponibilite(true)
                    .build();
            technicienRepo.save(tech);
        }
        
        return savedUser;
    }

    private AuthDTO.AuthResponse buildResponse(Utilisateur user) {
        String token = jwtService.generateToken(user, Map.of("role", user.getRole().name()));
        return AuthDTO.AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }
}