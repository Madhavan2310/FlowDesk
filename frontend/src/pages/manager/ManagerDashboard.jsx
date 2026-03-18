import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { workflowAPI } from '../../services/api'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import styles from './ManagerDashboard.module.css'

export default function ManagerDashboard() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [actionModal, setActionModal] = useState(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('ALL')

  const fetchWorkflows = async () => {
    try {
      const res = await workflowAPI.getAllForManager()
      setWorkflows(res.data)
    } catch {
      toast.error('Failed to load workflows')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWorkflows() }, [])

  const handleAction = async () => {
    setSubmitting(true)
    try {
      await workflowAPI.managerAction(actionModal.wf.id, {
        action: actionModal.type,
        comment
      })
      toast.success(`Workflow ${actionModal.type === 'APPROVE' ? 'approved' : 'rejected'}!`)
      setActionModal(null)
      setComment('')
      setSelected(null)
      fetchWorkflows()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = filter === 'ALL' ? workflows : workflows.filter(w => w.status === filter)

  const stats = {
    total: workflows.length,
    pending: workflows.filter(w => w.status === 'PENDING').length,
    sentToCeo: workflows.filter(w => w.status === 'CEO_REVIEW').length,
    approved: workflows.filter(w => w.managerStatus === 'APPROVED').length,
    rejected: workflows.filter(w => w.managerStatus === 'REJECTED').length,
  }

  const filterTabs = [
    { key: 'ALL',        label: 'All',            count: stats.total },
    { key: 'PENDING',    label: 'Pending Action', count: stats.pending },
    { key: 'CEO_REVIEW', label: 'Sent to CEO',    count: stats.sentToCeo },
    { key: 'APPROVED',   label: 'Final Approved', count: stats.approved },
    { key: 'REJECTED',   label: 'Rejected',       count: stats.rejected },
  ]

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Manager Dashboard</h1>
            <p className={styles.pageSub}>Review and manage all employee expense requests</p>
          </div>
          <button onClick={fetchWorkflows} className={styles.refreshBtn}>Refresh</button>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          {[
            { label: 'Total Requests',   value: stats.total,      color: 'default' },
            { label: 'Awaiting Review',  value: stats.pending,    color: 'yellow' },
            { label: 'Forwarded to CEO', value: stats.sentToCeo,  color: 'purple' },
            { label: 'You Approved',     value: stats.approved,   color: 'green' },
            { label: 'You Rejected',     value: stats.rejected,   color: 'red' },
          ].map(s => (
            <div key={s.label} className={`${styles.statCard} ${styles['stat_' + s.color]}`}>
              <span className={styles.statVal}>{s.value}</span>
              <span className={styles.statLbl}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          {filterTabs.map(t => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`${styles.filterTab} ${filter === t.key ? styles.filterTabActive : ''}`}
            >
              {t.label}
              <span className={styles.tabCount}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.emptyState}>Loading workflows...</div>
          ) : filtered.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color:'var(--gray-300)'}}>
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p>No workflows in this category</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Request</th>
                  <th>Employee</th>
                  <th>Amount</th>
                  <th>Country</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(wf => (
                  <tr
                    key={wf.id}
                    className={selected?.id === wf.id ? styles.rowSelected : ''}
                    onClick={() => setSelected(wf === selected ? null : wf)}
                  >
                    <td className={styles.tdName}>{wf.name}</td>
                    <td>{wf.createdByName}</td>
                    <td className={styles.tdAmount}>${parseFloat(wf.amount).toLocaleString()}</td>
                    <td>{wf.country}</td>
                    <td><span className={`${styles.priorityBadge} ${styles['p_' + wf.priority]}`}>{wf.priority}</span></td>
                    <td><StatusBadge status={wf.status} /></td>
                    <td className={styles.tdDate}>{new Date(wf.createdAt).toLocaleDateString()}</td>
                    <td onClick={e => e.stopPropagation()}>
                      {wf.status === 'PENDING' ? (
                        <div className={styles.actionBtns}>
                          <button onClick={() => { setActionModal({ wf, type: 'APPROVE' }); setComment('') }} className={styles.approveBtn}>Approve</button>
                          <button onClick={() => { setActionModal({ wf, type: 'REJECT' });  setComment('') }} className={styles.rejectBtn}>Reject</button>
                        </div>
                      ) : (
                        <span className={styles.actionDone}>
                          {wf.managerStatus === 'APPROVED' ? 'Approved' : wf.managerStatus === 'REJECTED' ? 'Rejected' : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail Drawer */}
        {selected && (
          <div className={styles.drawer}>
            <div className={styles.drawerHeader}>
              <div>
                <h3 className={styles.drawerTitle}>{selected.name}</h3>
                <div style={{ marginTop: '6px' }}><StatusBadge status={selected.status} /></div>
              </div>
              <button onClick={() => setSelected(null)} className={styles.closeBtn}>&#10005;</button>
            </div>
            <div className={styles.drawerGrid}>
              {[
                { l: 'Amount',       v: `$${parseFloat(selected.amount).toLocaleString()}` },
                { l: 'Country',      v: selected.country },
                { l: 'Priority',     v: selected.priority },
                { l: 'Department',   v: selected.department || '—' },
                { l: 'Submitted by', v: selected.createdByName },
                { l: 'Submitted on', v: new Date(selected.createdAt).toLocaleString() },
              ].map(item => (
                <div key={item.l} className={styles.drawerInfo}>
                  <span className={styles.infoLabel}>{item.l}</span>
                  <span className={styles.infoValue}>{item.v}</span>
                </div>
              ))}
            </div>
            {selected.status === 'PENDING' && (
              <div className={styles.drawerActions}>
                <button onClick={() => { setActionModal({ wf: selected, type: 'APPROVE' }); setComment('') }} className={styles.approveBtn}>Approve Request</button>
                <button onClick={() => { setActionModal({ wf: selected, type: 'REJECT' });  setComment('') }} className={styles.rejectBtn}>Reject Request</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Action Modal */}
      {actionModal && (
        <div className={styles.overlay} onClick={() => setActionModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={`${styles.modalHeader} ${actionModal.type === 'APPROVE' ? styles.modalHeaderApprove : styles.modalHeaderReject}`}>
              <h3 className={styles.modalTitle}>
                {actionModal.type === 'APPROVE' ? 'Approve Request' : 'Reject Request'}
              </h3>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalInfo}>
                <strong>{actionModal.wf.name}</strong> — ${parseFloat(actionModal.wf.amount).toLocaleString()} | {actionModal.wf.country} | {actionModal.wf.priority}
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Comment {actionModal.type === 'REJECT' ? '(required)' : '(optional)'}</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className={styles.textarea}
                  placeholder={actionModal.type === 'APPROVE' ? 'Add a note for the CEO...' : 'Reason for rejection...'}
                  rows={3}
                />
              </div>
              <div className={styles.modalActions}>
                <button onClick={() => setActionModal(null)} className={styles.cancelBtn}>Cancel</button>
                <button
                  onClick={handleAction}
                  disabled={submitting || (actionModal.type === 'REJECT' && !comment.trim())}
                  className={actionModal.type === 'APPROVE' ? styles.approveBtn : styles.rejectBtn}
                >
                  {submitting ? 'Processing...' : `Confirm ${actionModal.type === 'APPROVE' ? 'Approval' : 'Rejection'}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
