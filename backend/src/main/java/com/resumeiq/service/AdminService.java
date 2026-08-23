package com.resumeiq.service;

import com.resumeiq.dto.AuthResponse;
import com.resumeiq.dto.LoginRequest;
import com.resumeiq.entity.Admin;
import com.resumeiq.repository.AdminRepository;
import com.resumeiq.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JWTService jwtService;

    public Admin addAdmin(Admin admin) {
        if (adminRepository.existsByEmail(admin.getEmail()) || userRepository.existsByEmail(admin.getEmail())) {
            throw new RuntimeException("Email already exists: " + admin.getEmail());
        }

        admin.setRole("ADMIN");
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        Admin savedAdmin = adminRepository.save(admin);
        savedAdmin.setPassword(null);
        return savedAdmin;
    }

    public List<Admin> getAllAdmins() {
        List<Admin> admins = adminRepository.findAll();
        admins.forEach(a -> a.setPassword(null));
        return admins;
    }

    public Optional<Admin> getAdminById(Long id) {
        Optional<Admin> adminOpt = adminRepository.findById(id);
        adminOpt.ifPresent(a -> a.setPassword(null));
        return adminOpt;
    }

    public Optional<Admin> getAdminByEmail(String email) {
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        adminOpt.ifPresent(a -> a.setPassword(null));
        return adminOpt;
    }

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        if (authentication.isAuthenticated()) {
            Admin admin = adminRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("Admin not found with email: " + loginRequest.getEmail()));

            String token = jwtService.generateToken(admin.getEmail());

            return AuthResponse.builder()
                    .token(token)
                    .message("Admin login successful")
                    .id(admin.getId())
                    .name(admin.getName())
                    .email(admin.getEmail())
                    .role(admin.getRole())
                    .build();
        }

        throw new RuntimeException("Invalid admin credentials");
    }
}
