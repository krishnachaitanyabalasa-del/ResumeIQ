package com.resumeiq.service;

import com.resumeiq.entity.Admin;
import com.resumeiq.entity.User;
import com.resumeiq.model.UserPrincipal;
import com.resumeiq.repository.AdminRepository;
import com.resumeiq.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("Searching user by email = " + username);

        User user = userRepository.findByEmail(username).orElse(null);
        if (user != null) {
            return new UserPrincipal(user);
        }

        Admin admin = adminRepository.findByEmail(username).orElse(null);
        if (admin != null) {
            return new UserPrincipal(User.builder()
                    .id(admin.getId())
                    .name(admin.getName())
                    .email(admin.getEmail())
                    .password(admin.getPassword())
                    .role(admin.getRole() != null ? admin.getRole() : "ADMIN")
                    .build());
        }

        throw new UsernameNotFoundException("User/Admin not found with email: " + username);
    }
}
