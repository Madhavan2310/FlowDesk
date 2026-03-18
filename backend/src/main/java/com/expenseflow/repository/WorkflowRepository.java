package com.expenseflow.repository;

import com.expenseflow.model.Workflow;
import com.expenseflow.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, Long> {
    List<Workflow> findByCreatedByOrderByCreatedAtDesc(User user);
    List<Workflow> findByStatusInOrderByCreatedAtDesc(List<Workflow.WorkflowStatus> statuses);
    List<Workflow> findAllByOrderByCreatedAtDesc();
}
