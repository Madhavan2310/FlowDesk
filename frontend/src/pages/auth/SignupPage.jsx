import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import styles from './Auth.module.css'

export default function SignupPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', role: 'USER' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.register(form)
      const data = res.data
      login(data, data.token)
      toast.success(`Account created! Welcome, ${data.fullName}!`)
      if (data.role === 'USER') navigate('/user/dashboard')
      else if (data.role === 'MANAGER') navigate('/manager/dashboard')
      else if (data.role === 'CEO') navigate('/ceo/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))
  const roleLabels = { USER: 'Employee', MANAGER: 'Manager', CEO: 'CEO' }
  const roleDescs = {
    USER: 'Submit expense requests',
    MANAGER: 'Review and approve requests',
    CEO: 'Final approval authority'
  }

  const features = [
    'Real-time approval tracking',
    'Multi-level authorization',
    'Full audit trail',
    'Instant notifications',
  ]

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <div className={styles.brandArea}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>FD</div>
            <span className={styles.logoText}>FlowDesk</span>
          </div>
          <h1 className={styles.heroTitle}>Join your team's<br/>workflow today</h1>
          <p className={styles.heroSub}>Create your account and start managing expenses efficiently.</p>
          <div className={styles.featureList}>
            {features.map(f => (
              <div key={f} className={styles.feature}>
                <span className={styles.featureCheck}>&#10003;</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.authRight}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Create account</h2>
            <p className={styles.formSub}>Choose your role in the organization</p>
          </div>

          <div className={styles.roleSelector}>
            {['USER', 'MANAGER', 'CEO'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setForm(f => ({ ...f, role: r }))}
                className={`${styles.roleBtn} ${form.role === r ? styles.roleBtnActive : ''}`}
                title={roleDescs[r]}
              >
                <span className={styles.roleDot} />
                <span>{roleLabels[r]}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label className={styles.label}>Full name</label>
                <input type="text" required value={form.fullName} onChange={set('fullName')} className={styles.input} placeholder="John Doe" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Username</label>
                <input type="text" required value={form.username} onChange={set('username')} className={styles.input} placeholder="johndoe" />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email address</label>
              <input type="email" required value={form.email} onChange={set('email')} className={styles.input} placeholder="you@example.com" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input type="password" required value={form.password} onChange={set('password')} className={styles.input} placeholder="Min. 6 characters" minLength={6} />
            </div>
            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? <span className={styles.spinner}/> : null}
              {loading ? 'Creating account...' : `Create ${roleLabels[form.role]} account`}
            </button>
          </form>

          <p className={styles.switchLink}>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
