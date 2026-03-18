package com.expenseflow.service;

import com.expenseflow.dto.NotificationResponse;
import com.expenseflow.model.Notification;
import com.expenseflow.model.User;
import com.expenseflow.model.Workflow;
import com.expenseflow.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // Called by WorkflowService after manager action
    public void notifyManagerAction(Workflow workflow, String managerName, boolean approved, String comment) {
        String action = approved ? "Approved" : "Rejected";
        String title  = "Manager " + action + ": " + workflow.getName();
        String msg    = "Your expense request \"" + workflow.getName() + "\" has been "
                + action.toLowerCase() + " by Manager " + managerName + ".";
        if (comment != null && !comment.isBlank()) {
            msg += " Comment: \"" + comment + "\"";
        }
        if (approved) {
            msg += " It has been forwarded to the CEO for final approval.";
        }

        Notification notification = Notification.builder()
                .recipient(workflow.getCreatedBy())
                .workflow(workflow)
                .title(title)
                .message(msg)
                .type(approved ? Notification.NotificationType.MANAGER_APPROVED
                               : Notification.NotificationType.MANAGER_REJECTED)
                .build();

        notificationRepository.save(notification);
    }

    // Called by WorkflowService after CEO action
    public void notifyCeoAction(Workflow workflow, String ceoName, boolean approved, String comment) {
        String action = approved ? "Approved" : "Rejected";
        String title  = "CEO " + action + ": " + workflow.getName();
        String msg    = "Your expense request \"" + workflow.getName() + "\" has been "
                + action.toLowerCase() + " by CEO " + ceoName + ".";
        if (comment != null && !comment.isBlank()) {
            msg += " Comment: \"" + comment + "\"";
        }
        if (approved) {
            msg += " Your expense has been fully approved.";
        }

        Notification notification = Notification.builder()
                .recipient(workflow.getCreatedBy())
                .workflow(workflow)
                .title(title)
                .message(msg)
                .type(approved ? Notification.NotificationType.CEO_APPROVED
                               : Notification.NotificationType.CEO_REJECTED)
                .build();

        notificationRepository.save(notification);
    }

    // Fetch all notifications for logged-in user
    public List<NotificationResponse> getMyNotifications(User user) {
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // Unread count
    public long getUnreadCount(User user) {
        return notificationRepository.countByRecipientAndIsReadFalse(user);
    }

    // Mark all as read
    public void markAllRead(User user) {
        notificationRepository.markAllReadByRecipient(user);
    }

    // Mark one as read
    public void markOneRead(Long id, User user) {
        notificationRepository.markReadById(id, user);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .isRead(n.isRead())
                .workflowId(n.getWorkflow().getId())
                .workflowName(n.getWorkflow().getName())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
