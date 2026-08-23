package com.resumeiq.dto;

import com.resumeiq.entity.User;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String message;
    private Long id;
    private String name;
    private String email;
    private String role;
}
