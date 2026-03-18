package com.expenseflow.dto;

import lombok.Data;

@Data
public class ApprovalRequest {
    private String action; // "APPROVE" or "REJECT"
    private String comment;
}
