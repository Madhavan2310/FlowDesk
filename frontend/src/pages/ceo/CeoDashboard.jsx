import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { workflowAPI } from '../../services/api'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import styles from './CeoDashboard.module.css'

export default function CeoDashboard() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [actionModal, setActionModal] = useState(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('ALL')

  const fetchWorkflows = async () => {
    try {
      const res = await workflowAPI.getAllForCeo()
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
      await workflowAPI.ceoAction(actionModal.wf.id, {
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

  const pending  = workflows.filter(w => w.status === 'CEO_REVIEW')
  const approved = workflows.filter(w => w.status === 'APPROVED')
  const rejected = workflows.filter(w => w.status === 'REJECTED')

  const filtered = filter === 'ALL'        ? workflows
                 : filter === 'CEO_REVIEW' ? pending
                 : filter === 'APPROVED'   ? approved
                 : rejected

  const totalValue = workflows.reduce((s, w) => s + parseFloat(w.amount), 0)

  const filterTabs = [
    { key: 'ALL',        label: 'All Forwarded',       count: workflows.length },
    { key: 'CEO_REVIEW', label: 'Awaiting My Decision', count: pending.length },
    { key: 'APPROVED',   label: 'Approved',             count: approved.length },
    { key: 'REJECTED',   label: 'Rejected',             count: rejected.length },
  ]

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>CEO Dashboard</h1>
            <p className={styles.pageSub}>Final approval authority — manager-reviewed requests</p>
          </div>
          <button onClick={fetchWorkflows} className={styles.refreshBtn}>Refresh</button>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          {[
            { label: 'Total Forwarded',   value: workflows.length,              color: 'default' },
            { label: 'Awaiting Decision', value: pending.length,                color: 'purple' },
            { label: 'Approved by Me',    value: approved.length,               color: 'green' },
            { label: 'Rejected by Me',    value: rejected.length,               color: 'red' },
            { label: 'Total Value',       value: `$${totalValue.toLocaleString()}`, color: 'blue' },
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

        <div className={styles.contentGrid}>
          {/* Cards Grid */}
          <div className={styles.cardsArea}>
            {loading ? (
              <div className={styles.emptyState}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color:'var(--gray-300)'}}>
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p>No requests in this category</p>
              </div>
            ) : (
              <div className={styles.cardsGrid}>
                {filtered.map(wf => (
                  <div
                    key={wf.id}
                    className={`${styles.wfCard} ${selected?.id === wf.id ? styles.wfCardActive : ''}`}
                    onClick={() => setSelected(wf === selected ? null : wf)}
                  >
                    <div className={styles.cardTop}>
                      <span className={styles.cardName}>{wf.name}</span>
                      <StatusBadge status={wf.status} />
                    </div>
                    <div className={styles.cardAmount}>${parseFloat(wf.amount).toLocaleString()}</div>
                    <div className={styles.cardMeta}>
                      <span>{wf.createdByName}</span>
                      <span className={styles.metaDot} />
                      <span>{wf.country}</span>
                      <span className={styles.metaDot} />
                      <span className={`${styles.pBadge} ${styles['p_' + wf.priority]}`}>{wf.priority}</span>
                    </div>
                    {wf.managerName && (
                      <div className={styles.managerNote}>
                        <span className={styles.managerLabel}>Manager: {wf.managerName}</span>
                        {wf.managerComment && (
                          <span className={styles.managerComment}>"{wf.managerComment}"</span>
                        )}
                      </div>
                    )}
                    <div className={styles.cardDate}>{new Date(wf.createdAt).toLocaleDateString()}</div>
                    {wf.status === 'CEO_REVIEW' && (
                      <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                        <button className={styles.approveBtn} onClick={() => { setActionModal({ wf, type: 'APPROVE' }); setComment('') }}>Approve</button>
                        <button className={styles.rejectBtn}  onClick={() => { setActionModal({ wf, type: 'REJECT'  }); setComment('') }}>Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className={styles.detailPanel}>
              <div className={styles.detailHeader}>
                <div>
                  <h3 className={styles.detailTitle}>{selected.name}</h3>
                  <div style={{ marginTop: '6px' }}><StatusBadge status={selected.status} /></div>
                </div>
                <button onClick={() => setSelected(null)} className={styles.closeBtn}>&#10005;</button>
              </div>

              <div className={styles.detailGrid}>
                {[
                  { l: 'Amount',       v: `$${parseFloat(selected.amount).toLocaleString()}` },
                  { l: 'Country',      v: selected.country },
                  { l: 'Priority',     v: selected.priority },
                  { l: 'Department',   v: selected.department || '—' },
                  { l: 'Submitted by', v: selected.createdByName },
                  { l: 'Date',         v: new Date(selected.createdAt).toLocaleDateString() },
                ].map(item => (
                  <div key={item.l} className={styles.detailInfo}>
                    <span className={styles.infoLabel}>{item.l}</span>
                    <span className={styles.infoValue}>{item.v}</span>
                  </div>
                ))}
              </div>

              {/* Manager decision */}
              <div className={styles.approvalSection}>
                <h4 className={styles.sectionTitle}>Manager Decision</h4>
                <div className={`${styles.approvalBox} ${styles.approvalBoxGreen}`}>
                  <div className={styles.approvalRow}>
                    <div className={styles.approvalAvatar}>M</div>
                    <div>
                      <div className={styles.approvalName}>{selected.managerName || 'Manager'}</div>
                      <div className={styles.approvalStatus}>
                        <span className={styles.approvedTag}>Approved</span>
                        {selected.managerActionAt && (
                          <span className={styles.approvalTime}>{new Date(selected.managerActionAt).toLocaleString()}</span>
                        )}
                      </div>
                      {selected.managerComment && (
                        <div className={styles.approvalComment}>"{selected.managerComment}"</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* CEO decision (if made) */}
              {selected.ceoStatus && (
                <div className={styles.approvalSection}>
                  <h4 className={styles.sectionTitle}>Your Decision</h4>
                  <div className={`${styles.approvalBox} ${selected.ceoStatus === 'APPROVED' ? styles.approvalBoxGreen : styles.approvalBoxRed}`}>
                    <div className={styles.approvalRow}>
                      <div className={styles.approvalAvatar} style={{ background: selected.ceoStatus === 'APPROVED' ? 'var(--green-100)' : 'var(--red-100)', color: selected.ceoStatus === 'APPROVED' ? 'var(--green-700)' : 'var(--red-700)' }}>C</div>
                      <div>
                        <div className={styles.approvalName}>{selected.ceoName || 'You'}</div>
                        <div className={styles.approvalStatus}>
                          <span className={selected.ceoStatus === 'APPROVED' ? styles.approvedTag : styles.rejectedTag}>
                            {selected.ceoStatus === 'APPROVED' ? 'Approved' : 'Rejected'}
                          </span>
                          {selected.ceoActionAt && (
                            <span className={styles.approvalTime}>{new Date(selected.ceoActionAt).toLocaleString()}</span>
                          )}
                        </div>
                        {selected.ceoComment && (
                          <div className={styles.approvalComment}>"{selected.ceoComment}"</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selected.status === 'CEO_REVIEW' && (
                <div className={styles.detailActions}>
                  <button className={styles.approveBtn} onClick={() => { setActionModal({ wf: selected, type: 'APPROVE' }); setComment('') }}>Approve Request</button>
                  <button className={styles.rejectBtn}  onClick={() => { setActionModal({ wf: selected, type: 'REJECT'  }); setComment('') }}>Reject Request</button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Action Modal */}
      {actionModal && (
        <div className={styles.overlay} onClick={() => setActionModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={`${styles.modalHeader} ${actionModal.type === 'APPROVE' ? styles.modalApprove : styles.modalReject}`}>
              <h3 className={styles.modalTitle}>
                {actionModal.type === 'APPROVE' ? 'Final Approval' : 'Reject Request'}
              </h3>
              <p className={styles.modalSub}>
                {actionModal.type === 'APPROVE'
                  ? 'This will mark the expense as fully approved.'
                  : 'This will reject the expense request.'}
              </p>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalInfo}>
                <strong>{actionModal.wf.name}</strong><br />
                <span>${parseFloat(actionModal.wf.amount).toLocaleString()} &middot; {actionModal.wf.country} &middot; {actionModal.wf.priority}</span><br />
                <span>Submitted by: {actionModal.wf.createdByName}</span>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Comment {actionModal.type === 'REJECT' ? '(required)' : '(optional)'}</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className={styles.textarea}
                  placeholder={actionModal.type === 'APPROVE' ? 'Add a note...' : 'Reason for rejection...'}
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
