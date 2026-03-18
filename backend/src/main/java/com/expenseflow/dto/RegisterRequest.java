package com.expenseflow.dto;

import com.expenseflow.model.User;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String fullName;
    private User.Role role;
}
