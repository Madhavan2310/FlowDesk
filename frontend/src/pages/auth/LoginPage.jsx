import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import styles from './Auth.module.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', role: 'USER' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.login({ email: form.email, password: form.password })
      const data = res.data
      if (data.role !== form.role) {
        toast.error(`This account is a ${data.role}, not a ${form.role}`)
        setLoading(false)
        return
      }
      login(data, data.token)
      toast.success(`Welcome back, ${data.fullName}!`)
      if (data.role === 'USER') navigate('/user/dashboard')
      else if (data.role === 'MANAGER') navigate('/manager/dashboard')
      else if (data.role === 'CEO') navigate('/ceo/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const roleLabels = { USER: 'Employee', MANAGER: 'Manager', CEO: 'CEO' }

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <div className={styles.brandArea}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>FD</div>
            <span className={styles.logoText}>FlowDesk</span>
          </div>
          <h1 className={styles.heroTitle}>Streamline your<br/>expense approvals</h1>
          <p className={styles.heroSub}>A smart workflow engine for teams that move fast.</p>
          <div className={styles.heroStats}>
            <div className={styles.stat}><span className={styles.statNum}>3</span><span className={styles.statLabel}>Approval levels</span></div>
            <div className={styles.statDivider}/>
            <div className={styles.stat}><span className={styles.statNum}>Multi</span><span className={styles.statLabel}>Role access</span></div>
            <div className={styles.statDivider}/>
            <div className={styles.stat}><span className={styles.statNum}>100%</span><span className={styles.statLabel}>Transparent</span></div>
          </div>
        </div>
      </div>

      <div className={styles.authRight}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Sign in</h2>
            <p className={styles.formSub}>Select your role to continue</p>
          </div>

          <div className={styles.roleSelector}>
            {['USER', 'MANAGER', 'CEO'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setForm(f => ({ ...f, role: r }))}
                className={`${styles.roleBtn} ${form.role === r ? styles.roleBtnActive : ''}`}
              >
                <span className={styles.roleDot} />
                <span>{roleLabels[r]}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Email address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={styles.input}
                placeholder="you@example.com"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className={styles.input}
                placeholder="Enter your password"
              />
            </div>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? <span className={styles.spinner}/> : null}
              {loading ? 'Signing in...' : `Sign in as ${roleLabels[form.role]}`}
            </button>
          </form>

          <p className={styles.switchLink}>
            Don't have an account? <Link to="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
