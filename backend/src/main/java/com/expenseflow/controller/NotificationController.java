package com.expenseflow.controller;

import com.expenseflow.dto.NotificationResponse;
import com.expenseflow.model.User;
import com.expenseflow.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // GET all notifications for the logged-in user
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.getMyNotifications(user));
    }

    // GET unread count
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal User user) {
        long count = notificationService.getUnreadCount(user);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // POST mark all as read
    @PostMapping("/mark-all-read")
    public ResponseEntity<Map<String, String>> markAllRead(
            @AuthenticationPrincipal User user) {
        notificationService.markAllRead(user);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    // POST mark one as read
    @PostMapping("/{id}/mark-read")
    public ResponseEntity<Map<String, String>> markOneRead(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        notificationService.markOneRead(id, user);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
