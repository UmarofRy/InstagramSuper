import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (Array.isArray(roles) && roles.length > 0 && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}
