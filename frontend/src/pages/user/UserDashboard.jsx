import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { workflowAPI } from '../../services/api'
import Navbar from '../../components/Navbar'
import StatusBadge from '../../components/StatusBadge'
import WorkflowSteps from '../../components/WorkflowSteps'
import styles from './UserDashboard.module.css'

const priorities = ['HIGH', 'MEDIUM', 'LOW']
const countries = ['US', 'IN', 'UK', 'DE', 'FR', 'AU', 'CA', 'JP', 'SG', 'AE']

export default function UserDashboard() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', amount: '', country: 'US', department: '', priority: 'MEDIUM' })

  const fetchWorkflows = async () => {
    try {
      const res = await workflowAPI.getMyWorkflows()
      setWorkflows(res.data)
    } catch {
      toast.error('Failed to load workflows')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWorkflows() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await workflowAPI.create({ ...form, amount: parseFloat(form.amount) })
      toast.success('Workflow submitted!')
      setShowCreate(false)
      setForm({ name: '', amount: '', country: 'US', department: '', priority: 'MEDIUM' })
      fetchWorkflows()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create')
    } finally {
      setCreating(false)
    }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const stats = {
    total: workflows.length,
    pending: workflows.filter(w => w.status === 'PENDING').length,
    inReview: workflows.filter(w => ['MANAGER_REVIEW', 'CEO_REVIEW'].includes(w.status)).length,
    approved: workflows.filter(w => w.status === 'APPROVED').length,
    rejected: workflows.filter(w => w.status === 'REJECTED').length,
  }

  const handleSelect = async (wf) => {
    try {
      const res = await workflowAPI.getById(wf.id)
      setSelected(res.data)
    } catch {
      setSelected(wf)
    }
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>My Expense Requests</h1>
            <p className={styles.pageSub}>Track all your submitted expense workflows</p>
          </div>
          <button onClick={() => setShowCreate(true)} className={styles.createBtn}>
            + New Request
          </button>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          {[
            { label: 'Total',     value: stats.total,    color: 'default' },
            { label: 'Pending',   value: stats.pending,  color: 'gray' },
            { label: 'In Review', value: stats.inReview, color: 'yellow' },
            { label: 'Approved',  value: stats.approved, color: 'green' },
            { label: 'Rejected',  value: stats.rejected, color: 'red' },
          ].map(s => (
            <div key={s.label} className={`${styles.statCard} ${styles['stat_' + s.color]}`}>
              <span className={styles.statVal}>{s.value}</span>
              <span className={styles.statLbl}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.contentGrid}>
          {/* Workflow List */}
          <div className={styles.listPanel}>
            <h2 className={styles.panelTitle}>All Requests</h2>
            {loading ? (
              <div className={styles.emptyState}>Loading...</div>
            ) : workflows.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <p>No requests yet</p>
                <button onClick={() => setShowCreate(true)} className={styles.emptyBtn}>Submit your first request</button>
              </div>
            ) : (
              <div className={styles.workflowList}>
                {workflows.map(wf => (
                  <div
                    key={wf.id}
                    onClick={() => handleSelect(wf)}
                    className={`${styles.workflowCard} ${selected?.id === wf.id ? styles.workflowCardActive : ''}`}
                  >
                    <div className={styles.cardTop}>
                      <span className={styles.cardName}>{wf.name}</span>
                      <StatusBadge status={wf.status} />
                    </div>
                    <div className={styles.cardMeta}>
                      <span className={styles.metaItem}>USD {parseFloat(wf.amount).toLocaleString()}</span>
                      <span className={styles.metaDot} />
                      <span className={styles.metaItem}>{wf.country}</span>
                      <span className={styles.metaDot} />
                      <span className={`${styles.metaItem} ${styles['p_' + wf.priority]}`}>{wf.priority}</span>
                    </div>
                    {wf.department && <span className={styles.dept}>{wf.department}</span>}
                    <div className={styles.cardDate}>{new Date(wf.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className={styles.detailPanel}>
            {selected ? (
              <>
                <div className={styles.detailHeader}>
                  <div>
                    <h2 className={styles.detailTitle}>{selected.name}</h2>
                    <div style={{ marginTop: '6px' }}><StatusBadge status={selected.status} /></div>
                  </div>
                  <button onClick={() => setSelected(null)} className={styles.closeBtn}>&#10005;</button>
                </div>

                <div className={styles.detailInfo}>
                  {[
                    { label: 'Amount',     value: `USD ${parseFloat(selected.amount).toLocaleString()}` },
                    { label: 'Country',    value: selected.country },
                    { label: 'Priority',   value: selected.priority },
                    { label: 'Department', value: selected.department || '—' },
                  ].map(item => (
                    <div key={item.label} className={styles.infoRow}>
                      <span className={styles.infoLabel}>{item.label}</span>
                      <span className={styles.infoValue}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <WorkflowSteps workflow={selected} />
              </>
            ) : (
              <div className={styles.detailEmpty}>
                <div className={styles.emptyIcon}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                  </svg>
                </div>
                <p>Select a request to see details and approval progress</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Modal */}
      {showCreate && (
        <div className={styles.overlay} onClick={() => setShowCreate(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>New Expense Request</h2>
              <button onClick={() => setShowCreate(false)} className={styles.closeBtn}>&#10005;</button>
            </div>
            <form onSubmit={handleCreate} className={styles.modalForm}>
              <div className={styles.field}>
                <label className={styles.label}>Request Name</label>
                <input required value={form.name} onChange={set('name')} className={styles.input} placeholder="e.g. Team lunch expense" />
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Amount (USD)</label>
                  <input required type="number" min="0.01" step="0.01" value={form.amount} onChange={set('amount')} className={styles.input} placeholder="250.00" />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Country</label>
                  <select value={form.country} onChange={set('country')} className={styles.input}>
                    {countries.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Department (optional)</label>
                  <input value={form.department} onChange={set('department')} className={styles.input} placeholder="Finance, HR, Engineering..." />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Priority</label>
                  <select value={form.priority} onChange={set('priority')} className={styles.input}>
                    {priorities.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowCreate(false)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" disabled={creating} className={styles.submitBtn}>
                  {creating ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
