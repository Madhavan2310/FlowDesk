import { useState, useEffect, useRef } from 'react'
import { notificationAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import styles from './NotificationBell.module.css'

const typeConfig = {
  MANAGER_APPROVED: { label: 'Manager Approved', color: 'green' },
  MANAGER_REJECTED: { label: 'Manager Rejected', color: 'red'   },
  CEO_APPROVED:     { label: 'CEO Approved',     color: 'green' },
  CEO_REJECTED:     { label: 'CEO Rejected',     color: 'red'   },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)  return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function NotificationBell() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef(null)

  // Only show for USER role
  if (user?.role !== 'USER') return null

  const fetchUnread = async () => {
    try {
      const res = await notificationAPI.getUnreadCount()
      setUnread(res.data.count)
    } catch { /* silent */ }
  }

  const fetchAll = async () => {
    setLoading(true)
    try {
      const res = await notificationAPI.getAll()
      setNotifications(res.data)
      const unreadCount = res.data.filter(n => !n.isRead).length
      setUnread(unreadCount)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  // Poll unread count every 15s
  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 15000)
    return () => clearInterval(interval)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = () => {
    if (!open) fetchAll()
    setOpen(o => !o)
  }

  const handleMarkAll = async () => {
    await notificationAPI.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnread(0)
  }

  const handleMarkOne = async (id) => {
    await notificationAPI.markOneRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
  }

  return (
    <div className={styles.wrapper} ref={panelRef}>
      <button className={styles.bell} onClick={handleOpen} aria-label="Notifications">
        {/* Bell SVG */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className={styles.badge}>{unread > 99 ? '99+' : unread}</span>
        )}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Notifications</span>
            {unread > 0 && (
              <button onClick={handleMarkAll} className={styles.markAllBtn}>
                Mark all read
              </button>
            )}
          </div>

          <div className={styles.list}>
            {loading ? (
              <div className={styles.empty}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div className={styles.empty}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const cfg = typeConfig[n.type] || { label: n.type, color: 'gray' }
                return (
                  <div
                    key={n.id}
                    className={`${styles.item} ${!n.isRead ? styles.itemUnread : ''}`}
                    onClick={() => !n.isRead && handleMarkOne(n.id)}
                  >
                    <div className={styles.itemLeft}>
                      <span className={`${styles.dot} ${styles['dot_' + cfg.color]}`} />
                    </div>
                    <div className={styles.itemBody}>
                      <div className={styles.itemHeader}>
                        <span className={`${styles.typeTag} ${styles['tag_' + cfg.color]}`}>
                          {cfg.label}
                        </span>
                        <span className={styles.timeAgo}>{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className={styles.itemTitle}>{n.title}</p>
                      <p className={styles.itemMsg}>{n.message}</p>
                      <p className={styles.workflowRef}>Request: {n.workflowName}</p>
                    </div>
                    {!n.isRead && <span className={styles.unreadDot} />}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
