package com.expenseflow.controller;

import com.expenseflow.dto.ApprovalRequest;
import com.expenseflow.dto.WorkflowRequest;
import com.expenseflow.dto.WorkflowResponse;
import com.expenseflow.model.User;
import com.expenseflow.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowService workflowService;

    // USER: Create workflow
    @PostMapping("/create")
    public ResponseEntity<?> createWorkflow(@RequestBody WorkflowRequest request,
                                             @AuthenticationPrincipal User user) {
        try {
            WorkflowResponse response = workflowService.createWorkflow(request, user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // USER: Get my workflows
    @GetMapping("/my")
    public ResponseEntity<List<WorkflowResponse>> getMyWorkflows(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(workflowService.getMyWorkflows(user));
    }

    // USER: Get single workflow detail
    @GetMapping("/{id}")
    public ResponseEntity<?> getWorkflow(@PathVariable Long id,
                                          @AuthenticationPrincipal User user) {
        try {
            WorkflowResponse response = workflowService.getWorkflowById(id);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // MANAGER: Get all workflows
    @GetMapping("/manager/all")
    public ResponseEntity<List<WorkflowResponse>> getAllForManager() {
        return ResponseEntity.ok(workflowService.getAllWorkflowsForManager());
    }

    // MANAGER: Approve or Reject
    @PostMapping("/manager/{id}/action")
    public ResponseEntity<?> managerAction(@PathVariable Long id,
                                            @RequestBody ApprovalRequest request,
                                            @AuthenticationPrincipal User manager) {
        try {
            WorkflowResponse response = workflowService.managerAction(id, request, manager);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // CEO: Get manager-approved workflows
    @GetMapping("/ceo/all")
    public ResponseEntity<List<WorkflowResponse>> getAllForCeo() {
        return ResponseEntity.ok(workflowService.getWorkflowsForCeo());
    }

    // CEO: Approve or Reject
    @PostMapping("/ceo/{id}/action")
    public ResponseEntity<?> ceoAction(@PathVariable Long id,
                                        @RequestBody ApprovalRequest request,
                                        @AuthenticationPrincipal User ceo) {
        try {
            WorkflowResponse response = workflowService.ceoAction(id, request, ceo);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
