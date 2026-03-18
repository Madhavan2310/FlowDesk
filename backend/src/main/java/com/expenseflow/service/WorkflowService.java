package com.expenseflow.service;

import com.expenseflow.dto.ApprovalRequest;
import com.expenseflow.dto.WorkflowRequest;
import com.expenseflow.dto.WorkflowResponse;
import com.expenseflow.model.User;
import com.expenseflow.model.Workflow;
import com.expenseflow.repository.WorkflowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final NotificationService notificationService;

    public WorkflowResponse createWorkflow(WorkflowRequest request, User user) {
        Workflow workflow = Workflow.builder()
                .name(request.getName())
                .amount(request.getAmount())
                .country(request.getCountry())
                .department(request.getDepartment())
                .priority(request.getPriority())
                .status(Workflow.WorkflowStatus.PENDING)
                .createdBy(user)
                .managerStatus(Workflow.ApprovalStatus.PENDING)
                .build();
        workflow = workflowRepository.save(workflow);
        return toResponse(workflow);
    }

    public List<WorkflowResponse> getMyWorkflows(User user) {
        return workflowRepository.findByCreatedByOrderByCreatedAtDesc(user)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<WorkflowResponse> getAllWorkflowsForManager() {
        return workflowRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<WorkflowResponse> getWorkflowsForCeo() {
        return workflowRepository.findByStatusInOrderByCreatedAtDesc(
                        List.of(Workflow.WorkflowStatus.CEO_REVIEW,
                                Workflow.WorkflowStatus.APPROVED,
                                Workflow.WorkflowStatus.REJECTED))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public WorkflowResponse managerAction(Long workflowId, ApprovalRequest request, User manager) {
        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        boolean approved = "APPROVE".equalsIgnoreCase(request.getAction());

        if (approved) {
            workflow.setManagerStatus(Workflow.ApprovalStatus.APPROVED);
            workflow.setStatus(Workflow.WorkflowStatus.CEO_REVIEW);
        } else {
            workflow.setManagerStatus(Workflow.ApprovalStatus.REJECTED);
            workflow.setStatus(Workflow.WorkflowStatus.REJECTED);
        }
        workflow.setManagerComment(request.getComment());
        workflow.setManager(manager);
        workflow.setManagerActionAt(LocalDateTime.now());
        workflow = workflowRepository.save(workflow);

        // Fire notification to the workflow creator
        notificationService.notifyManagerAction(workflow, manager.getFullName(), approved, request.getComment());

        return toResponse(workflow);
    }

    public WorkflowResponse ceoAction(Long workflowId, ApprovalRequest request, User ceo) {
        Workflow workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));

        if (workflow.getStatus() != Workflow.WorkflowStatus.CEO_REVIEW) {
            throw new RuntimeException("Workflow is not pending CEO review");
        }

        boolean approved = "APPROVE".equalsIgnoreCase(request.getAction());

        if (approved) {
            workflow.setCeoStatus(Workflow.ApprovalStatus.APPROVED);
            workflow.setStatus(Workflow.WorkflowStatus.APPROVED);
        } else {
            workflow.setCeoStatus(Workflow.ApprovalStatus.REJECTED);
            workflow.setStatus(Workflow.WorkflowStatus.REJECTED);
        }
        workflow.setCeoComment(request.getComment());
        workflow.setCeo(ceo);
        workflow.setCeoActionAt(LocalDateTime.now());
        workflow = workflowRepository.save(workflow);

        // Fire notification to the workflow creator
        notificationService.notifyCeoAction(workflow, ceo.getFullName(), approved, request.getComment());

        return toResponse(workflow);
    }

    public WorkflowResponse getWorkflowById(Long id) {
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Workflow not found"));
        return toResponse(workflow);
    }

    private WorkflowResponse toResponse(Workflow w) {
        return WorkflowResponse.builder()
                .id(w.getId())
                .name(w.getName())
                .amount(w.getAmount())
                .country(w.getCountry())
                .department(w.getDepartment())
                .priority(w.getPriority())
                .status(w.getStatus())
                .createdByName(w.getCreatedBy().getFullName())
                .createdById(w.getCreatedBy().getId())
                .managerStatus(w.getManagerStatus())
                .managerComment(w.getManagerComment())
                .managerName(w.getManager() != null ? w.getManager().getFullName() : null)
                .managerActionAt(w.getManagerActionAt())
                .ceoStatus(w.getCeoStatus())
                .ceoComment(w.getCeoComment())
                .ceoName(w.getCeo() != null ? w.getCeo().getFullName() : null)
                .ceoActionAt(w.getCeoActionAt())
                .createdAt(w.getCreatedAt())
                .updatedAt(w.getUpdatedAt())
                .build();
    }
}
