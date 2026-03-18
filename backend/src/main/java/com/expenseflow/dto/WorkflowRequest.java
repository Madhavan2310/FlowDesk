package com.expenseflow.dto;

import com.expenseflow.model.Workflow;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class WorkflowRequest {
    private String name;
    private BigDecimal amount;
    private String country;
    private String department;
    private Workflow.Priority priority;
}
