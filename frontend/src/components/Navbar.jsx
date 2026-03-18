import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import NotificationBell from './NotificationBell'
import styles from './Navbar.module.css'

const roleConfig = {
  USER:    { label: 'Employee', color: '#16a34a', bg: '#f0fdf4' },
  MANAGER: { label: 'Manager',  color: '#d97706', bg: '#fffbeb' },
  CEO:     { label: 'CEO',      color: '#7c3aed', bg: '#f5f3ff' },
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Signed out successfully')
    navigate('/login')
  }

  const cfg = roleConfig[user?.role] || roleConfig.USER
  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <header className={styles.navbar}>
      <div className={styles.brand}>
        <div className={styles.logoMark}>FD</div>
        <span className={styles.logoText}>FlowDesk</span>
      </div>
      <div className={styles.right}>
        {/* Notification bell — only renders for USER role (handled inside component) */}
        <NotificationBell />

        <div className={styles.userInfo}>
          <div className={styles.avatar} style={{ background: cfg.bg, color: cfg.color }}>
            {initials}
          </div>
          <div className={styles.userMeta}>
            <span className={styles.userName}>{user?.fullName}</span>
            <span className={styles.roleBadge} style={{ background: cfg.bg, color: cfg.color }}>
              {cfg.label}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>Sign out</button>
      </div>
    </header>
  )
}
