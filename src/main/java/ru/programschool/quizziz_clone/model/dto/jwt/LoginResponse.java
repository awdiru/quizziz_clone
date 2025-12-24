package ru.programschool.quizziz_clone.model.dto.jwt;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginResponse {
    private final String type = "Bearer";
    private String token;
    private String username;
    private String email;
}
