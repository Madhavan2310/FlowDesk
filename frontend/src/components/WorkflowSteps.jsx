import styles from './WorkflowSteps.module.css'

export default function WorkflowSteps({ workflow }) {
  if (!workflow) return null

  const steps = [
    {
      id: 1,
      label: 'Submitted',
      roleTag: 'Employee',
      status: 'done',
      detail: `By ${workflow.createdByName}`,
      time: workflow.createdAt ? new Date(workflow.createdAt).toLocaleString() : null,
    },
    {
      id: 2,
      label: 'Manager Review',
      roleTag: 'Manager',
      status: workflow.managerStatus === 'APPROVED' ? 'done'
            : workflow.managerStatus === 'REJECTED' ? 'rejected'
            : workflow.status === 'PENDING' ? 'waiting'
            : 'active',
      detail: workflow.managerName
        ? `${workflow.managerName}: ${workflow.managerStatus}`
        : workflow.status === 'PENDING' ? 'Awaiting submission' : 'Pending manager action',
      comment: workflow.managerComment,
      time: workflow.managerActionAt ? new Date(workflow.managerActionAt).toLocaleString() : null,
    },
    {
      id: 3,
      label: 'CEO Review',
      roleTag: 'CEO',
      status: workflow.ceoStatus === 'APPROVED' ? 'done'
            : workflow.ceoStatus === 'REJECTED' ? 'rejected'
            : workflow.status === 'CEO_REVIEW' ? 'active'
            : workflow.status === 'APPROVED' ? 'done'
            : 'waiting',
      detail: workflow.ceoName
        ? `${workflow.ceoName}: ${workflow.ceoStatus}`
        : workflow.status === 'CEO_REVIEW' ? 'Awaiting CEO decision' : 'Not yet reached',
      comment: workflow.ceoComment,
      time: workflow.ceoActionAt ? new Date(workflow.ceoActionAt).toLocaleString() : null,
    },
    {
      id: 4,
      label: workflow.status === 'REJECTED' ? 'Rejected' : 'Approved',
      roleTag: 'Final',
      status: workflow.status === 'APPROVED' ? 'done'
            : workflow.status === 'REJECTED' ? 'rejected'
            : 'waiting',
      detail: workflow.status === 'APPROVED' ? 'Expense approved'
            : workflow.status === 'REJECTED' ? 'Expense rejected'
            : 'Pending final decision',
      time: null,
    },
  ]

  return (
    <div className={styles.stepsContainer}>
      <h3 className={styles.stepsTitle}>Approval Progress</h3>
      <div className={styles.steps}>
        {steps.map((step, idx) => (
          <div key={step.id} className={styles.stepRow}>
            <div className={styles.stepLeft}>
              <div className={`${styles.stepIcon} ${styles[step.status]}`}>
                {step.status === 'done'     ? <span className={styles.iconCheck}>&#10003;</span> :
                 step.status === 'rejected' ? <span className={styles.iconX}>&#10005;</span> :
                 step.status === 'active'   ? <span className={styles.pulse} /> :
                 <span className={styles.stepNum}>{step.id}</span>}
              </div>
              {idx < steps.length - 1 && (
                <div className={`${styles.connector} ${step.status === 'done' ? styles.connectorDone : ''}`} />
              )}
            </div>
            <div className={`${styles.stepContent} ${styles['content_' + step.status]}`}>
              <div className={styles.stepHeader}>
                <span className={styles.roleTag}>{step.roleTag}</span>
                <span className={styles.stepLabel}>{step.label}</span>
                {step.time && <span className={styles.stepTime}>{step.time}</span>}
              </div>
              <p className={styles.stepDetail}>{step.detail}</p>
              {step.comment && (
                <div className={styles.comment}>
                  <span className={styles.commentLabel}>Note:</span>
                  <span>"{step.comment}"</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
