package com.expenseflow.dto;

import com.expenseflow.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private String username;
    private String fullName;
    private User.Role role;
    private Long userId;
}
