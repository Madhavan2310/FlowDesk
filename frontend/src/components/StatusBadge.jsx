import styles from './StatusBadge.module.css'

const config = {
  PENDING:        { label: 'Pending',          cls: 'pending' },
  MANAGER_REVIEW: { label: 'Manager Review',   cls: 'managerReview' },
  CEO_REVIEW:     { label: 'CEO Review',       cls: 'ceoReview' },
  APPROVED:       { label: 'Approved',         cls: 'approved' },
  REJECTED:       { label: 'Rejected',         cls: 'rejected' },
}

export default function StatusBadge({ status }) {
  const cfg = config[status] || { label: status, cls: 'pending' }
  return <span className={`${styles.badge} ${styles[cfg.cls]}`}>{cfg.label}</span>
}
