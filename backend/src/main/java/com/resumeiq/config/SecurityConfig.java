package com.resumeiq.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JWTFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .authorizeHttpRequests(auth -> auth
                        // ==========================================
                        // 1. PUBLIC ENDPOINTS (No Token Required)
                        // ==========================================
                        .requestMatchers(
                                "/",
                                "/health",
                                "/h2-console/**",
                                "/api/auth/**",
                                "/api/admin/login",
                                "/api/drives/open"
                        ).permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/admin").permitAll()

                        // ==========================================
                        // 2. APPLICANT & SHARED ENDPOINTS
                        // ==========================================
                        .requestMatchers(
                                "/api/resumes/**",
                                "/api/applications",
                                "/api/applications/user/**",
                                "/api/applications/*"
                        ).hasAnyAuthority("APPLICANT", "ADMIN")

                        .requestMatchers(HttpMethod.GET, "/api/drives/*").hasAnyAuthority("APPLICANT", "ADMIN")

                        // ==========================================
                        // 3. ADMIN-ONLY ENDPOINTS
                        // ==========================================
                        .requestMatchers(
                                "/api/admin/**",
                                "/api/users/**",
                                "/api/applications/drive/**"
                        ).hasAuthority("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/drives").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/drives/*").hasAuthority("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/drives").hasAuthority("ADMIN")

                        // ==========================================
                        // 4. DEFAULT: ALL OTHER REQUESTS REQUIRE AUTH
                        // ==========================================
                        .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174", "http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
