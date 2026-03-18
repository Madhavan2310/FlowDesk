import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'

// Role dashboards
import UserDashboard from './pages/user/UserDashboard'
import ManagerDashboard from './pages/manager/ManagerDashboard'
import CeoDashboard from './pages/ceo/CeoDashboard'

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:'14px',color:'var(--gray-500)'}}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" replace />
  return children
}

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'USER') return <Navigate to="/user/dashboard" replace />
  if (user.role === 'MANAGER') return <Navigate to="/manager/dashboard" replace />
  if (user.role === 'CEO') return <Navigate to="/ceo/dashboard" replace />
  return <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/user/dashboard" element={
        <ProtectedRoute allowedRole="USER"><UserDashboard /></ProtectedRoute>
      } />
      <Route path="/manager/dashboard" element={
        <ProtectedRoute allowedRole="MANAGER"><ManagerDashboard /></ProtectedRoute>
      } />
      <Route path="/ceo/dashboard" element={
        <ProtectedRoute allowedRole="CEO"><CeoDashboard /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              borderRadius: '10px',
              border: '1px solid var(--gray-200)',
              boxShadow: 'var(--shadow-lg)',
            },
            success: { iconTheme: { primary: 'var(--green-600)', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
