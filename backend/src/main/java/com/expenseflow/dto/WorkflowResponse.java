package com.expenseflow.dto;

import com.expenseflow.model.Workflow;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowResponse {
    private Long id;
    private String name;
    private BigDecimal amount;
    private String country;
    private String department;
    private Workflow.Priority priority;
    private Workflow.WorkflowStatus status;
    private String createdByName;
    private Long createdById;
    private Workflow.ApprovalStatus managerStatus;
    private String managerComment;
    private String managerName;
    private LocalDateTime managerActionAt;
    private Workflow.ApprovalStatus ceoStatus;
    private String ceoComment;
    private String ceoName;
    private LocalDateTime ceoActionAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
